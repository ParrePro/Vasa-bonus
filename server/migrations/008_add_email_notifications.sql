-- Add email notification preference column to class_members table
ALTER TABLE class_members
ADD COLUMN IF NOT EXISTS receive_email_notifications BOOLEAN DEFAULT TRUE;
