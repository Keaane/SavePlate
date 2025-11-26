-- ============================================
-- SAVEPLATE - COMPLETE DATABASE SETUP
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- ============================================
-- PART 1: EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 2: CORE TABLES
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'vendor', 'admin')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  description TEXT,
  business_name TEXT,
  business_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending',
  verification_badge TEXT DEFAULT 'new',
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_name') THEN
    ALTER TABLE profiles ADD COLUMN business_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_type') THEN
    ALTER TABLE profiles ADD COLUMN business_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_badge') THEN
    ALTER TABLE profiles ADD COLUMN verification_badge TEXT DEFAULT 'new';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified_at') THEN
    ALTER TABLE profiles ADD COLUMN verified_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rejection_reason') THEN
    ALTER TABLE profiles ADD COLUMN rejection_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'suspended_at') THEN
    ALTER TABLE profiles ADD COLUMN suspended_at TIMESTAMPTZ;
  END IF;
END $$;

-- Food items table
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  quantity INTEGER NOT NULL DEFAULT 1,
  original_quantity INTEGER,
  category TEXT DEFAULT 'Other',
  location TEXT,
  image TEXT,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 3: FEATURE TABLES
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to favorites
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_id_vendor_id_key') THEN
    ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_vendor_id_key UNIQUE (user_id, vendor_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_id_vendor_id_key') THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_vendor_id_key UNIQUE (user_id, vendor_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- PART 4: INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(role, is_verified);
CREATE INDEX IF NOT EXISTS idx_food_items_vendor ON food_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_food_items_active ON food_items(is_active, quantity);
CREATE INDEX IF NOT EXISTS idx_food_items_expiry ON food_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vendor ON favorites(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON reviews(vendor_id);

-- ============================================
-- PART 5: ENABLE RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Food items policies
DROP POLICY IF EXISTS "Food items viewable by everyone" ON food_items;
DROP POLICY IF EXISTS "Vendors can insert own food" ON food_items;
DROP POLICY IF EXISTS "Vendors can update own food" ON food_items;
DROP POLICY IF EXISTS "Vendors can delete own food" ON food_items;
CREATE POLICY "Food items viewable by everyone" ON food_items FOR SELECT USING (true);
CREATE POLICY "Vendors can insert own food" ON food_items FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update own food" ON food_items FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can delete own food" ON food_items FOR DELETE USING (auth.uid() = vendor_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Favorites policies
DROP POLICY IF EXISTS "Users view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users delete own favorites" ON favorites;
CREATE POLICY "Users view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Users view own reports" ON reports;
DROP POLICY IF EXISTS "Admins view all reports" ON reports;
DROP POLICY IF EXISTS "Admins update reports" ON reports;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins view all reports" ON reports FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins update reports" ON reports FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users create own reviews" ON reviews;
DROP POLICY IF EXISTS "Users update own reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PART 7: FUNCTIONS
-- ============================================

-- Auto-create profile on signup
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
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notify favorites on new food
CREATE OR REPLACE FUNCTION notify_favorite_vendors_on_new_food()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT f.user_id, 'new_food', 'New food available!',
    (SELECT COALESCE(business_name, full_name) FROM profiles WHERE id = NEW.vendor_id) || ' posted: ' || NEW.name,
    '/vendors/' || NEW.vendor_id
  FROM favorites f
  WHERE f.vendor_id = NEW.vendor_id AND f.user_id != NEW.vendor_id;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_new_food ON food_items;
CREATE TRIGGER trigger_notify_on_new_food
  AFTER INSERT ON food_items
  FOR EACH ROW WHEN (NEW.is_active = true AND NEW.quantity > 0)
  EXECUTE FUNCTION notify_favorite_vendors_on_new_food();

-- ============================================
-- PART 8: GRANTS
-- ============================================
GRANT SELECT ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON food_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON food_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated;
GRANT SELECT, INSERT ON reports TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;

-- ============================================
-- DONE!
-- ============================================
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'SAVEPLATE DATABASE SETUP COMPLETE!'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'Next steps:'; END $$;
DO $$ BEGIN RAISE NOTICE '1. Create storage buckets: food-images (public), vendor-docs (private)'; END $$;
DO $$ BEGIN RAISE NOTICE '2. Run 06_storage_policies.sql for storage policies'; END $$;
DO $$ BEGIN RAISE NOTICE '3. Create your first admin user with 07_seed_admin.sql'; END $$;

