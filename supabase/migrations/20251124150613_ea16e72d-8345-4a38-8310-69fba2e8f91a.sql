-- Drop conflicting policies and recreate them correctly

-- Fix developer rewards creation policy
DROP POLICY IF EXISTS "Developers can create rewards" ON public.rewards;
DROP POLICY IF EXISTS "Mentors or teachers can create rewards" ON public.rewards;

-- Allow developers to create rewards for any class
CREATE POLICY "Developers can create rewards for any class" ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'developer')
);

-- Allow mentors and co-teachers to create rewards in their classes
CREATE POLICY "Mentors or teachers can create rewards in their classes" ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (
  is_class_mentor(auth.uid(), class_id) 
  OR has_role(auth.uid(), 'developer'::app_role)
  OR (EXISTS (
    SELECT 1
    FROM class_members cm
    WHERE cm.class_id = rewards.class_id 
    AND cm.user_id = auth.uid() 
    AND cm.is_teacher = true
  ))
);