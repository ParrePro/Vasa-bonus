-- Add duration fields to campaigns table
ALTER TABLE campaigns 
ADD COLUMN duration_type text CHECK (duration_type IN ('1_week', '1_month', '1_year', 'custom', 'unlimited')),
ADD COLUMN duration_days integer;

-- Create campaign_classes junction table for multi-class campaigns
CREATE TABLE campaign_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, class_id)
);

-- Enable RLS on campaign_classes
ALTER TABLE campaign_classes ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_classes
CREATE POLICY "Class members can view campaign classes"
  ON campaign_classes FOR SELECT
  USING (
    is_class_member(auth.uid(), class_id) 
    OR is_class_mentor(auth.uid(), class_id)
    OR has_role(auth.uid(), 'developer'::app_role)
  );

CREATE POLICY "Teachers can add campaign to classes"
  ON campaign_classes FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role)
    AND (
      is_class_mentor(auth.uid(), class_id)
      OR EXISTS (
        SELECT 1 FROM class_members cm
        WHERE cm.class_id = campaign_classes.class_id
        AND cm.user_id = auth.uid()
        AND cm.is_teacher = true
      )
    )
    OR has_role(auth.uid(), 'developer'::app_role)
  );

CREATE POLICY "Developers can add campaign to classes"
  ON campaign_classes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Teachers can remove campaign from classes"
  ON campaign_classes FOR DELETE
  USING (
    has_role(auth.uid(), 'teacher'::app_role)
    AND EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_classes.campaign_id
      AND campaigns.created_by = auth.uid()
    )
  );

CREATE POLICY "Developers can remove campaign from classes"
  ON campaign_classes FOR DELETE
  USING (has_role(auth.uid(), 'developer'::app_role));