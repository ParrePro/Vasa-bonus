-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('multiplier', 'set_points')),
  multiplier_value DECIMAL(3,2),
  points_value INTEGER,
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign participations table
CREATE TABLE public.campaign_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Students can view available campaigns"
ON public.campaigns
FOR SELECT
USING (
  active = true AND
  (available_from IS NULL OR available_from <= now()) AND
  (available_until IS NULL OR available_until >= now()) AND
  (is_class_member(auth.uid(), class_id) OR has_role(auth.uid(), 'developer'::app_role))
);

CREATE POLICY "Teachers can view their class campaigns"
ON public.campaigns
FOR SELECT
USING (
  is_class_mentor(auth.uid(), class_id) OR
  (EXISTS (
    SELECT 1 FROM class_members cm
    WHERE cm.class_id = campaigns.class_id
    AND cm.user_id = auth.uid()
    AND cm.is_teacher = true
  )) OR
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Teachers can create campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  (is_class_mentor(auth.uid(), class_id) OR
  (EXISTS (
    SELECT 1 FROM class_members cm
    WHERE cm.class_id = campaigns.class_id
    AND cm.user_id = auth.uid()
    AND cm.is_teacher = true
  )) OR
  has_role(auth.uid(), 'developer'::app_role))
);

CREATE POLICY "Teachers can update their campaigns"
ON public.campaigns
FOR UPDATE
USING (created_by = auth.uid() OR has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Teachers can delete their campaigns"
ON public.campaigns
FOR DELETE
USING (created_by = auth.uid() OR has_role(auth.uid(), 'developer'::app_role));

-- RLS Policies for campaign participations
CREATE POLICY "Students can join campaigns"
ON public.campaign_participations
FOR INSERT
WITH CHECK (
  student_id = auth.uid() AND
  has_role(auth.uid(), 'student'::app_role)
);

CREATE POLICY "Students can view their participations"
ON public.campaign_participations
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view class participations"
ON public.campaign_participations
FOR SELECT
USING (
  is_class_mentor(auth.uid(), class_id) OR
  (EXISTS (
    SELECT 1 FROM class_members cm
    WHERE cm.class_id = campaign_participations.class_id
    AND cm.user_id = auth.uid()
    AND cm.is_teacher = true
  )) OR
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Teachers can confirm participations"
ON public.campaign_participations
FOR UPDATE
USING (
  is_class_mentor(auth.uid(), class_id) OR
  (EXISTS (
    SELECT 1 FROM class_members cm
    WHERE cm.class_id = campaign_participations.class_id
    AND cm.user_id = auth.uid()
    AND cm.is_teacher = true
  )) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Add index for performance
CREATE INDEX idx_campaign_participations_student ON campaign_participations(student_id);
CREATE INDEX idx_campaign_participations_campaign ON campaign_participations(campaign_id);
CREATE INDEX idx_campaigns_class ON campaigns(class_id);