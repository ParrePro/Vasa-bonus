-- Drop and recreate the policy for teachers adding rewards to classes
DROP POLICY IF EXISTS "Teachers can add reward to classes" ON public.reward_classes;

CREATE POLICY "Teachers can add reward to classes" ON public.reward_classes
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND (
    is_class_mentor(auth.uid(), class_id)
    OR (EXISTS (
      SELECT 1
      FROM class_members cm
      WHERE cm.class_id = reward_classes.class_id 
        AND cm.user_id = auth.uid() 
        AND cm.is_teacher = true
    ))
  )
);