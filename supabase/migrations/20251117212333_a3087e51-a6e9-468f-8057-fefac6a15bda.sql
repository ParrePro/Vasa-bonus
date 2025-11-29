-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own points" ON points_transactions;

-- Create new policy that allows students to view their own points
CREATE POLICY "Students can view their own points"
ON points_transactions
FOR SELECT
USING (student_id = auth.uid());

-- Create new policy that allows teachers in the class to view all points for that class
CREATE POLICY "Teachers can view class points"
ON points_transactions
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND EXISTS (
    SELECT 1 FROM class_members
    WHERE class_members.class_id = points_transactions.class_id
    AND class_members.user_id = auth.uid()
    AND class_members.is_teacher = true
  )
);