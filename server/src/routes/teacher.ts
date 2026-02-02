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

    console.log('Saving email settings for user:', userId, 'Settings:', JSON.stringify(settings));

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!settings || !Array.isArray(settings)) {
      console.error('Invalid settings format:', settings);
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    if (settings.length === 0) {
      return res.status(400).json({ error: 'No settings provided' });
    }

    let updateCount = 0;
    const errors: string[] = [];

    // Update email notification preference for each class
    for (const setting of settings) {
      try {
        const { classId, receiveNotifications } = setting;
        
        if (!classId) {
          errors.push('Missing classId in setting');
          continue;
        }
        
        // Ensure receiveNotifications is a boolean - handle string values
        let notificationStatus: boolean;
        if (typeof receiveNotifications === 'string') {
          notificationStatus = receiveNotifications.toLowerCase() === 'true';
        } else {
          notificationStatus = Boolean(receiveNotifications);
        }
        
        console.log(`Updating settings for class ${classId}: receiveNotifications = ${notificationStatus}`);

        // Verify that the user is a teacher in this class
        const verifyResult = await query(
          `SELECT id FROM class_members 
           WHERE user_id = $1 AND class_id = $2 AND is_teacher = TRUE`,
          [userId, classId]
        );

        if (verifyResult.rows.length === 0) {
          console.warn(`User ${userId} is not a teacher in class ${classId}, skipping`);
          continue; // Skip if user is not a teacher in this class
        }

        // Update the email notification preference
        const updateResult = await query(
          `UPDATE class_members 
           SET receive_email_notifications = $1 
           WHERE user_id = $2 AND class_id = $3`,
          [notificationStatus, userId, classId]
        );
        
        if (updateResult.rowCount && updateResult.rowCount > 0) {
          updateCount++;
          console.log(`Updated class ${classId} for user ${userId}`);
        } else {
          console.warn(`No rows updated for class ${classId} for user ${userId}`);
          errors.push(`No rows updated for class ${classId}`);
        }
      } catch (loopError: any) {
        const errorMsg = `Error updating class: ${loopError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    if (updateCount === 0) {
      // Check if we have errors to report
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Failed to update settings', details: errors });
      }
      // If no updates and no errors, it means all settings were skipped during verification
      return res.status(400).json({ error: 'No classes found or user is not a teacher in any provided classes' });
    }

    res.json({ 
      success: true, 
      message: `Email settings saved (${updateCount} classes updated)`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Error saving email settings:', error);
    res.status(500).json({ 
      error: 'Failed to save email settings', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
