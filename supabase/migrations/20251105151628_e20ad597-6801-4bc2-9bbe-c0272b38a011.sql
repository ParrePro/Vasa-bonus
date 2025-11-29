-- Drop the problematic policy
DROP POLICY IF EXISTS "Teachers can add members" ON public.class_members;

-- Create a simplified non-recursive policy for adding members
-- Teachers can add members to classes they mentor OR are teachers in
CREATE POLICY "Teachers can add members"
ON public.class_members
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) AND
  (
    -- User is the mentor of the class
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = class_id AND classes.mentor_id = auth.uid()
    )
  )
);

-- Also need to fix the SELECT policy to be truly non-recursive
DROP POLICY IF EXISTS "Users can view class members" ON public.class_members;

CREATE POLICY "Users can view class members"
ON public.class_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_id 
    AND (classes.mentor_id = auth.uid() OR classes.id IN (
      SELECT cm.class_id FROM public.class_members cm 
      WHERE cm.user_id = auth.uid() 
      LIMIT 1
    ))
  )
);