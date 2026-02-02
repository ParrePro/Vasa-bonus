import { Router } from 'express';
import { authMiddleware, AuthRequest, comparePassword } from '../auth';
import { query } from '../db';

const router = Router();

// Helper function to generate class code
function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate a class code
router.post('/generate-code', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const code = generateClassCode();
    res.json({ code });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Get all classes for a user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.query.school_id as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );
    const isDeveloper = devResult.rows.length > 0;

    let result;
    
    if (isDeveloper && schoolId) {
      // Developers can see all classes in a school
      result = await query(
        `SELECT c.*, s.name as school_name FROM classes c 
         LEFT JOIN schools s ON c.school_id = s.id 
         WHERE c.school_id = $1 ORDER BY c.created_at DESC`,
        [schoolId]
      );
    } else if (isDeveloper && !schoolId) {
      // Developers can see all classes
      result = await query(
        `SELECT c.*, s.name as school_name FROM classes c 
         LEFT JOIN schools s ON c.school_id = s.id 
         ORDER BY c.created_at DESC`,
        []
      );
    } else {
      // Regular users only see classes they're members of
      let queryStr = `SELECT c.*, s.name as school_name FROM classes c
                      JOIN class_members cm ON c.id = cm.class_id
                      LEFT JOIN schools s ON c.school_id = s.id
                      WHERE cm.user_id = $1`;
      const params: any[] = [userId];

      if (schoolId) {
        queryStr += ` AND c.school_id = $2`;
        params.push(schoolId);
      }

      result = await query(queryStr, params);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to get classes' });
  }
});

// Create a new class
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get teacher's school_id from user_roles
    const roleResult = await query(
      `SELECT school_id FROM user_roles WHERE user_id = $1 AND role = 'teacher'`,
      [userId]
    );

    if (roleResult.rows.length === 0 || !roleResult.rows[0].school_id) {
      return res.status(400).json({ error: 'No school associated with this teacher' });
    }

    const schoolId = roleResult.rows[0].school_id;

    const result = await query(
      `INSERT INTO classes (name, code, mentor_id, school_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, code, userId, schoolId]
    );

    const classId = result.rows[0].id;

    // Add creator as a member
    await query(
      `INSERT INTO class_members (class_id, user_id, is_teacher) 
       VALUES ($1, $2, true)`,
      [classId, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Get class details
router.get('/:classId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { classId } = req.params;

    const result = await query(
      `SELECT * FROM classes WHERE id = $1`,
      [classId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to get class' });
  }
});

// Get class members
router.get('/:classId/members', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { classId } = req.params;

    const result = await query(
      `SELECT cm.*, au.email, p.name FROM class_members cm
       JOIN auth_users au ON cm.user_id = au.id
       JOIN profiles p ON cm.user_id = p.id
       WHERE cm.class_id = $1`,
      [classId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

// Add a member to a class
router.post('/:classId/members', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { classId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const result = await query(
      `INSERT INTO class_members (class_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (class_id, user_id) DO NOTHING
       RETURNING *`,
      [classId, userId]
    );

    res.json(result.rows[0] || { message: 'Member already exists' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Rename a class
router.patch('/:classId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { classId } = req.params;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Class name is required' });
    }

    // Check if user has permission (is mentor, teacher of the class, or developer)
    const classResult = await query(
      `SELECT c.*, cm.is_teacher FROM classes c
       LEFT JOIN class_members cm ON c.id = cm.class_id AND cm.user_id = $1
       WHERE c.id = $2`,
      [userId, classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const classData = classResult.rows[0];
    const isMentor = classData.mentor_id === userId;
    const isTeacher = classData.is_teacher === true;
    
    // Check if user is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );
    const isDeveloper = devResult.rows.length > 0;

    if (!isMentor && !isTeacher && !isDeveloper) {
      return res.status(403).json({ error: 'You do not have permission to rename this class' });
    }

    // Update class name
    const result = await query(
      `UPDATE classes SET name = $1 WHERE id = $2 RETURNING *`,
      [name.trim(), classId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Rename class error:', error);
    res.status(500).json({ error: 'Failed to rename class' });
  }
});

// Delete a class (requires password verification)
router.delete('/:classId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { classId } = req.params;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Verify password
    const userResult = await query(
      `SELECT password FROM auth_users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await comparePassword(password, userResult.rows[0].password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if user has permission to delete (is mentor, developer, or teacher of the class)
    const classResult = await query(
      `SELECT c.*, cm.is_teacher FROM classes c
       LEFT JOIN class_members cm ON c.id = cm.class_id AND cm.user_id = $1
       WHERE c.id = $2`,
      [userId, classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const classData = classResult.rows[0];
    
    // Check if user is the mentor or a teacher of this class
    const isMentor = classData.mentor_id === userId;
    const isTeacher = classData.is_teacher === true;
    
    // Also check if user is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );
    const isDeveloper = devResult.rows.length > 0;

    if (!isMentor && !isTeacher && !isDeveloper) {
      return res.status(403).json({ error: 'You do not have permission to delete this class' });
    }

    // Delete class - CASCADE will handle related records
    await query(`DELETE FROM classes WHERE id = $1`, [classId]);

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Get teachers for one or more classes (for teacher selection in rewards/campaigns)
router.post('/get-teachers', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { classIds } = req.body;

    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ error: 'classIds array is required' });
    }

    // Get unique teachers from the specified classes
    const placeholders = classIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await query(
      `SELECT DISTINCT 
        cm.user_id,
        p.name,
        au.email
       FROM class_members cm
       JOIN profiles p ON cm.user_id = p.id
       JOIN auth_users au ON cm.user_id = au.id
       WHERE cm.class_id IN (${placeholders}) 
         AND cm.is_teacher = true
       ORDER BY p.name ASC`,
      classIds
    );

    const teachers = result.rows.map(row => ({
      id: row.user_id,
      name: row.name,
      email: row.email,
    }));

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Failed to get teachers' });
  }
});

// Get teacher permissions for a class
router.get('/:classId/teachers', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { classId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is mentor or developer
    const classResult = await query(
      `SELECT mentor_id FROM classes WHERE id = $1`,
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isMentor = classResult.rows[0].mentor_id === userId;

    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );
    const isDeveloper = devResult.rows.length > 0;

    if (!isMentor && !isDeveloper) {
      return res.status(403).json({ error: 'Only mentors and developers can view teacher permissions' });
    }

    // Get all teachers in the class with their permissions
    const result = await query(
      `SELECT 
        cm.id,
        cm.user_id,
        cm.is_teacher,
        cm.can_give_points,
        cm.can_add_rewards,
        cm.can_add_campaigns,
        cm.can_fulfill_rewards,
        cm.can_fulfill_campaigns,
        cm.can_remove_students,
        p.name,
        au.email
       FROM class_members cm
       JOIN profiles p ON cm.user_id = p.id
       JOIN auth_users au ON cm.user_id = au.id
       WHERE cm.class_id = $1 AND cm.is_teacher = true`,
      [classId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Failed to get teachers' });
  }
});

// Update teacher permissions
router.patch('/:classId/teachers/:teacherId/permissions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { classId, teacherId } = req.params;
    const { 
      can_give_points, 
      can_add_rewards, 
      can_add_campaigns, 
      can_fulfill_rewards, 
      can_fulfill_campaigns, 
      can_remove_students 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is mentor or developer
    const classResult = await query(
      `SELECT mentor_id FROM classes WHERE id = $1`,
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isMentor = classResult.rows[0].mentor_id === userId;

    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );
    const isDeveloper = devResult.rows.length > 0;

    if (!isMentor && !isDeveloper) {
      return res.status(403).json({ error: 'Only mentors and developers can update teacher permissions' });
    }

    // Prevent modifying mentor's own permissions (mentor always has full access)
    if (teacherId === classResult.rows[0].mentor_id) {
      return res.status(400).json({ error: 'Cannot modify mentor permissions' });
    }

    // Update permissions
    const result = await query(
      `UPDATE class_members 
       SET 
         can_give_points = COALESCE($1, can_give_points),
         can_add_rewards = COALESCE($2, can_add_rewards),
         can_add_campaigns = COALESCE($3, can_add_campaigns),
         can_fulfill_rewards = COALESCE($4, can_fulfill_rewards),
         can_fulfill_campaigns = COALESCE($5, can_fulfill_campaigns),
         can_remove_students = COALESCE($6, can_remove_students)
       WHERE class_id = $7 AND user_id = $8 AND is_teacher = true
       RETURNING *`,
      [
        can_give_points,
        can_add_rewards,
        can_add_campaigns,
        can_fulfill_rewards,
        can_fulfill_campaigns,
        can_remove_students,
        classId,
        teacherId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found in this class' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

// Transfer mentor role to another teacher
router.post('/:classId/transfer-mentor', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { classId } = req.params;
    const { newMentorId, password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!newMentorId || !password) {
      return res.status(400).json({ error: 'New mentor ID and password are required' });
    }

    // Check if current user is the mentor of this class
    const classResult = await query(
      `SELECT mentor_id FROM classes WHERE id = $1`,
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const currentMentorId = classResult.rows[0].mentor_id;

    // Allow mentor or developer to transfer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );
    const isDeveloper = devResult.rows.length > 0;

    if (currentMentorId !== userId && !isDeveloper) {
      return res.status(403).json({ error: 'Only the current mentor or a developer can transfer mentor role' });
    }

    // Verify password
    const userResult = await query(
      `SELECT password FROM auth_users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await comparePassword(password, userResult.rows[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if new mentor is a teacher in this class
    const teacherCheck = await query(
      `SELECT user_id FROM class_members WHERE class_id = $1 AND user_id = $2 AND is_teacher = true`,
      [classId, newMentorId]
    );

    if (teacherCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Selected user is not a teacher in this class' });
    }

    // Transfer mentor role
    await query(
      `UPDATE classes SET mentor_id = $1 WHERE id = $2`,
      [newMentorId, classId]
    );

    // Reset permissions for the old mentor (now a regular teacher) to defaults
    await query(
      `UPDATE class_members 
       SET can_give_points = true, 
           can_add_rewards = true, 
           can_add_campaigns = true, 
           can_fulfill_rewards = true, 
           can_fulfill_campaigns = true, 
           can_remove_students = false 
       WHERE class_id = $1 AND user_id = $2`,
      [classId, currentMentorId]
    );

    res.json({ success: true, message: 'Mentor role transferred successfully' });
  } catch (error) {
    console.error('Transfer mentor error:', error);
    res.status(500).json({ error: 'Failed to transfer mentor role' });
  }
});

// Get current user's permissions for a class
router.get('/:classId/my-permissions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { classId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is mentor (mentor has all permissions)
    const classResult = await query(
      `SELECT mentor_id FROM classes WHERE id = $1`,
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isMentor = classResult.rows[0].mentor_id === userId;

    // Check if user is developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );
    const isDeveloper = devResult.rows.length > 0;

    // Mentor and developers have all permissions
    if (isMentor || isDeveloper) {
      return res.json({
        is_mentor: isMentor,
        is_developer: isDeveloper,
        can_give_points: true,
        can_add_rewards: true,
        can_add_campaigns: true,
        can_fulfill_rewards: true,
        can_fulfill_campaigns: true,
        can_remove_students: true,
        can_manage_permissions: true
      });
    }

    // Get teacher's permissions
    const result = await query(
      `SELECT 
        can_give_points,
        can_add_rewards,
        can_add_campaigns,
        can_fulfill_rewards,
        can_fulfill_campaigns,
        can_remove_students
       FROM class_members 
       WHERE class_id = $1 AND user_id = $2 AND is_teacher = true`,
      [classId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'You are not a teacher in this class' });
    }

    res.json({
      is_mentor: false,
      is_developer: false,
      ...result.rows[0],
      can_manage_permissions: false
    });
  } catch (error) {
    console.error('Get my permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

export default router;
