-- Create rewards table
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('one-time', 'recurring')),
  duration_type TEXT CHECK (duration_type IN ('one-week', 'one-month', 'custom', NULL)),
  duration_days INTEGER CHECK ((reward_type = 'recurring' AND duration_days > 0) OR reward_type = 'one-time'),
  category TEXT NOT NULL CHECK (category IN ('tangible', 'symbolic')),
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Create reward_purchases table
CREATE TABLE public.reward_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  reward_purchase_id UUID REFERENCES public.reward_purchases(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('reward_purchase', 'general')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards
CREATE POLICY "Class members can view rewards"
  ON public.rewards FOR SELECT
  USING (is_class_member(auth.uid(), class_id) OR is_class_mentor(auth.uid(), class_id));

CREATE POLICY "Teachers can create rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND created_by = auth.uid() AND is_class_mentor(auth.uid(), class_id));

CREATE POLICY "Teachers can update their rewards"
  ON public.rewards FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete their rewards"
  ON public.rewards FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for reward_purchases
CREATE POLICY "Students can view their own purchases"
  ON public.reward_purchases FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view class purchases"
  ON public.reward_purchases FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role) AND is_class_mentor(auth.uid(), class_id));

CREATE POLICY "Students can purchase rewards"
  ON public.reward_purchases FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'student'::app_role) AND student_id = auth.uid());

CREATE POLICY "Teachers can update purchase status"
  ON public.reward_purchases FOR UPDATE
  USING (has_role(auth.uid(), 'teacher'::app_role) AND is_class_mentor(auth.uid(), class_id));

-- RLS Policies for messages
CREATE POLICY "Teachers can view their messages"
  ON public.messages FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their messages"
  ON public.messages FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "System can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Teachers can mark messages as read"
  ON public.messages FOR UPDATE
  USING (teacher_id = auth.uid());