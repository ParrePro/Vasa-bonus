-- Add gifted_by and gifted_by_name columns to reward_purchases table
ALTER TABLE reward_purchases
ADD COLUMN IF NOT EXISTS gifted_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS gifted_by_name TEXT;

-- Add expires_at column if it doesn't exist
ALTER TABLE reward_purchases
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
