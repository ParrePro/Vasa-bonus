import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { query } from '../db';

const router = Router();

// Get email notification settings for all classes of the teacher
router.get('/email-settings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all classes where the user is a teacher and their email settings
    const result = await query(
      `SELECT cm.class_id, c.name, 
              COALESCE(cm.receive_email_notifications, TRUE) as receive_email_notifications
       FROM class_members cm
       JOIN classes c ON c.id = cm.class_id
       WHERE cm.user_id = $1 AND cm.is_teacher = TRUE
       ORDER BY c.name`,
      [userId]
    );

    const settings = result.rows.map((row: any) => ({
      classId: row.class_id,
      className: row.name,
      receiveNotifications: row.receive_email_notifications,
    }));

    res.json(settings);
  } catch (error) {
    console.error('Error fetching email settings:', error);
    res.status(500).json({ error: 'Failed to fetch email settings' });
  }
});

// Save email notification settings for classes
router.post('/email-settings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { settings } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    // Update email notification preference for each class
    for (const setting of settings) {
      const { classId, receiveNotifications } = setting;

      // Verify that the user is a teacher in this class
      const verifyResult = await query(
        `SELECT id FROM class_members 
         WHERE user_id = $1 AND class_id = $2 AND is_teacher = TRUE`,
        [userId, classId]
      );

      if (verifyResult.rows.length === 0) {
        continue; // Skip if user is not a teacher in this class
      }

      // Update the email notification preference
      await query(
        `UPDATE class_members 
         SET receive_email_notifications = $1 
         WHERE user_id = $2 AND class_id = $3`,
        [receiveNotifications, userId, classId]
      );
    }

    res.json({ success: true, message: 'Email settings saved' });
  } catch (error) {
    console.error('Error saving email settings:', error);
    res.status(500).json({ error: 'Failed to save email settings' });
  }
});

export default router;
