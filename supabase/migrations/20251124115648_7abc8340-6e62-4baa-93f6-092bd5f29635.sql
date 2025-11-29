-- Add developer permissions to create classes
CREATE POLICY "Developers can create classes in any school"
ON public.classes
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

-- Add developer permission to update classes
CREATE POLICY "Developers can update any class"
ON public.classes
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'developer'::app_role));

-- Ensure developers can view class_members
CREATE POLICY "Developers can view all class members"
ON public.class_members
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'developer'::app_role));

-- Allow developers to add class members
CREATE POLICY "Developers can add members"
ON public.class_members
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

-- Allow developers to remove class members
CREATE POLICY "Developers can remove members"
ON public.class_members
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'developer'::app_role));

-- Ensure developers can create rewards
CREATE POLICY "Developers can create rewards"
ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

-- Allow developers to manage reward_classes
CREATE POLICY "Developers can add reward to classes"
ON public.reward_classes
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can remove reward from classes"
ON public.reward_classes
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'developer'::app_role));

-- Allow developers to give points
CREATE POLICY "Developers can give points"
ON public.points_transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));