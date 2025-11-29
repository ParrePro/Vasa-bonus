-- Allow students to join classes themselves
CREATE POLICY "Students can join classes"
ON public.class_members
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'student'::app_role) 
  AND user_id = auth.uid() 
  AND is_teacher = false
);