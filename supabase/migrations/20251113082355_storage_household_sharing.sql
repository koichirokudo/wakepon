-- Storage avatars Ð±ÃÈ’/…q	k	ô

-- âXnÝê·ü’Jd
DROP POLICY IF EXISTS "Users can manage their own avatar" ON storage.objects;

-- 1. ên¢Ð¿ü’¢Ã×íüÉûô°ûJdgM‹
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

-- 2. ên¢Ð¿ü~_oX/náóÐün¢Ð¿ü’²§gM‹
CREATE POLICY "Users can view household members avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars' AND
  (
    -- ênÕ¡¤ë
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- X/náóÐünÕ¡¤ë
    EXISTS (
      SELECT 1
      FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid()
      AND hm2.user_id = ((storage.foldername(name))[1])::uuid
    )
  )
);
