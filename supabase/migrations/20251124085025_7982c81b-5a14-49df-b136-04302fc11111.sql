BEGIN;

-- Relax rewards SELECT policy so creators can see their own rewards immediately
DROP POLICY IF EXISTS "Class members can view rewards" ON public.rewards;

CREATE POLICY "Class members can view rewards"
ON public.rewards
FOR SELECT
USING (
  -- Creator of the reward can always see it
  created_by = auth.uid()
  OR
  -- Class members and mentors can see rewards linked to their classes
  EXISTS (
    SELECT 1
    FROM public.reward_classes rc
    WHERE rc.reward_id = rewards.id
      AND (
        is_class_member(auth.uid(), rc.class_id)
        OR is_class_mentor(auth.uid(), rc.class_id)
      )
  )
);

COMMIT;