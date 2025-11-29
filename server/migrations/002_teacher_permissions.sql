-- Add teacher permission columns to class_members table
ALTER TABLE class_members 
ADD COLUMN IF NOT EXISTS can_give_points BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_add_rewards BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_add_campaigns BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_fulfill_rewards BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_fulfill_campaigns BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_remove_students BOOLEAN DEFAULT false;

-- Update existing co-teachers to have correct defaults (can_remove_students = false)
-- This only affects existing records that have the old default
UPDATE class_members 
SET can_remove_students = false 
WHERE is_teacher = true 
  AND can_remove_students = true
  AND user_id NOT IN (
    SELECT mentor_id FROM classes WHERE mentor_id = class_members.user_id AND id = class_members.class_id
  );

-- Create index for faster permission lookups
CREATE INDEX IF NOT EXISTS idx_class_members_teacher_permissions 
ON class_members(class_id, user_id, is_teacher) 
WHERE is_teacher = true;
