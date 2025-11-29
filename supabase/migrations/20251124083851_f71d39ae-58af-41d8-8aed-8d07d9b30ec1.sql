BEGIN;

-- Update rewards insert policy to also allow class mentors
DROP POLICY IF EXISTS "Teachers can create rewards" ON public.rewards;

CREATE POLICY "Mentors or teachers can create rewards"
ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  OR is_class_mentor(auth.uid(), class_id)
);

-- Create public bucket for reward images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'reward-images', 'reward-images', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'reward-images'
);

-- Reset reward image policies on storage.objects
DROP POLICY IF EXISTS "Reward images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload reward images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update reward images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete reward images" ON storage.objects;

-- Allow anyone to view reward images
CREATE POLICY "Reward images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reward-images');

-- Allow teachers to upload reward images
CREATE POLICY "Teachers can upload reward images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reward-images'
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- Allow teachers to update reward images
CREATE POLICY "Teachers can update reward images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'reward-images'
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- Allow teachers to delete reward images
CREATE POLICY "Teachers can delete reward images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'reward-images'
  AND has_role(auth.uid(), 'teacher'::app_role)
);

COMMIT;