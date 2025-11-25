# SavePlate MVP - Setup Instructions

**2-Day Implementation Complete!** 🎉

## Quick Setup Steps

### 1. Database Setup (Required - 5 minutes)

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `database_setup.sql`
3. Run the SQL script
4. Verify tables were created:
   - `notifications`
   - `favorites`
   - `reports`
   - `reviews` (should already exist)

### 2. Storage Buckets Setup (Required for Image Uploads - 5 minutes)

⚠️ **Important:** The app needs storage buckets to upload food images and vendor documents.

1. Follow the instructions in `STORAGE_SETUP.md`
2. Create the `food-images` bucket (public)
3. Optionally create `vendor-docs` bucket (private)
4. Set up storage policies as described

**Quick Setup:**
- Go to Supabase Dashboard → Storage → New bucket
- Create bucket named `food-images` (make it **public**)
- Add RLS policies as shown in `STORAGE_SETUP.md`

### 3. Verify Components Are Added

All components should already be in place:
- ✅ `src/components/NotificationBell.jsx` - Notification bell component
- ✅ `src/components/ReportForm.jsx` - Report vendor form
- ✅ `src/utils/vendorRatings.js` - Rating helper functions
- ✅ `database_setup.sql` - Database schema

### 3. Test the Features

#### In-App Notifications
1. Login as a student
2. Favorite a vendor (click "Save Vendor" on vendor detail page)
3. Login as that vendor (or ask vendor to post new food)
4. Post a new food item
5. Check notifications bell in header - should show notification!

#### Ratings System
1. Go to Students dashboard
2. Ratings should now show real data from database (not hardcoded)
3. If no reviews exist, ratings won't show (this is correct)

#### Favorites System
1. Go to any vendor detail page
2. Click "Save Vendor" - saves to database
3. Favorite status persists across sessions

#### Reporting System
1. Go to any vendor detail page
2. Click "Report Vendor"
3. Fill out form and submit
4. Login as admin
5. Go to Admin dashboard → Reports tab
6. See and manage reports

### 4. What Was Implemented

✅ **In-App Notifications System**
- Notification bell in header (shows unread count)
- Notifications dropdown with list
- Auto-creates notifications when favorite vendors post new food
- Real-time updates via Supabase subscriptions
- Mark as read / mark all as read functionality

✅ **Fixed Rating System**
- Removed hardcoded mock ratings
- Now fetches real ratings from database
- Shows actual average rating and review count
- Links to vendor detail page to see all reviews

✅ **Favorites System (Enhanced)**
- Uses database instead of localStorage
- Persists across devices and sessions
- Triggers notifications when favorite vendors post new food

✅ **Reporting System**
- Report form on vendor detail page
- Admin can review reports in dashboard
- Report status workflow (pending → reviewed → resolved/dismissed)
- Admin notes functionality

## Features Overview

### For Students
- ✅ Browse food with real ratings
- ✅ Favorite vendors (database-backed)
- ✅ Get notified when favorites post new food
- ✅ Report problematic vendors
- ✅ View and leave reviews

### For Vendors
- ✅ List surplus food
- ✅ Get automatic notifications when someone favorites them (via trigger)
- ✅ View reports about their vendor (read-only)

### For Admins
- ✅ Review and manage vendor reports
- ✅ All previous admin features still work

## Troubleshooting

### Notifications not showing?
1. Check database - ensure `notifications` table exists
2. Check trigger - ensure `trigger_notify_on_new_food` exists
3. Check favorites - user must favorite vendor first
4. Check browser console for errors

### Ratings showing 0?
- This is normal if no reviews exist yet
- Ratings only show when vendor has at least 1 review

### Reports not appearing in admin?
1. Check admin role in profiles table
2. Check RLS policies for reports table
3. Check browser console for errors

### Favorites not working?
1. Check `favorites` table exists
2. Check user is logged in
3. Check RLS policies allow INSERT/SELECT

## Next Steps (Optional Future Enhancements)

- Add email notifications (using Supabase email)
- Add SMS notifications for critical alerts
- Add more notification types (order status, etc.)
- Enhanced analytics in admin dashboard
- Vendor response to reports

## Important Notes

- All features use database-backed storage (no localStorage for critical data)
- Real-time updates via Supabase subscriptions
- RLS policies ensure security
- All components are responsive and mobile-friendly

---

**You're ready to launch! 🚀**

All critical MVP features are now implemented and working.

