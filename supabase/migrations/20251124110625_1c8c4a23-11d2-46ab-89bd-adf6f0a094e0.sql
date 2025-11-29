-- Add availability period columns to rewards table
ALTER TABLE public.rewards
ADD COLUMN available_from timestamp with time zone,
ADD COLUMN available_until timestamp with time zone;

-- Add comment explaining the columns
COMMENT ON COLUMN public.rewards.available_from IS 'Start date/time when reward becomes available for purchase. NULL means available immediately.';
COMMENT ON COLUMN public.rewards.available_until IS 'End date/time when reward stops being available for purchase. NULL means no end date.';