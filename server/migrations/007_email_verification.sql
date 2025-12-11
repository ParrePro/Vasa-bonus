-- Add email verification columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP;

-- Create index for verification code lookups
CREATE INDEX IF NOT EXISTS idx_verification_code ON profiles(verification_code);
