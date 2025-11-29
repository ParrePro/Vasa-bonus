BEGIN;

-- Remove the check constraint that blocks negative points
-- (needed for reward purchases which deduct points)
ALTER TABLE public.points_transactions
DROP CONSTRAINT IF EXISTS points_transactions_points_check;

COMMIT;