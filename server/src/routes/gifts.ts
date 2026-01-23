import { Router } from 'express';
import { authMiddleware, AuthRequest, comparePassword } from '../auth';
import { query } from '../db';
import { sendEmail, getRewardRequestEmail } from '../email';

const router = Router();

// Gift points to another student
router.post('/points', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { recipientId, classId, points, password } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!recipientId || !classId || !points || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (points <= 0) {
      return res.status(400).json({ error: 'Points must be positive' });
    }

    if (recipientId === senderId) {
      return res.status(400).json({ error: 'Cannot gift points to yourself' });
    }

    // Verify password
    const userResult = await query(
      `SELECT password FROM auth_users WHERE id = $1`,
      [senderId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const passwordValid = await comparePassword(password, userResult.rows[0].password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check sender has enough points in this class
    const senderPointsResult = await query(
      `SELECT COALESCE(SUM(points), 0) as total_points 
       FROM points_transactions 
       WHERE student_id = $1 AND class_id = $2`,
      [senderId, classId]
    );

    const senderPoints = parseInt(senderPointsResult.rows[0].total_points);
    if (senderPoints < points) {
      return res.status(400).json({ error: 'Not enough points to gift' });
    }

    // Both users must be in the same class
    const classCheckResult = await query(
      `SELECT COUNT(*) as count FROM class_members 
       WHERE class_id = $1 AND user_id IN ($2, $3) AND is_teacher = false`,
      [classId, senderId, recipientId]
    );

    if (parseInt(classCheckResult.rows[0].count) !== 2) {
      return res.status(400).json({ error: 'Both students must be in the same class' });
    }

    // Get sender and recipient names
    const namesResult = await query(
      `SELECT id, name FROM profiles WHERE id IN ($1, $2)`,
      [senderId, recipientId]
    );

    const senderName = namesResult.rows.find(r => r.id === senderId)?.name || 'A classmate';
    const recipientName = namesResult.rows.find(r => r.id === recipientId)?.name || 'Unknown';

    // Get class name
    const classResult = await query(
      `SELECT name FROM classes WHERE id = $1`,
      [classId]
    );
    const className = classResult.rows[0]?.name || 'Unknown Class';

    // Deduct points from sender (negative transaction)
    await query(
      `INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason)
       VALUES ($1, $1, $2, $3, $4)`,
      [senderId, classId, -points, `Gifted ${points} points to ${recipientName}`]
    );

    // Add points to recipient (positive transaction)
    await query(
      `INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason)
       VALUES ($1, $1, $2, $3, $4)`,
      [recipientId, classId, points, `Received ${points} points as a gift from ${senderName}`]
    );

    // Get recipient email
    const recipientEmailResult = await query(
      `SELECT email FROM auth_users WHERE id = $1`,
      [recipientId]
    );

    // Send email to recipient
    if (recipientEmailResult.rows.length > 0) {
      const recipientEmail = recipientEmailResult.rows[0].email;
      const emailContent = getGiftPointsEmail(senderName, points, className);
      await sendEmail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    res.json({ 
      success: true, 
      message: `Successfully gifted ${points} points to ${recipientName}` 
    });
  } catch (error) {
    console.error('Gift points error:', error);
    res.status(500).json({ error: 'Failed to gift points' });
  }
});

// Gift a reward to another student
router.post('/reward', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { recipientId, rewardId, classId, password } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!recipientId || !rewardId || !classId || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (recipientId === senderId) {
      return res.status(400).json({ error: 'Cannot gift a reward to yourself' });
    }

    // Verify password
    const userResult = await query(
      `SELECT password FROM auth_users WHERE id = $1`,
      [senderId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const passwordValid = await comparePassword(password, userResult.rows[0].password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Get reward details
    const rewardResult = await query(
      `SELECT * FROM rewards WHERE id = $1`,
      [rewardId]
    );

    if (rewardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    const reward = rewardResult.rows[0];

    // Check sender has enough points
    const senderPointsResult = await query(
      `SELECT COALESCE(SUM(points), 0) as total_points 
       FROM points_transactions 
       WHERE student_id = $1 AND class_id = $2`,
      [senderId, classId]
    );

    const senderPoints = parseInt(senderPointsResult.rows[0].total_points);
    if (senderPoints < reward.points_cost) {
      return res.status(400).json({ error: 'Not enough points to gift this reward' });
    }

    // Both users must be in the same class
    const classCheckResult = await query(
      `SELECT COUNT(*) as count FROM class_members 
       WHERE class_id = $1 AND user_id IN ($2, $3) AND is_teacher = false`,
      [classId, senderId, recipientId]
    );

    if (parseInt(classCheckResult.rows[0].count) !== 2) {
      return res.status(400).json({ error: 'Both students must be in the same class' });
    }

    // Get sender and recipient names
    const namesResult = await query(
      `SELECT id, name FROM profiles WHERE id IN ($1, $2)`,
      [senderId, recipientId]
    );

    const senderName = namesResult.rows.find(r => r.id === senderId)?.name || 'A classmate';
    const recipientName = namesResult.rows.find(r => r.id === recipientId)?.name || 'Unknown';

    // Get class name
    const classResult = await query(
      `SELECT name FROM classes WHERE id = $1`,
      [classId]
    );
    const className = classResult.rows[0]?.name || 'Unknown Class';

    // Deduct points from sender
    await query(
      `INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason)
       VALUES ($1, $1, $2, $3, $4)`,
      [senderId, classId, -reward.points_cost, `Gifted reward "${reward.title}" to ${recipientName}`]
    );

    // Create reward purchase for recipient with gifted_by field
    const purchaseResult = await query(
      `INSERT INTO reward_purchases (reward_id, student_id, class_id, status, gifted_by, gifted_by_name)
       VALUES ($1, $2, $3, 'pending', $4, $5)
       RETURNING id`,
      [rewardId, recipientId, classId, senderId, senderName]
    );
    
    const purchaseId = purchaseResult.rows[0].id;

    // Create messages for teachers (mentor and teachers with can_fulfill_rewards)
    const teachersForMessagesResult = await query(
      `SELECT DISTINCT cm.user_id as teacher_id
       FROM class_members cm
       JOIN classes c ON c.id = cm.class_id
       WHERE cm.class_id = $1 
         AND cm.is_teacher = true
         AND (c.mentor_id = cm.user_id OR cm.can_fulfill_rewards = true)`,
      [classId]
    );

    console.log('Creating messages for', teachersForMessagesResult.rows.length, 'teachers');

    // Create a message for each teacher
    for (const row of teachersForMessagesResult.rows) {
      await query(
        `INSERT INTO messages (class_id, teacher_id, student_id, reward_purchase_id, message_type, message)
         VALUES ($1, $2, $3, $4, 'reward_purchase', $5)`,
        [classId, row.teacher_id, recipientId, purchaseId, `${senderName} gifted ${reward.category} reward "${reward.title}" to ${recipientName}`]
      );
    }

    // Award 3 tier points to the sender for gifting
    await query(
      `UPDATE profiles 
       SET tier_points = tier_points + 3
       WHERE id = $1`,
      [senderId]
    );

    // Update sender's tier if needed
    const tierResult = await query(
      `SELECT tier_points FROM profiles WHERE id = $1`,
      [senderId]
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
      [newTier, senderId]
    );

    // Get recipient email
    const recipientEmailResult = await query(
      `SELECT email FROM auth_users WHERE id = $1`,
      [recipientId]
    );

    // Send email to recipient
    if (recipientEmailResult.rows.length > 0) {
      const recipientEmail = recipientEmailResult.rows[0].email;
      const emailContent = getGiftRewardEmail(senderName, reward.title, className);
      console.log('Sending gift notification email to recipient:', recipientEmail);
      await sendEmail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    // Send email to teachers who can fulfill rewards (same as regular purchase)
    console.log('Looking for teachers to notify for class:', classId);
    const teachersResult = await query(
      `SELECT au.email, p.name as teacher_name, cm.receive_email_notifications
       FROM class_members cm
       JOIN auth_users au ON au.id = cm.user_id
       JOIN profiles p ON p.id = cm.user_id
       JOIN classes c ON c.id = cm.class_id
       WHERE cm.class_id = $1 
         AND cm.is_teacher = true
         AND (c.mentor_id = cm.user_id OR cm.can_fulfill_rewards = true)`,
      [classId]
    );

    console.log('Found teachers to notify:', teachersResult.rows.length, 'teachers');

    // Send email to each eligible teacher if they have email notifications enabled
    for (const teacher of teachersResult.rows) {
      if (teacher.receive_email_notifications === true || teacher.receive_email_notifications === null) {
        console.log('Sending reward request email to teacher:', teacher.email);
        const teacherEmailContent = getRewardRequestEmail(recipientName, reward.title, className);
        await sendEmail({
          to: teacher.email,
          subject: teacherEmailContent.subject,
          html: teacherEmailContent.html,
        });
      }
    }

    res.json({ 
      success: true, 
      message: `Successfully gifted "${reward.title}" to ${recipientName}`,
      tierPointsAwarded: 3
    });
  } catch (error) {
    console.error('Gift reward error:', error);
    res.status(500).json({ error: 'Failed to gift reward' });
  }
});

// Get classmates for gifting
router.get('/classmates/:classId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { classId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all students in this class except the current user
    const result = await query(
      `SELECT p.id, p.name 
       FROM class_members cm
       JOIN profiles p ON p.id = cm.user_id
       WHERE cm.class_id = $1 AND cm.is_teacher = false AND cm.user_id != $2
       ORDER BY p.name`,
      [classId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get classmates error:', error);
    res.status(500).json({ error: 'Failed to get classmates' });
  }
});

// Email templates for gifts
function getGiftPointsEmail(senderName: string, points: number, className: string): { subject: string; html: string } {
  return {
    subject: `🎁 You received ${points} Vasa Points as a gift!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .highlight { background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .points { font-size: 48px; font-weight: bold; color: #059669; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 You Got a Gift!</h1>
            </div>
            <div class="content">
              <h2>Someone is thinking of you!</h2>
              <p>Hey there,</p>
              <p><strong>${senderName}</strong> has gifted you Vasa Points in <strong>${className}</strong>!</p>
              
              <div class="highlight">
                <p>You received</p>
                <p class="points">+${points}</p>
                <p>Vasa Points</p>
              </div>
              
              <p>These points have been added to your account. Use them to redeem awesome rewards!</p>
              
              <p>Don't forget to thank ${senderName} for their kindness! 💚</p>
            </div>
            <div class="footer">
              <p>This is an automated message from VasaBonus.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function getGiftRewardEmail(senderName: string, rewardTitle: string, className: string): { subject: string; html: string } {
  return {
    subject: `🎁 You received a reward as a gift: ${rewardTitle}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .highlight { background: #EDE9FE; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .reward-title { font-size: 24px; font-weight: bold; color: #7C3AED; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 You Got a Gift!</h1>
            </div>
            <div class="content">
              <h2>Someone is being super generous!</h2>
              <p>Hey there,</p>
              <p><strong>${senderName}</strong> has gifted you a reward in <strong>${className}</strong>!</p>
              
              <div class="highlight">
                <p>You received</p>
                <p class="reward-title">${rewardTitle}</p>
              </div>
              
              <p>Your teacher will fulfill this reward soon. Check your pending rewards in VasaBonus!</p>
              
              <p>Don't forget to thank ${senderName} for their amazing gift! 💜</p>
            </div>
            <div class="footer">
              <p>This is an automated message from VasaBonus.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export default router;
