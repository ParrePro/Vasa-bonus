-- Drop existing policies that need to be updated
DROP POLICY IF EXISTS "Mentors or teachers can create rewards in their classes" ON public.rewards;
DROP POLICY IF EXISTS "Teachers can update purchase status" ON public.reward_purchases;
DROP POLICY IF EXISTS "Teachers can view class purchases" ON public.reward_purchases;
DROP POLICY IF EXISTS "Teachers can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Teachers can mark messages as read" ON public.messages;

-- Create updated policies for rewards
CREATE POLICY "Mentors or teachers can create rewards in their classes" ON public.rewards
FOR INSERT 
WITH CHECK (
  is_class_mentor(auth.uid(), class_id) 
  OR has_role(auth.uid(), 'developer'::app_role) 
  OR (EXISTS (
    SELECT 1
    FROM class_members cm
    WHERE cm.class_id = rewards.class_id 
      AND cm.user_id = auth.uid() 
      AND cm.is_teacher = true
  ))
);

-- Create updated policies for reward_purchases
CREATE POLICY "Teachers can update purchase status" ON public.reward_purchases
FOR UPDATE 
USING (
  (has_role(auth.uid(), 'teacher'::app_role) AND is_class_mentor(auth.uid(), class_id))
  OR (EXISTS (
    SELECT 1
    FROM class_members cm
    WHERE cm.class_id = reward_purchases.class_id 
      AND cm.user_id = auth.uid() 
      AND cm.is_teacher = true
  ))
);

CREATE POLICY "Teachers can view class purchases" ON public.reward_purchases
FOR SELECT 
USING (
  (has_role(auth.uid(), 'teacher'::app_role) AND is_class_mentor(auth.uid(), class_id))
  OR (EXISTS (
    SELECT 1
    FROM class_members cm
    WHERE cm.class_id = reward_purchases.class_id 
      AND cm.user_id = auth.uid() 
      AND cm.is_teacher = true
  ))
);

-- Create updated policies for messages
CREATE POLICY "Teachers can view their messages" ON public.messages
FOR SELECT 
USING (
  teacher_id = auth.uid()
  OR (EXISTS (
    SELECT 1
    FROM class_members cm
    WHERE cm.class_id = messages.class_id 
      AND cm.user_id = auth.uid() 
      AND cm.is_teacher = true
  ))
);

CREATE POLICY "Teachers can mark messages as read" ON public.messages
FOR UPDATE 
USING (
  teacher_id = auth.uid()
  OR (EXISTS (
    SELECT 1
    FROM class_members cm
    WHERE cm.class_id = messages.class_id 
      AND cm.user_id = auth.uid() 
      AND cm.is_teacher = true
  ))
);