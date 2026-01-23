import { query } from './db';
import { sendEmail, getRewardReminderEmail, getCampaignReminderEmail } from './email';

// Production settings: 3 days
const REMINDER_INTERVAL_DAYS = 3; // Send reminder every 3 days
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

async function sendPendingReminders() {
  console.log('Checking for pending rewards and campaigns that need reminders...');

  try {
    // Get pending reward purchases that are older than 3 days
    // and where last_reminder_at is null or older than 3 days
    // Only notify teachers who have permission to fulfill rewards (mentors or can_fulfill_rewards = true)
    const pendingRewardsResult = await query(`
      SELECT 
        rp.id,
        rp.student_id,
        rp.class_id,
        rp.purchased_at,
        rp.last_reminder_at,
        r.title as reward_title,
        p.name as student_name,
        c.name as class_name,
        au.email as teacher_email,
        cm.user_id as teacher_id,
        cm.receive_email_notifications
      FROM reward_purchases rp
      JOIN rewards r ON r.id = rp.reward_id
      JOIN profiles p ON p.id = rp.student_id
      JOIN classes c ON c.id = rp.class_id
      JOIN class_members cm ON cm.class_id = rp.class_id AND cm.is_teacher = true
      JOIN auth_users au ON au.id = cm.user_id
      WHERE rp.status = 'pending'
        AND rp.purchased_at < NOW() - INTERVAL '${REMINDER_INTERVAL_DAYS} days'
        AND (rp.last_reminder_at IS NULL OR rp.last_reminder_at < NOW() - INTERVAL '${REMINDER_INTERVAL_DAYS} days')
        AND (c.mentor_id = cm.user_id OR cm.can_fulfill_rewards = true)
    `);

    console.log(`Found ${pendingRewardsResult.rows.length} pending reward(s) needing reminders`);

    for (const reward of pendingRewardsResult.rows) {
      // Skip if email notifications are disabled for this teacher in this class
      if (reward.receive_email_notifications === false) {
        continue;
      }

      const daysPending = Math.floor(
        (Date.now() - new Date(reward.purchased_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      const emailContent = getRewardReminderEmail(
        reward.student_name,
        reward.reward_title,
        reward.class_name,
        daysPending
      );

      const sent = await sendEmail({
        to: reward.teacher_email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      if (sent) {
        // Update last_reminder_at
        await query(
          'UPDATE reward_purchases SET last_reminder_at = NOW() WHERE id = $1',
          [reward.id]
        );
        console.log(`Sent reward reminder for purchase ${reward.id} to ${reward.teacher_email}`);
      }
    }

    // Get pending campaign participations that are older than 3 days
    // Only notify teachers who have permission to fulfill campaigns (mentors or can_fulfill_campaigns = true)
    const pendingCampaignsResult = await query(`
      SELECT 
        cp.id,
        cp.student_id,
        cp.class_id,
        cp.joined_at,
        cp.last_reminder_at,
        cam.title as campaign_title,
        p.name as student_name,
        c.name as class_name,
        au.email as teacher_email,
        cm.user_id as teacher_id,
        cm.receive_email_notifications
      FROM campaign_participations cp
      JOIN campaigns cam ON cam.id = cp.campaign_id
      JOIN profiles p ON p.id = cp.student_id
      JOIN classes c ON c.id = cp.class_id
      JOIN class_members cm ON cm.class_id = cp.class_id AND cm.is_teacher = true
      JOIN auth_users au ON au.id = cm.user_id
      WHERE cp.status = 'pending'
        AND cp.joined_at < NOW() - INTERVAL '${REMINDER_INTERVAL_DAYS} days'
        AND (cp.last_reminder_at IS NULL OR cp.last_reminder_at < NOW() - INTERVAL '${REMINDER_INTERVAL_DAYS} days')
        AND (c.mentor_id = cm.user_id OR cm.can_fulfill_campaigns = true)
    `);

    console.log(`Found ${pendingCampaignsResult.rows.length} pending campaign(s) needing reminders`);

    for (const campaign of pendingCampaignsResult.rows) {
      // Skip if email notifications are disabled for this teacher in this class
      if (campaign.receive_email_notifications === false) {
        continue;
      }

      const daysPending = Math.floor(
        (Date.now() - new Date(campaign.joined_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      const emailContent = getCampaignReminderEmail(
        campaign.student_name,
        campaign.campaign_title,
        campaign.class_name,
        daysPending
      );

      const sent = await sendEmail({
        to: campaign.teacher_email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      if (sent) {
        // Update last_reminder_at
        await query(
          'UPDATE campaign_participations SET last_reminder_at = NOW() WHERE id = $1',
          [campaign.id]
        );
        console.log(`Sent campaign reminder for participation ${campaign.id} to ${campaign.teacher_email}`);
      }
    }

  } catch (error) {
    console.error('Error checking for pending reminders:', error);
  }
}

export function startReminderScheduler() {
  console.log(`Starting reminder scheduler (checking every ${CHECK_INTERVAL_MS / 1000 / 60} minutes)`);
  
  // Run immediately on startup
  sendPendingReminders();
  
  // Then run periodically
  setInterval(sendPendingReminders, CHECK_INTERVAL_MS);
}
