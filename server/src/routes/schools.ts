import { Router } from 'express';
import { authMiddleware, AuthRequest, comparePassword } from '../auth';
import { query } from '../db';

const router = Router();

// Hardcoded developer mode password
const DEVELOPER_MODE_PASSWORD = "Hjärtatclutchar";

// Generate a random school code
function generateSchoolCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new school
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'School name is required' });
    }

    const code = generateSchoolCode();

    const result = await query(
      `INSERT INTO schools (name, code, created_by) VALUES ($1, $2, $3) RETURNING id, name, code`,
      [name, code, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
});

// Get all schools (for developer)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is developer
    const isDeveloper = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );

    if (isDeveloper.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await query(
      `SELECT id, name, code, created_at FROM schools ORDER BY created_at DESC`,
      []
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to get schools' });
  }
});

// Get a specific school
router.get('/:schoolId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { schoolId } = req.params;

    const result = await query(
      `SELECT id, name, code, created_at FROM schools WHERE id = $1`,
      [schoolId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ error: 'Failed to get school' });
  }
});

// Rename a school (developer only)
router.patch('/:schoolId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { schoolId } = req.params;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'School name is required' });
    }

    // Check if user is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );

    if (devResult.rows.length === 0) {
      return res.status(403).json({ error: 'Only developers can rename schools' });
    }

    // Check if school exists
    const schoolResult = await query(
      `SELECT id FROM schools WHERE id = $1`,
      [schoolId]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Update school name
    const result = await query(
      `UPDATE schools SET name = $1 WHERE id = $2 RETURNING id, name, code, created_at`,
      [name.trim(), schoolId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Rename school error:', error);
    res.status(500).json({ error: 'Failed to rename school' });
  }
});

// Delete a school (requires both account password and developer password)
router.delete('/:schoolId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { schoolId } = req.params;
    const { password, developerPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Account password is required' });
    }

    if (!developerPassword) {
      return res.status(400).json({ error: 'Developer password is required' });
    }

    // Verify account password
    const userResult = await query(
      `SELECT password FROM auth_users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await comparePassword(password, userResult.rows[0].password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect account password' });
    }

    // Check if user is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );

    if (devResult.rows.length === 0) {
      return res.status(403).json({ error: 'Only developers can delete schools' });
    }

    // Verify developer mode password
    if (developerPassword !== DEVELOPER_MODE_PASSWORD) {
      return res.status(401).json({ error: 'Incorrect developer password' });
    }

    // Check if school exists
    const schoolResult = await query(
      `SELECT id FROM schools WHERE id = $1`,
      [schoolId]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Delete school - CASCADE will handle classes and related data
    await query(`DELETE FROM schools WHERE id = $1`, [schoolId]);

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

// Get teacher leaderboard for a school (which teachers give the most points)
router.get('/:schoolId/teacher-leaderboard', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { schoolId } = req.params;

    // Get teacher leaderboard: teachers ranked by total points given in the school
    const result = await query(
      `SELECT 
        pt.teacher_id,
        p.name as teacher_name,
        COUNT(pt.id) as total_transactions,
        SUM(pt.points) as total_points_given
      FROM points_transactions pt
      JOIN auth_users au ON pt.teacher_id = au.id
      JOIN profiles p ON pt.teacher_id = p.id
      JOIN classes c ON pt.class_id = c.id
      WHERE c.school_id = $1
      GROUP BY pt.teacher_id, p.name, au.id
      ORDER BY total_points_given DESC`,
      [schoolId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get teacher leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get teacher leaderboard' });
  }
});

export default router;
