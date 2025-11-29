-- Create table to track teacher's favorite students
CREATE TABLE IF NOT EXISTS student_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, student_id, class_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_favorites_teacher 
ON student_favorites(teacher_id, class_id);

CREATE INDEX IF NOT EXISTS idx_student_favorites_student 
ON student_favorites(student_id);
