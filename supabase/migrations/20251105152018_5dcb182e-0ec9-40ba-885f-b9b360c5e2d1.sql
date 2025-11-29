-- Create a security definer function to check class membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_class_member(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_members
    WHERE user_id = _user_id AND class_id = _class_id
  )
$$;

-- Create another function to check if user is a class mentor
CREATE OR REPLACE FUNCTION public.is_class_mentor(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE id = _class_id AND mentor_id = _user_id
  )
$$;

-- Drop and recreate all problematic policies using these functions

-- Fix class_members SELECT policy
DROP POLICY IF EXISTS "Users can view class members" ON public.class_members;
CREATE POLICY "Users can view class members"
ON public.class_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  is_class_member(auth.uid(), class_id) OR
  is_class_mentor(auth.uid(), class_id)
);

-- Fix classes SELECT policies
DROP POLICY IF EXISTS "Teachers can view classes they're in" ON public.classes;
CREATE POLICY "Teachers can view classes they're in"
ON public.classes
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND
  (mentor_id = auth.uid() OR is_class_member(auth.uid(), id))
);

DROP POLICY IF EXISTS "Students can view classes they're in" ON public.classes;
CREATE POLICY "Students can view classes they're in"
ON public.classes
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::app_role) AND
  is_class_member(auth.uid(), id)
);