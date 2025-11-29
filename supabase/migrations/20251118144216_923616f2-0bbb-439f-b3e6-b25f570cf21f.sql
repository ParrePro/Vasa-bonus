-- Relax rewards insert policy to avoid false RLS failures while still enforcing teacher role
BEGIN;

DROP POLICY IF EXISTS "Teachers can create rewards" ON public.rewards;

CREATE POLICY "Teachers can create rewards"
ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
);

COMMIT;