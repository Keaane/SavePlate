# Supabase Storage Bucket Setup

## Required Storage Buckets

The app needs two storage buckets for file uploads:

1. **`food-images`** - For food item photos
2. **`vendor-docs`** - For vendor ID cards and documents (optional)

## Setup Instructions

### Step 1: Create Storage Buckets in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**

#### Create `food-images` bucket:
- **Name:** `food-images`
- **Public bucket:** ✅ **YES** (checked) - so images can be viewed by anyone
- **File size limit:** 5 MB (recommended)
- **Allowed MIME types:** `image/*` (or leave empty for all types)
- Click **"Create bucket"**

#### Create `vendor-docs` bucket (Optional):
- **Name:** `vendor-docs`
- **Public bucket:** ❌ **NO** (unchecked) - documents should be private
- **File size limit:** 10 MB
- **Allowed MIME types:** `image/*`
- Click **"Create bucket"**

### Step 2: Set Up Storage Policies

After creating the buckets, you need to set up Row Level Security (RLS) policies:

#### For `food-images` (Public bucket):
Go to **Storage** → **Policies** → `food-images`:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload food images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'food-images');

-- Allow public to view food images
CREATE POLICY "Public can view food images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'food-images');

-- Allow users to update/delete their own uploads
CREATE POLICY "Users can update their own food images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own food images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### For `vendor-docs` (Private bucket):
Go to **Storage** → **Policies** → `vendor-docs`:

```sql
-- Allow authenticated vendors to upload their own docs
CREATE POLICY "Vendors can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vendor-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vendor-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all documents
CREATE POLICY "Admins can view all vendor documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vendor-docs'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
```

### Step 3: Verify Setup

1. Try uploading a food image in the vendor dashboard
2. Check if the image appears in the `food-images` bucket in Supabase Storage
3. Verify the image URL is accessible

## Quick SQL Script (Optional)

You can also create buckets via SQL if you prefer:

```sql
-- Note: Buckets must be created via UI, but policies can be set via SQL
-- After creating buckets in UI, run the policy SQL above
```

## Troubleshooting

### Error: "Bucket not found"
- ✅ Make sure you created the bucket in Supabase Dashboard
- ✅ Check the bucket name matches exactly: `food-images` and `vendor-docs`

### Error: 400 Bad Request
- ✅ Check bucket exists
- ✅ Check file size is under limit
- ✅ Check file type is allowed (images only)
- ✅ Check RLS policies are set correctly

### Error: "Permission denied"
- ✅ Check RLS policies allow authenticated users to upload
- ✅ Check bucket is set to public (for `food-images`)

### Images not showing
- ✅ Check bucket is public (for `food-images`)
- ✅ Check you're using the correct public URL method
- ✅ Check CORS settings if needed

---

**After setting up buckets, the app will work correctly!** 🎉


