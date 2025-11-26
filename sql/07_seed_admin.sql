-- ============================================
-- SAVEPLATE DATABASE SETUP - PART 7: CREATE ADMIN USER
-- ============================================
-- Run this LAST in Supabase SQL Editor
-- This updates an existing user to admin role
-- ============================================

-- ============================================
-- STEP 1: First, check if you have any users
-- ============================================
-- This query shows all users in your system
-- If no results, sign up first in your app!

DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  IF user_count = 0 THEN
    RAISE NOTICE 'No users found. Please sign up in the app first, then run this script again.';
  ELSE
    RAISE NOTICE 'Found % user(s) in profiles table.', user_count;
  END IF;
END $$;

-- ============================================
-- STEP 2: View all users (uncomment to run)
-- ============================================
-- Uncomment the SELECT below to see your users:

-- SELECT id, full_name, role, verification_status, created_at FROM profiles ORDER BY created_at DESC LIMIT 20;

-- ============================================
-- STEP 3: Make a user admin
-- ============================================
-- IMPORTANT: Replace the placeholder with your actual user ID
-- Get your user ID from: Supabase Dashboard > Authentication > Users

-- OPTION A: Update by user ID (RECOMMENDED)
-- Uncomment and replace 'YOUR-USER-UUID-HERE' with your actual UUID:

/*
UPDATE profiles
SET 
  role = 'admin', 
  verification_status = 'verified', 
  is_verified = true,
  updated_at = NOW()
WHERE id = 'YOUR-USER-UUID-HERE';
*/

-- OPTION B: Update the FIRST user to admin (for testing only)
-- Uncomment to make the first registered user an admin:

/*
UPDATE profiles
SET 
  role = 'admin', 
  verification_status = 'verified', 
  is_verified = true,
  updated_at = NOW()
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);
*/

-- ============================================
-- STEP 4: Verify admin was created
-- ============================================
-- After running one of the UPDATE statements above,
-- uncomment this to verify:

-- SELECT id, full_name, role, verification_status FROM profiles WHERE role = 'admin';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ BEGIN RAISE NOTICE 'PART 7: Admin setup script loaded. Uncomment and run the UPDATE statement to create an admin.'; END $$;
