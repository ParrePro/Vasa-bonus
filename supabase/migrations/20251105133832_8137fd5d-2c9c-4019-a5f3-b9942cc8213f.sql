-- Fix infinite recursion in class_members policies
DROP POLICY IF EXISTS "Users can view class members" ON public.class_members;
DROP POLICY IF EXISTS "Teachers can add members" ON public.class_members;

-- Create non-recursive policy for viewing class members
CREATE POLICY "Users can view class members"
ON public.class_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  class_id IN (
    SELECT cm.class_id 
    FROM public.class_members cm 
    WHERE cm.user_id = auth.uid()
  )
);

-- Create non-recursive policy for adding members
CREATE POLICY "Teachers can add members"
ON public.class_members
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) AND
  (
    -- Mentor of the class
    class_id IN (SELECT id FROM public.classes WHERE mentor_id = auth.uid())
    OR
    -- Teacher in the class
    class_id IN (SELECT class_id FROM public.class_members WHERE user_id = auth.uid() AND is_teacher = true)
  )
);

-- Fix the classes policies that reference wrong columns
DROP POLICY IF EXISTS "Teachers can view classes they're in" ON public.classes;
DROP POLICY IF EXISTS "Students can view classes they're in" ON public.classes;

CREATE POLICY "Teachers can view classes they're in"
ON public.classes
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND
  (
    mentor_id = auth.uid() OR
    id IN (SELECT class_id FROM public.class_members WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Students can view classes they're in"
ON public.classes
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::app_role) AND
  id IN (SELECT class_id FROM public.class_members WHERE user_id = auth.uid())
);