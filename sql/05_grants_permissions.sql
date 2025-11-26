-- ============================================
-- SAVEPLATE DATABASE SETUP - PART 5: GRANTS & PERMISSIONS
-- ============================================
-- Run this FIFTH in Supabase SQL Editor
-- Safe to run multiple times
-- ============================================

-- ============================================
-- 1. GRANT TABLE PERMISSIONS
-- ============================================
-- Profiles
GRANT SELECT ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Food items
GRANT SELECT ON food_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON food_items TO authenticated;

-- Notifications
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;

-- Favorites
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated;

-- Reports
GRANT SELECT, INSERT ON reports TO authenticated;

-- Reviews
GRANT SELECT ON reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;

-- ============================================
-- 2. GRANT FUNCTION PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION deactivate_expired_food_items() TO authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_rating(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_stats(UUID) TO anon, authenticated;

-- ============================================
-- 3. GRANT SEQUENCE PERMISSIONS (if any)
-- ============================================
-- Note: UUID columns don't need sequence permissions

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ BEGIN RAISE NOTICE 'PART 5 COMPLETE: Grants and permissions configured successfully!'; END $$;

