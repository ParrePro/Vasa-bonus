-- Add fulfilled_by column to track which teacher fulfilled the reward
ALTER TABLE public.reward_purchases
ADD COLUMN fulfilled_by uuid REFERENCES auth.users(id);