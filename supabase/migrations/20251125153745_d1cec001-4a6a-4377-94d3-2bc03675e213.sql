-- Allow teachers and developers to upload reward images
CREATE POLICY "Teachers can upload reward images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reward-images' AND
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'developer'::app_role))
);

-- Allow teachers and developers to update their uploaded images
CREATE POLICY "Teachers can update reward images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reward-images' AND
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'developer'::app_role))
);

-- Allow teachers and developers to delete reward images
CREATE POLICY "Teachers can delete reward images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'reward-images' AND
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'developer'::app_role))
);

-- Allow public read access to reward images (since bucket is public)
CREATE POLICY "Anyone can view reward images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'reward-images');