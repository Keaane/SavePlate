-- ============================================
-- SAVEPLATE DATABASE SETUP - PART 4: FUNCTIONS & TRIGGERS
-- ============================================
-- Run this FOURTH in Supabase SQL Editor
-- Safe to run multiple times (uses CREATE OR REPLACE)
-- ============================================

-- ============================================
-- 1. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. UPDATE TIMESTAMPS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to food_items
DROP TRIGGER IF EXISTS update_food_items_updated_at ON food_items;
CREATE TRIGGER update_food_items_updated_at
  BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. NOTIFY FAVORITES WHEN VENDOR POSTS FOOD
-- ============================================
CREATE OR REPLACE FUNCTION notify_favorite_vendors_on_new_food()
RETURNS TRIGGER AS $$
DECLARE
  vendor_name TEXT;
BEGIN
  -- Get vendor name
  SELECT COALESCE(business_name, full_name) INTO vendor_name
  FROM profiles WHERE id = NEW.vendor_id;
  
  -- Insert notifications for all users who favorited this vendor
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    f.user_id,
    'new_food',
    'New food available!',
    COALESCE(vendor_name, 'A vendor you follow') || ' just posted: ' || NEW.name,
    '/vendors/' || NEW.vendor_id
  FROM favorites f
  WHERE f.vendor_id = NEW.vendor_id
  AND f.user_id != NEW.vendor_id; -- Don't notify the vendor themselves
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'Error in notify_favorite_vendors_on_new_food: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_notify_on_new_food ON food_items;
CREATE TRIGGER trigger_notify_on_new_food
  AFTER INSERT ON food_items
  FOR EACH ROW
  WHEN (NEW.is_active = true AND NEW.quantity > 0)
  EXECUTE FUNCTION notify_favorite_vendors_on_new_food();

-- ============================================
-- 4. AUTO-DEACTIVATE EXPIRED FOOD ITEMS
-- ============================================
CREATE OR REPLACE FUNCTION deactivate_expired_food_items()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE food_items
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true
  AND expiry_date IS NOT NULL
  AND expiry_date < NOW();
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. GET VENDOR RATINGS
-- ============================================
CREATE OR REPLACE FUNCTION get_vendor_rating(vendor_uuid UUID)
RETURNS TABLE(avg_rating NUMERIC, total_reviews BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as avg_rating,
    COUNT(*) as total_reviews
  FROM reviews
  WHERE vendor_id = vendor_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. GET VENDOR STATS
-- ============================================
CREATE OR REPLACE FUNCTION get_vendor_stats(vendor_uuid UUID)
RETURNS TABLE(
  total_listings BIGINT,
  active_listings BIGINT,
  total_reviews BIGINT,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM food_items WHERE vendor_id = vendor_uuid) as total_listings,
    (SELECT COUNT(*) FROM food_items WHERE vendor_id = vendor_uuid AND is_active = true AND quantity > 0) as active_listings,
    (SELECT COUNT(*) FROM reviews WHERE vendor_id = vendor_uuid) as total_reviews,
    (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) FROM reviews WHERE vendor_id = vendor_uuid) as avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ BEGIN RAISE NOTICE 'PART 4 COMPLETE: Functions and triggers created successfully!'; END $$;

