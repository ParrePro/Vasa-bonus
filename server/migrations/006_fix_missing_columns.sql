-- Add avatar customization columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_skin text DEFAULT 'fair',
ADD COLUMN IF NOT EXISTS avatar_hair text DEFAULT 'short',
ADD COLUMN IF NOT EXISTS avatar_hair_color text DEFAULT 'black',
ADD COLUMN IF NOT EXISTS avatar_eyes text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS avatar_accessory text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS avatar_background text DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS avatar_border text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS avatar_effect text DEFAULT 'none';

-- Add tier system columns to profiles table if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_tier text DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS tier_points integer DEFAULT 0;

-- Add reminder column to reward_purchases table
ALTER TABLE reward_purchases
ADD COLUMN IF NOT EXISTS last_reminder_at timestamp with time zone;

-- Create index for tier queries if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(current_tier);
