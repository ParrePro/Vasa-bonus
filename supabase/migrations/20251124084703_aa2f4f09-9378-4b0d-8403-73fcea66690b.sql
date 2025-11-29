-- Update rewards insert policy to allow class mentors and teachers in the class_members table
BEGIN;

DROP POLICY IF EXISTS "Mentors or teachers can create rewards" ON public.rewards;

CREATE POLICY "Mentors or teachers can create rewards"
ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (
  -- Class mentor for the reward's class
  is_class_mentor(auth.uid(), class_id)
  OR
  -- Or a teacher in the class_members table for that class
  EXISTS (
    SELECT 1
    FROM public.class_members cm
    WHERE cm.class_id = rewards.class_id
      AND cm.user_id = auth.uid()
      AND cm.is_teacher = true
  )
);

COMMIT;