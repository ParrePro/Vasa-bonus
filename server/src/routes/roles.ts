import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { query } from '../db';

const router = Router();

// Check if user has a role
router.get('/check', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ hasRole: false, role: null });
    }

    return res.json({ hasRole: true, role: result.rows[0].role });
  } catch (error) {
    console.error('Check role error:', error);
    res.status(500).json({ error: 'Failed to check role' });
  }
});

// Assign a student role
router.post('/student', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user already has a role
    const existingRole = await query(
      `SELECT role FROM user_roles WHERE user_id = $1`,
      [userId]
    );

    if (existingRole.rows.length > 0) {
      return res.status(400).json({ error: 'User already has a role' });
    }

    // Insert student role
    await query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [userId, 'student']
    );

    res.json({ success: true, role: 'student' });
  } catch (error) {
    console.error('Assign student role error:', error);
    res.status(500).json({ error: 'Failed to assign student role' });
  }
});

// Assign a teacher role
router.post('/teacher', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { schoolCode } = req.body;

    if (!schoolCode) {
      return res.status(400).json({ error: 'School code is required' });
    }

    // Check if user already has a role
    const existingRole = await query(
      `SELECT role FROM user_roles WHERE user_id = $1`,
      [userId]
    );

    if (existingRole.rows.length > 0) {
      return res.status(400).json({ error: 'User already has a role' });
    }

    // Find the school by code
    const schoolResult = await query(
      `SELECT id FROM schools WHERE code = $1`,
      [schoolCode]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid school code' });
    }

    const schoolId = schoolResult.rows[0].id;

    // Insert teacher role with school association
    await query(
      `INSERT INTO user_roles (user_id, role, school_id) VALUES ($1, $2, $3)`,
      [userId, 'teacher', schoolId]
    );

    res.json({ success: true, role: 'teacher', schoolId });
  } catch (error) {
    console.error('Assign teacher role error:', error);
    res.status(500).json({ error: 'Failed to assign teacher role' });
  }
});

// Assign a developer role
router.post('/developer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // For now, we'll just assign the developer role
    const existingRole = await query(
      `SELECT role FROM user_roles WHERE user_id = $1`,
      [userId]
    );

    if (existingRole.rows.length > 0) {
      return res.status(400).json({ error: 'User already has a role' });
    }

    await query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [userId, 'developer']
    );

    res.json({ success: true, role: 'developer' });
  } catch (error) {
    console.error('Assign developer role error:', error);
    res.status(500).json({ error: 'Failed to assign developer role' });
  }
});

export default router;
