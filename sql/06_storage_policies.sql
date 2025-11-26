-- ============================================
-- SAVEPLATE DATABASE SETUP - PART 6: STORAGE POLICIES
-- ============================================
-- Run this SIXTH in Supabase SQL Editor
-- NOTE: You must FIRST create the storage buckets manually in Supabase Dashboard:
--   1. Go to Storage > New Bucket
--   2. Create "food-images" bucket (set as PUBLIC)
--   3. Create "vendor-docs" bucket (set as PRIVATE)
-- Then run this script to set up policies.
-- ============================================

-- ============================================
-- 1. FOOD-IMAGES BUCKET POLICIES
-- ============================================
-- Note: These policies assume the bucket "food-images" exists
-- If bucket doesn't exist, these will fail silently

-- Allow anyone to view food images (public bucket)
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view food images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload food images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own food images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own food images" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors if policies don't exist
END $$;

-- Create policies for food-images bucket
CREATE POLICY "Anyone can view food images"
ON storage.objects FOR SELECT
USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated users can upload food images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'food-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own food images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'food-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own food images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'food-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 2. VENDOR-DOCS BUCKET POLICIES
-- ============================================
-- Note: These policies assume the bucket "vendor-docs" exists

DO $$
BEGIN
  DROP POLICY IF EXISTS "Vendors can upload their own docs" ON storage.objects;
  DROP POLICY IF EXISTS "Vendors can view their own docs" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can view all vendor docs" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE POLICY "Vendors can upload their own docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-docs'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can view their own docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vendor-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all vendor docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vendor-docs'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- IMPORTANT: MANUAL BUCKET CREATION
-- ============================================
-- If the above policies fail, you need to create buckets first:
-- 
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Create "food-images" bucket:
--    - Name: food-images
--    - Public bucket: YES (checked)
-- 4. Create "vendor-docs" bucket:
--    - Name: vendor-docs
--    - Public bucket: NO (unchecked)
-- 5. Run this script again
-- ============================================

DO $$ BEGIN RAISE NOTICE 'PART 6 COMPLETE: Storage policies configured! Make sure buckets exist in Supabase Dashboard.'; END $$;

