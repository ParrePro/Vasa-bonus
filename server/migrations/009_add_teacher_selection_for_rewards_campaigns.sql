-- Add teacher selection for rewards and campaigns
-- This allows specifying which teachers can fulfill rewards and campaigns

-- Create junction table for reward teachers
CREATE TABLE IF NOT EXISTS reward_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reward_id, teacher_id)
);

-- Create junction table for campaign teachers
CREATE TABLE IF NOT EXISTS campaign_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, teacher_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reward_teachers_reward_id ON reward_teachers(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_teachers_teacher_id ON reward_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_campaign_teachers_campaign_id ON campaign_teachers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_teachers_teacher_id ON campaign_teachers(teacher_id);
