-- ============================================
-- SAVEPLATE DATABASE SETUP - PART 1: CORE TABLES
-- ============================================
-- Run this FIRST in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'vendor', 'admin')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  description TEXT,
  
  -- Vendor-specific fields
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('restaurant', 'cafe', 'supermarket', 'bakery', 'food_truck', 'other') OR business_type IS NULL),
  
  -- Verification fields
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  verification_badge TEXT DEFAULT 'new' CHECK (verification_badge IN ('new', 'verified', 'trusted', 'premium')),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  suspended_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add business_name if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_name') THEN
    ALTER TABLE profiles ADD COLUMN business_name TEXT;
  END IF;
  
  -- Add business_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_type') THEN
    ALTER TABLE profiles ADD COLUMN business_type TEXT;
  END IF;
  
  -- Add verification_status if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;
  
  -- Add verification_badge if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_badge') THEN
    ALTER TABLE profiles ADD COLUMN verification_badge TEXT DEFAULT 'new';
  END IF;
  
  -- Add verified_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified_at') THEN
    ALTER TABLE profiles ADD COLUMN verified_at TIMESTAMPTZ;
  END IF;
  
  -- Add rejection_reason if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rejection_reason') THEN
    ALTER TABLE profiles ADD COLUMN rejection_reason TEXT;
  END IF;
  
  -- Add suspended_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'suspended_at') THEN
    ALTER TABLE profiles ADD COLUMN suspended_at TIMESTAMPTZ;
  END IF;
  
  -- Add updated_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for profiles (skip if exists)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(role, is_verified, verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);

-- ============================================
-- 2. FOOD_ITEMS TABLE
-- ============================================
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

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add original_price if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'original_price') THEN
    ALTER TABLE food_items ADD COLUMN original_price DECIMAL(10,2);
  END IF;
  
  -- Add original_quantity if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'original_quantity') THEN
    ALTER TABLE food_items ADD COLUMN original_quantity INTEGER;
  END IF;
  
  -- Add updated_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'updated_at') THEN
    ALTER TABLE food_items ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for food_items
CREATE INDEX IF NOT EXISTS idx_food_items_vendor ON food_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_food_items_active ON food_items(is_active, quantity);
CREATE INDEX IF NOT EXISTS idx_food_items_expiry ON food_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);
CREATE INDEX IF NOT EXISTS idx_food_items_location ON food_items(location);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ BEGIN RAISE NOTICE 'PART 1 COMPLETE: Core tables created/updated successfully!'; END $$;

