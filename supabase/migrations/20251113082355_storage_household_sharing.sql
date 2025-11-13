-- Change avatars bucket from private to household sharing

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own avatar" ON storage.objects;

-- 1. Users can upload, update, and delete their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Users can view their own avatar and avatars from household members
CREATE POLICY "Users can view household members avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars' AND
  (
    -- Own files
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Files from same household members
    EXISTS (
      SELECT 1
      FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid()
      AND hm2.user_id = ((storage.foldername(name))[1])::uuid
    )
  )
);
