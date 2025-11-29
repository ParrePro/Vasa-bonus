-- Allow developers to create rewards for any class
DROP POLICY IF EXISTS "Developers can create rewards" ON public.rewards;
CREATE POLICY "Developers can create rewards" ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'developer')
);

-- Allow mentors and developers to delete classes
CREATE POLICY "Mentors and developers can delete classes" ON public.classes
FOR DELETE
TO authenticated
USING (
  mentor_id = auth.uid() OR has_role(auth.uid(), 'developer')
);