-- Add tier system columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_tier VARCHAR(20) DEFAULT 'basic';

-- Create index for faster tier lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tier 
ON profiles(current_tier);

-- Tier system rules:
-- Basic: 0-49 tier points
-- Silver: 50-99 tier points
-- Gold: 100-199 tier points
-- Ruby: 200+ tier points
