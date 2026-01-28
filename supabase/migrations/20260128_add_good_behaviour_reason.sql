-- Ensure Good Behaviour reason exists
INSERT INTO public.default_point_reasons (reason, points)
SELECT 'Good behaviour', 5
WHERE NOT EXISTS (
  SELECT 1 FROM public.default_point_reasons 
  WHERE reason ILIKE 'Good behavio%'
);
