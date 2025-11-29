import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { query } from '../db';

const router = Router();

// Get points transactions for a student
router.get('/student/:studentId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;

    const result = await query(
      `SELECT pt.*, t.name as teacher_name, c.name as class_name
       FROM points_transactions pt
       JOIN auth_users au ON pt.teacher_id = au.id
       JOIN profiles t ON pt.teacher_id = t.id
       JOIN classes c ON pt.class_id = c.id
       WHERE pt.student_id = $1
       ORDER BY pt.created_at DESC`,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Add points to a student
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { studentId, classId, points, reason } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!studentId || !classId || !points || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Add points transaction
    const result = await query(
      `INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, teacherId, classId, points, reason]
    );

    // If student gained at least 1 point, award 1 tier point
    if (points > 0) {
      await query(
        `UPDATE profiles 
         SET tier_points = tier_points + 1
         WHERE id = $1`,
        [studentId]
      );

      // Check new tier and update if needed
      const tierResult = await query(
        `SELECT tier_points FROM profiles WHERE id = $1`,
        [studentId]
      );

      const tierPoints = tierResult.rows[0]?.tier_points || 0;
      let newTier = 'basic';

      if (tierPoints >= 200) {
        newTier = 'ruby';
      } else if (tierPoints >= 100) {
        newTier = 'gold';
      } else if (tierPoints >= 50) {
        newTier = 'silver';
      }

      await query(
        `UPDATE profiles SET current_tier = $1 WHERE id = $2`,
        [newTier, studentId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

// Get total points for a student
router.get('/total/:studentId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;

    const result = await query(
      `SELECT SUM(points) as total_points FROM points_transactions
       WHERE student_id = $1`,
      [studentId]
    );

    res.json({ totalPoints: result.rows[0].total_points || 0 });
  } catch (error) {
    console.error('Get total points error:', error);
    res.status(500).json({ error: 'Failed to get total points' });
  }
});

// Bulk add points to multiple students
router.post('/bulk', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { studentIds, classId, points, reason } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'No students selected' });
    }

    if (!classId || !points || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const results = [];

    for (const studentId of studentIds) {
      // Add points transaction
      const result = await query(
        `INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [studentId, teacherId, classId, points, reason]
      );

      results.push(result.rows[0]);

      // If student gained at least 1 point, award 1 tier point
      if (points > 0) {
        await query(
          `UPDATE profiles 
           SET tier_points = tier_points + 1
           WHERE id = $1`,
          [studentId]
        );

        // Check new tier and update if needed
        const tierResult = await query(
          `SELECT tier_points FROM profiles WHERE id = $1`,
          [studentId]
        );

        const tierPoints = tierResult.rows[0]?.tier_points || 0;
        let newTier = 'basic';

        if (tierPoints >= 200) {
          newTier = 'ruby';
        } else if (tierPoints >= 100) {
          newTier = 'gold';
        } else if (tierPoints >= 50) {
          newTier = 'silver';
        }

        await query(
          `UPDATE profiles SET current_tier = $1 WHERE id = $2`,
          [newTier, studentId]
        );
      }
    }

    res.json({ success: true, count: results.length, transactions: results });
  } catch (error) {
    console.error('Bulk add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

// Get favorites for a teacher in a class
router.get('/favorites/:classId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const teacherId = req.user?.id;
    const { classId } = req.params;

    if (!teacherId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await query(
      `SELECT student_id FROM student_favorites 
       WHERE teacher_id = $1 AND class_id = $2`,
      [teacherId, classId]
    );

    res.json(result.rows.map(r => r.student_id));
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Toggle favorite status for a student
router.post('/favorites/toggle', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const teacherId = req.user?.id;
    const { studentId, classId } = req.body;

    if (!teacherId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!studentId || !classId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already a favorite
    const existing = await query(
      `SELECT id FROM student_favorites 
       WHERE teacher_id = $1 AND student_id = $2 AND class_id = $3`,
      [teacherId, studentId, classId]
    );

    if (existing.rows.length > 0) {
      // Remove from favorites
      await query(
        `DELETE FROM student_favorites 
         WHERE teacher_id = $1 AND student_id = $2 AND class_id = $3`,
        [teacherId, studentId, classId]
      );
      res.json({ isFavorite: false });
    } else {
      // Add to favorites
      await query(
        `INSERT INTO student_favorites (teacher_id, student_id, class_id) 
         VALUES ($1, $2, $3)`,
        [teacherId, studentId, classId]
      );
      res.json({ isFavorite: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

export default router;
