-- Add reminder column to campaign_participations table
ALTER TABLE campaign_participations
ADD COLUMN IF NOT EXISTS last_reminder_at timestamp with time zone;
