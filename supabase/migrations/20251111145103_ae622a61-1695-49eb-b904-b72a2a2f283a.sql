-- Allow users to view classes by code for joining purposes
CREATE POLICY "Anyone can view classes to join them"
ON public.classes
FOR SELECT
USING (true);