-- ============================================
-- ADD GALLERY IMAGES COLUMN TO PROFILES
-- ============================================
-- Run this in Supabase SQL Editor to add gallery support
-- ============================================

-- Add gallery_images column to profiles (stores array of URLs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Success message
DO $$ BEGIN RAISE NOTICE 'Gallery images column added to profiles table!'; END $$;

