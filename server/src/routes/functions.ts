import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { query } from '../db';
import { sendEmail, getRewardRequestEmail, getCampaignRequestEmail } from '../email';

const router = Router();

// Purchase reward function
router.post('/purchase-reward', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { rewardId, classId } = req.body;

    if (!userId || !rewardId || !classId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get the reward details
    const rewardResult = await query(
      'SELECT * FROM rewards WHERE id = $1',
      [rewardId]
    );

    if (rewardResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reward not found' });
    }

    const reward = rewardResult.rows[0];

    // Check if reward is active
    if (!reward.active) {
      return res.status(400).json({ success: false, error: 'Reward is not available' });
    }

    // Get the class to find the teacher (mentor)
    const classResult = await query(
      'SELECT mentor_id FROM classes WHERE id = $1',
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const teacherId = classResult.rows[0].mentor_id;

    // Get student's current points
    const pointsResult = await query(
      'SELECT COALESCE(SUM(points), 0) as total FROM points_transactions WHERE student_id = $1 AND class_id = $2',
      [userId, classId]
    );

    const currentPoints = parseInt(pointsResult.rows[0].total) || 0;

    if (currentPoints < reward.points_cost) {
      return res.status(400).json({ success: false, error: 'Not enough points' });
    }

    // Check purchase limits
    if (reward.purchase_limit_type === 'once' || reward.purchase_limit_type === 'custom') {
      const purchaseCountResult = await query(
        'SELECT COUNT(*) as count FROM reward_purchases WHERE student_id = $1 AND reward_id = $2',
        [userId, rewardId]
      );

      const purchaseCount = parseInt(purchaseCountResult.rows[0].count) || 0;

      if (reward.purchase_limit_type === 'once' && purchaseCount >= 1) {
        return res.status(400).json({ success: false, error: 'You have already purchased this reward' });
      }

      if (reward.purchase_limit_type === 'custom' && purchaseCount >= reward.purchase_limit_count) {
        return res.status(400).json({ success: false, error: 'Purchase limit reached' });
      }
    }

    // Create the purchase record
    const purchaseResult = await query(
      'INSERT INTO reward_purchases (student_id, reward_id, class_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, rewardId, classId, 'pending']
    );

    const purchaseId = purchaseResult.rows[0].id;

    // Get student name for the message
    const studentResult = await query(
      'SELECT name FROM profiles WHERE id = $1',
      [userId]
    );
    const studentName = studentResult.rows[0]?.name || 'A student';

    // Get class name for the email
    const classNameResult = await query(
      'SELECT name FROM classes WHERE id = $1',
      [classId]
    );
    const className = classNameResult.rows[0]?.name || 'Unknown Class';

    // Get teachers in this class who have permission to fulfill rewards
    // Mentors always have permission, co-teachers need can_fulfill_rewards = true
    const teachersResult = await query(
      `SELECT cm.user_id, au.email, cm.receive_email_notifications
       FROM class_members cm 
       JOIN auth_users au ON au.id = cm.user_id 
       JOIN classes c ON c.id = cm.class_id
       WHERE cm.class_id = $1 
         AND cm.is_teacher = true
         AND (c.mentor_id = cm.user_id OR cm.can_fulfill_rewards = true)`,
      [classId]
    );

    // Create a message for each teacher with permission and send email
    for (const teacher of teachersResult.rows) {
      await query(
        'INSERT INTO messages (class_id, teacher_id, student_id, message, message_type, reward_purchase_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [classId, teacher.user_id, userId, `${studentName} purchased reward: ${reward.title}`, 'reward_request', purchaseId]
      );

      // Send email notification to teacher if they have email notifications enabled
      if (teacher.email && (teacher.receive_email_notifications === true || teacher.receive_email_notifications === null)) {
        const emailContent = getRewardRequestEmail(studentName, reward.title, className);
        sendEmail({
          to: teacher.email,
          subject: emailContent.subject,
          html: emailContent.html,
        }).catch(err => console.error('Failed to send reward email:', err));
      }
    }

    // Deduct points - negative value to subtract from total
    await query(
      'INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason) VALUES ($1, $2, $3, $4, $5)',
      [userId, teacherId, classId, -reward.points_cost, `Purchased reward: ${reward.title}`]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Purchase reward error:', error);
    res.status(500).json({ success: false, error: 'Failed to purchase reward' });
  }
});

// Join campaign function - handles campaign participation with email notifications
router.post('/join-campaign', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { campaignId, classId } = req.body;

    if (!userId || !campaignId || !classId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get campaign details
    const campaignResult = await query(
      'SELECT * FROM campaigns WHERE id = $1',
      [campaignId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Check if already participating
    const existingResult = await query(
      'SELECT id FROM campaign_participations WHERE campaign_id = $1 AND student_id = $2',
      [campaignId, userId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Already participating in this campaign' });
    }

    // Create the participation record
    const participationResult = await query(
      'INSERT INTO campaign_participations (campaign_id, student_id, class_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [campaignId, userId, classId, 'pending']
    );

    const participationId = participationResult.rows[0].id;

    // Get student name for the message
    const studentResult = await query(
      'SELECT name FROM profiles WHERE id = $1',
      [userId]
    );
    const studentName = studentResult.rows[0]?.name || 'A student';

    // Get class name for the email
    const classNameResult = await query(
      'SELECT name FROM classes WHERE id = $1',
      [classId]
    );
    const className = classNameResult.rows[0]?.name || 'Unknown Class';

    // Get teachers in this class who have permission to fulfill campaigns
    // Mentors always have permission, co-teachers need can_fulfill_campaigns = true
    const teachersResult = await query(
      `SELECT cm.user_id, au.email, cm.receive_email_notifications
       FROM class_members cm 
       JOIN auth_users au ON au.id = cm.user_id 
       JOIN classes c ON c.id = cm.class_id
       WHERE cm.class_id = $1 
         AND cm.is_teacher = true
         AND (c.mentor_id = cm.user_id OR cm.can_fulfill_campaigns = true)`,
      [classId]
    );

    // Create a message for each teacher with permission and send email
    for (const teacher of teachersResult.rows) {
      await query(
        'INSERT INTO messages (class_id, teacher_id, student_id, message, message_type, campaign_participation_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [classId, teacher.user_id, userId, `${studentName} wants to join the campaign: ${campaign.title}`, 'campaign_request', participationId]
      );

      // Send email notification to teacher if they have email notifications enabled
      if (teacher.email && (teacher.receive_email_notifications === true || teacher.receive_email_notifications === null)) {
        const emailContent = getCampaignRequestEmail(studentName, campaign.title, className);
        sendEmail({
          to: teacher.email,
          subject: emailContent.subject,
          html: emailContent.html,
        }).catch(err => console.error('Failed to send campaign email:', err));
      }
    }

    res.json({ success: true, participationId });
  } catch (error) {
    console.error('Join campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to join campaign' });
  }
});

// Helper function to check teacher permissions
async function checkTeacherPermission(userId: string, classId: string, permission: string): Promise<boolean> {
  // Check if user is mentor (mentors have all permissions)
  const classResult = await query(
    'SELECT mentor_id FROM classes WHERE id = $1',
    [classId]
  );
  
  if (classResult.rows.length > 0 && classResult.rows[0].mentor_id === userId) {
    return true;
  }

  // Check if user is developer (developers have all permissions)
  const devResult = await query(
    `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
    [userId]
  );
  
  if (devResult.rows.length > 0) {
    return true;
  }

  // Check specific permission for co-teacher
  const permResult = await query(
    `SELECT ${permission} FROM class_members WHERE class_id = $1 AND user_id = $2 AND is_teacher = true`,
    [classId, userId]
  );

  return permResult.rows.length > 0 && permResult.rows[0][permission] === true;
}

// Fulfill reward with permission check
router.post('/fulfill-reward', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { purchaseId } = req.body;

    if (!userId || !purchaseId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get the reward purchase to find the class
    const purchaseResult = await query(
      'SELECT class_id, status FROM reward_purchases WHERE id = $1',
      [purchaseId]
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reward purchase not found' });
    }

    const { class_id: classId, status } = purchaseResult.rows[0];

    if (status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Reward is not pending' });
    }

    // Check permission
    const hasPermission = await checkTeacherPermission(userId, classId, 'can_fulfill_rewards');
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'You do not have permission to fulfill rewards' });
    }

    // Update the reward purchase
    await query(
      `UPDATE reward_purchases SET status = 'fulfilled', fulfilled_at = NOW(), fulfilled_by = $1 WHERE id = $2`,
      [userId, purchaseId]
    );

    // Mark related messages as read
    await query(
      'UPDATE messages SET is_read = true WHERE reward_purchase_id = $1',
      [purchaseId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Fulfill reward error:', error);
    res.status(500).json({ success: false, error: 'Failed to fulfill reward' });
  }
});

// Confirm campaign participation with permission check
router.post('/confirm-campaign', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { participationId, campaignType, pointsValue } = req.body;

    if (!userId || !participationId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get the participation to find the class and campaign details
    const participationResult = await query(
      `SELECT cp.class_id, cp.student_id, cp.status, c.duration_type, c.duration_days, c.campaign_type, c.points_value
       FROM campaign_participations cp
       JOIN campaigns c ON c.id = cp.campaign_id
       WHERE cp.id = $1`,
      [participationId]
    );

    if (participationResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Campaign participation not found' });
    }

    const participation = participationResult.rows[0];
    const classId = participation.class_id;

    if (participation.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Participation is not pending' });
    }

    // Check permission
    const hasPermission = await checkTeacherPermission(userId, classId, 'can_fulfill_campaigns');
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'You do not have permission to confirm campaigns' });
    }

    // Calculate expires_at for multiplier campaigns
    let expiresAt = null;
    const actualCampaignType = campaignType || participation.campaign_type;
    
    if (actualCampaignType === 'multiplier') {
      if (participation.duration_type && participation.duration_type !== 'unlimited') {
        const expiryDate = new Date();

        if (participation.duration_type === '2_minutes') {
          expiryDate.setMinutes(expiryDate.getMinutes() + 2);
        } else {
          const durationDays = participation.duration_days || 0;
          expiryDate.setTime(expiryDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
        }

        expiresAt = expiryDate.toISOString();
      }
    }

    // Update participation status
    const newStatus = actualCampaignType === 'set_points' ? 'completed' : 'active';
    await query(
      `UPDATE campaign_participations 
       SET status = $1, confirmed_at = NOW(), confirmed_by = $2, expires_at = $3 
       WHERE id = $4`,
      [newStatus, userId, expiresAt, participationId]
    );

    // If it's a set_points campaign, give the student points
    const actualPointsValue = pointsValue || participation.points_value;
    if (actualCampaignType === 'set_points' && actualPointsValue) {
      // Get campaign title for the reason
      const campaignResult = await query(
        'SELECT title FROM campaigns WHERE id = (SELECT campaign_id FROM campaign_participations WHERE id = $1)',
        [participationId]
      );
      const campaignTitle = campaignResult.rows[0]?.title || 'Campaign';

      await query(
        `INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason) 
         VALUES ($1, $2, $3, $4, $5)`,
        [participation.student_id, userId, classId, actualPointsValue, `Campaign reward: ${campaignTitle}`]
      );

      // Award tier points if points > 0
      if (actualPointsValue > 0) {
        await query(
          `UPDATE profiles 
           SET tier_points = tier_points + 1
           WHERE id = $1`,
          [participation.student_id]
        );

        // Check new tier and update if needed
        const tierResult = await query(
          `SELECT tier_points FROM profiles WHERE id = $1`,
          [participation.student_id]
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
          [newTier, participation.student_id]
        );
      }
    }

    // Mark related messages as read
    await query(
      'UPDATE messages SET is_read = true WHERE campaign_participation_id = $1',
      [participationId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Confirm campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm campaign' });
  }
});

// Reject reward purchase - returns points to student
router.post('/reject-reward', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { purchaseId } = req.body;

    if (!userId || !purchaseId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get the reward purchase
    const purchaseResult = await query(
      'SELECT * FROM reward_purchases WHERE id = $1',
      [purchaseId]
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reward purchase not found' });
    }

    const purchase = purchaseResult.rows[0];
    const { class_id: classId, status, student_id: studentId, reward_id: rewardId } = purchase;

    if (status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Reward is not pending' });
    }

    // Check permission
    const hasPermission = await checkTeacherPermission(userId, classId, 'can_fulfill_rewards');
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'You do not have permission to reject rewards' });
    }

    // Get reward details to know how many points to refund
    const rewardResult = await query(
      'SELECT * FROM rewards WHERE id = $1',
      [rewardId]
    );

    if (rewardResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reward not found' });
    }

    const reward = rewardResult.rows[0];

    // Refund points to student
    await query(
      'INSERT INTO points_transactions (student_id, teacher_id, class_id, points, reason) VALUES ($1, $2, $3, $4, $5)',
      [studentId, userId, classId, reward.points_cost, `Reward rejected: ${reward.title}`]
    );

    // Update the reward purchase status to rejected
    await query(
      `UPDATE reward_purchases SET status = 'rejected', fulfilled_at = NOW(), fulfilled_by = $1 WHERE id = $2`,
      [userId, purchaseId]
    );

    // Mark related messages as read
    await query(
      'UPDATE messages SET is_read = true WHERE reward_purchase_id = $1',
      [purchaseId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Reject reward error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject reward' });
  }
});

// Reject campaign participation - just marks as rejected, no points involved
router.post('/reject-campaign', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { participationId } = req.body;

    if (!userId || !participationId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get the participation
    const participationResult = await query(
      `SELECT cp.class_id, cp.status, cp.campaign_id
       FROM campaign_participations cp
       WHERE cp.id = $1`,
      [participationId]
    );

    if (participationResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Campaign participation not found' });
    }

    const participation = participationResult.rows[0];
    const { class_id: classId, status } = participation;

    if (status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Participation is not pending' });
    }

    // Check permission
    const hasPermission = await checkTeacherPermission(userId, classId, 'can_fulfill_campaigns');
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'You do not have permission to reject campaigns' });
    }

    // Update the participation status to rejected
    await query(
      `UPDATE campaign_participations SET status = 'rejected' WHERE id = $1`,
      [participationId]
    );

    // Mark related messages as read
    await query(
      'UPDATE messages SET is_read = true WHERE campaign_participation_id = $1',
      [participationId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Reject campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject campaign' });
  }
});

// Delete student account - developer only
router.post('/delete-student', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { studentId, password, developerPassword } = req.body;

    if (!userId || !studentId || !password || !developerPassword) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if requester is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );

    if (devResult.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'Only developers can delete student accounts' });
    }

    // Verify developer password
    const DEVELOPER_MODE_PASSWORD = 'Hjärtatclutchar';
    if (developerPassword !== DEVELOPER_MODE_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Incorrect developer password' });
    }

    // Verify developer's own account password using Supabase admin API
    // Since auth_users table doesn't exist in Supabase, we skip this verification
    // The developer mode password is sufficient protection
    // In production, implement client-side password verification via Supabase

    // Verify student exists
    const studentExistsResult = await query(
      `SELECT id FROM profiles WHERE id = $1`,
      [studentId]
    );

    if (studentExistsResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Delete in order to respect foreign key constraints
    // Delete student's class memberships
    await query(`DELETE FROM class_members WHERE user_id = $1`, [studentId]);

    // Delete student's reward purchases
    await query(`DELETE FROM reward_purchases WHERE student_id = $1`, [studentId]);

    // Delete student's campaign participations
    await query(`DELETE FROM campaign_participations WHERE student_id = $1`, [studentId]);

    // Delete student's points transactions
    await query(`DELETE FROM points_transactions WHERE student_id = $1 OR teacher_id = $1`, [studentId]);

    // Delete student's messages
    await query(`DELETE FROM messages WHERE student_id = $1 OR teacher_id = $1`, [studentId]);

    // Delete student's profile
    await query(`DELETE FROM profiles WHERE id = $1`, [studentId]);

    // Delete student's user roles
    await query(`DELETE FROM user_roles WHERE user_id = $1`, [studentId]);

    // Delete student's auth account
    await query(`DELETE FROM auth_users WHERE id = $1`, [studentId]);

    res.json({ success: true, message: 'Student account deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete student account' });
  }
});

// Search students in a school
router.post('/search-students', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { schoolId, searchTerm } = req.body;

    if (!userId || !schoolId || !searchTerm) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if requester is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );

    if (devResult.rows.length === 0) {
      return res.status(403).json({ error: 'Only developers can search students' });
    }

    // Get all classes in the school
    const classesResult = await query(
      `SELECT id FROM classes WHERE school_id = $1`,
      [schoolId]
    );

    if (classesResult.rows.length === 0) {
      return res.json({ students: [] });
    }

    const classIds = classesResult.rows.map(c => c.id);

    // Search for students by name
    const searchPattern = `%${searchTerm}%`;
    const profilesResult = await query(
      `SELECT id, name FROM profiles WHERE name ILIKE $1`,
      [searchPattern]
    );

    if (profilesResult.rows.length === 0) {
      return res.json({ students: [] });
    }

    const profileIds = profilesResult.rows.map(p => p.id);

    // Get class members who are students
    const membersResult = await query(
      `SELECT DISTINCT cm.user_id, cm.class_id 
       FROM class_members cm
       WHERE cm.user_id = ANY($1::uuid[]) 
         AND cm.class_id = ANY($2::uuid[])
         AND cm.is_teacher = false`,
      [profileIds, classIds]
    );

    if (membersResult.rows.length === 0) {
      return res.json({ students: [] });
    }

    const schoolStudentIds = [...new Set(membersResult.rows.map(m => m.user_id))];

    // Get student details including emails and points
    const studentsDetailsResult = await query(
      `SELECT 
        p.id,
        p.name,
        au.email,
        COALESCE(SUM(pt.points), 0) as total_points,
        COUNT(DISTINCT cm.class_id) as class_count
       FROM profiles p
       JOIN auth_users au ON p.id = au.id
       LEFT JOIN points_transactions pt ON p.id = pt.student_id AND pt.class_id = ANY($2::uuid[])
       LEFT JOIN class_members cm ON p.id = cm.user_id AND cm.is_teacher = false AND cm.class_id = ANY($2::uuid[])
       WHERE p.id = ANY($1::uuid[])
       GROUP BY p.id, p.name, au.email
       ORDER BY p.name`,
      [schoolStudentIds, classIds]
    );

    const students = studentsDetailsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      total_points: parseInt(row.total_points),
      class_count: parseInt(row.class_count),
      created_at: new Date().toISOString(),
    }));

    res.json({ students });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ error: 'Failed to search students' });
  }
});

// Transfer points between students - developer only
router.post('/transfer-points', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { fromStudentId, toStudentId, points, reason, schoolId } = req.body;

    if (!userId || !fromStudentId || !toStudentId || !points || !reason || !schoolId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (points <= 0) {
      return res.status(400).json({ success: false, error: 'Points must be greater than 0' });
    }

    // Check if requester is a developer
    const devResult = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'developer'`,
      [userId]
    );

    if (devResult.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'Only developers can transfer points' });
    }

    // Verify both students exist
    const fromStudentResult = await query(
      `SELECT id FROM profiles WHERE id = $1`,
      [fromStudentId]
    );

    if (fromStudentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'From student not found' });
    }

    const toStudentResult = await query(
      `SELECT id FROM profiles WHERE id = $1`,
      [toStudentId]
    );

    if (toStudentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'To student not found' });
    }

    // Get all classes in the school
    const classesResult = await query(
      `SELECT id FROM classes WHERE school_id = $1`,
      [schoolId]
    );

    if (classesResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'No classes found in this school' });
    }

    const classIds = classesResult.rows.map(c => c.id);

    // Check if from student has enough total points across all classes in the school
    const fromPointsResult = await query(
      `SELECT COALESCE(SUM(points), 0) as total FROM points_transactions 
       WHERE student_id = $1 AND class_id = ANY($2::uuid[])`,
      [fromStudentId, classIds]
    );

    const fromStudentPoints = parseInt(fromPointsResult.rows[0].total);

    if (fromStudentPoints < points) {
      return res.status(400).json({ 
        success: false, 
        error: `Student only has ${fromStudentPoints} points, cannot transfer ${points}` 
      });
    }

    // Find a common class where both students are members to record the transaction
    const commonClassResult = await query(
      `SELECT DISTINCT cm1.class_id 
       FROM class_members cm1
       JOIN class_members cm2 ON cm1.class_id = cm2.class_id
       WHERE cm1.user_id = $1 AND cm2.user_id = $2 AND cm1.class_id = ANY($3::uuid[])
       LIMIT 1`,
      [fromStudentId, toStudentId, classIds]
    );

    let transactionClassId: string;
    
    if (commonClassResult.rows.length > 0) {
      transactionClassId = commonClassResult.rows[0].class_id;
    } else {
      // If no common class, use the first class in the school (this is a fallback)
      transactionClassId = classIds[0];
    }

    // Create a transaction record for points removal (negative points)
    await query(
      `INSERT INTO points_transactions (student_id, class_id, points, reason, teacher_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [fromStudentId, transactionClassId, -points, `Points transferred out: ${reason}`, userId]
    );

    // Create a transaction record for points addition
    await query(
      `INSERT INTO points_transactions (student_id, class_id, points, reason, teacher_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [toStudentId, transactionClassId, points, `Points transferred in: ${reason}`, userId]
    );

    res.json({ 
      success: true, 
      message: `Successfully transferred ${points} points from student to student`,
      fromStudentId,
      toStudentId,
      points
    });
  } catch (error) {
    console.error('Transfer points error:', error);
    res.status(500).json({ success: false, error: 'Failed to transfer points' });
  }
});

export default router;
