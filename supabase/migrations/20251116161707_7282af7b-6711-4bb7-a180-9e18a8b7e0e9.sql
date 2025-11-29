-- Add policy to allow teachers to join classes as co-teachers
CREATE POLICY "Teachers can join classes as co-teachers"
ON public.class_members
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND user_id = auth.uid() 
  AND is_teacher = true
);