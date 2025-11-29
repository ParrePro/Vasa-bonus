import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { query } from '../db';

const router = Router();

// Handle RPC calls to PostgreSQL functions
router.post('/:functionName', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { functionName } = req.params;
    const params = req.body;
    const userId = req.user?.id;

    // Whitelist allowed functions
    const allowedFunctions = [
      'is_developer',
      'is_teacher',
      'is_student',
      'calculate_student_points',
      'get_class_stats',
      'get_school_stats',
    ];

    if (!allowedFunctions.includes(functionName)) {
      return res.status(400).json({ error: 'Invalid function' });
    }

    // Example implementations for common RPC functions
    if (functionName === 'is_developer') {
      const result = await query(
        `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
        [params._user_id || userId]
      );
      return res.json(result.rows.length > 0);
    }

    if (functionName === 'is_teacher') {
      const result = await query(
        `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'teacher'`,
        [params._user_id || userId]
      );
      return res.json(result.rows.length > 0);
    }

    if (functionName === 'is_student') {
      const result = await query(
        `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'student'`,
        [params._user_id || userId]
      );
      return res.json(result.rows.length > 0);
    }

    if (functionName === 'calculate_student_points') {
      const result = await query(
        `SELECT COALESCE(SUM(points), 0) as total_points 
         FROM points_transactions 
         WHERE student_id = $1`,
        [params._student_id]
      );
      return res.json({ total_points: result.rows[0].total_points });
    }

    if (functionName === 'get_class_stats') {
      const result = await query(
        `SELECT 
          COUNT(DISTINCT cm.user_id) as member_count,
          COALESCE(SUM(pt.points), 0) as total_points
         FROM class_members cm
         LEFT JOIN points_transactions pt ON cm.class_id = pt.class_id
         WHERE cm.class_id = $1`,
        [params._class_id]
      );
      return res.json(result.rows[0]);
    }

    res.status(400).json({ error: 'Function not implemented' });
  } catch (error) {
    console.error('RPC error:', error);
    res.status(500).json({ error: 'Failed to execute RPC' });
  }
});

export default router;
