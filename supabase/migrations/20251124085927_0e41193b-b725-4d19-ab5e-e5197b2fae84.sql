BEGIN;

-- Add purchase limit column to rewards table
ALTER TABLE public.rewards
ADD COLUMN IF NOT EXISTS purchase_limit_type text DEFAULT 'unlimited' CHECK (purchase_limit_type IN ('once', 'unlimited', 'custom')),
ADD COLUMN IF NOT EXISTS purchase_limit_count integer DEFAULT NULL;

COMMIT;