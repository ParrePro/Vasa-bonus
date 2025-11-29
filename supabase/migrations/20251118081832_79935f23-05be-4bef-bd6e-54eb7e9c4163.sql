-- Create junction table for rewards and classes (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.reward_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reward_id, class_id)
);

-- Enable RLS on reward_classes
ALTER TABLE public.reward_classes ENABLE ROW LEVEL SECURITY;

-- Migrate existing data from rewards.class_id to reward_classes
INSERT INTO public.reward_classes (reward_id, class_id)
SELECT id, class_id FROM public.rewards WHERE class_id IS NOT NULL;

-- RLS Policies for reward_classes
CREATE POLICY "Class members can view reward classes"
  ON public.reward_classes FOR SELECT
  USING (is_class_member(auth.uid(), class_id) OR is_class_mentor(auth.uid(), class_id));

CREATE POLICY "Teachers can add reward to classes"
  ON public.reward_classes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND is_class_mentor(auth.uid(), class_id));

CREATE POLICY "Teachers can remove reward from classes"
  ON public.reward_classes FOR DELETE
  USING (has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
    SELECT 1 FROM public.rewards WHERE id = reward_classes.reward_id AND created_by = auth.uid()
  ));

-- Update rewards RLS policies to not require class_id check since it's now in junction table
DROP POLICY IF EXISTS "Class members can view rewards" ON public.rewards;
DROP POLICY IF EXISTS "Teachers can create rewards" ON public.rewards;

CREATE POLICY "Class members can view rewards"
  ON public.rewards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reward_classes 
    WHERE reward_classes.reward_id = rewards.id 
    AND (is_class_member(auth.uid(), reward_classes.class_id) OR is_class_mentor(auth.uid(), reward_classes.class_id))
  ));

CREATE POLICY "Teachers can create rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND created_by = auth.uid());