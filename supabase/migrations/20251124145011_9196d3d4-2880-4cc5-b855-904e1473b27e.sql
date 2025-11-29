-- Update rewards policy to allow developers to create rewards
DROP POLICY IF EXISTS "Mentors or teachers can create rewards" ON public.rewards;

CREATE POLICY "Mentors or teachers can create rewards"
ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (
  is_class_mentor(auth.uid(), class_id) 
  OR has_role(auth.uid(), 'developer')
  OR (EXISTS (
    SELECT 1
    FROM class_members cm
    WHERE cm.class_id = rewards.class_id 
      AND cm.user_id = auth.uid() 
      AND cm.is_teacher = true
  ))
);