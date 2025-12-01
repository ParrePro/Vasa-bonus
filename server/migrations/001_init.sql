-- Local PostgreSQL Database Schema
-- This replaces the Supabase schema for local development

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auth users table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app role enum
CREATE TYPE app_role AS ENUM ('teacher', 'student', 'developer');

-- Create schools table (must come before user_roles since it references schools)
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  mentor_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_members table
CREATE TABLE IF NOT EXISTS class_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  is_teacher BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create default_point_reasons table
CREATE TABLE IF NOT EXISTS default_point_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reason TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default point reasons
INSERT INTO default_point_reasons (reason, points) VALUES
  ('Helping a classmate', 5),
  ('Excellent participation', 10),
  ('Great homework', 10),
  ('Kind action', 5),
  ('Leadership', 15),
  ('Good behavior', 5)
ON CONFLICT DO NOTHING;

-- Create campaigns table (from later migrations)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  multiplier_value NUMERIC,
  points_value INTEGER,
  duration_type TEXT,
  duration_days INTEGER,
  max_participations INTEGER,
  image_url TEXT,
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_classes table
CREATE TABLE IF NOT EXISTS campaign_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_participations table
CREATE TABLE IF NOT EXISTS campaign_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES auth_users(id),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT DEFAULT 'one-time',
  duration_type TEXT,
  duration_days INTEGER,
  category TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  purchase_limit_type TEXT DEFAULT 'unlimited',
  purchase_limit_count INTEGER,
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reward_classes junction table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS reward_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reward_id, class_id)
);

-- Create reward_purchases table
CREATE TABLE IF NOT EXISTS reward_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  fulfilled_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  gifted_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  gifted_by_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns if they don't exist (for existing databases)
ALTER TABLE reward_purchases ADD COLUMN IF NOT EXISTS gifted_by UUID REFERENCES auth_users(id) ON DELETE SET NULL;
ALTER TABLE reward_purchases ADD COLUMN IF NOT EXISTS gifted_by_name TEXT;
ALTER TABLE reward_purchases ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create messages table for teacher notifications
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'reward_request',
  is_read BOOLEAN DEFAULT FALSE,
  reward_purchase_id UUID REFERENCES reward_purchases(id) ON DELETE CASCADE,
  campaign_participation_id UUID REFERENCES campaign_participations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_class_members_user_id ON class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class_id ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_student_id ON points_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_class_id ON points_transactions(class_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participations_student_id ON campaign_participations(student_id);
CREATE INDEX IF NOT EXISTS idx_reward_purchases_student_id ON reward_purchases(student_id);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auth_users table
DROP TRIGGER IF EXISTS update_auth_users_updated_at ON auth_users;
CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON auth_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
