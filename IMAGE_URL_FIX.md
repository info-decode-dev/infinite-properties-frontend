# Image URL Fix - Supabase Images Not Visible

## Problem
Images uploaded to Supabase Storage were not visible in the UI because the frontend was prepending the API URL to full Supabase URLs, creating invalid URLs like:
```
https://your-backend.railway.apphttps://ajcrudkaxzopexibomyz.supabase.co/storage/...
```

## Solution
Created a utility function `getImageUrl()` that:
1. Checks if the image path is already a full URL (starts with `http://`, `https://`, or `blob:`)
2. If it's a full URL, uses it as-is
3. If it's a relative path, prepends the API URL

## Files Updated
- ✅ `client/lib/imageUtils.ts` - New utility function
- ✅ `client/app/admin/properties/[id]/page.tsx` - Fixed image URLs
- ✅ `client/app/admin/properties/page.tsx` - Fixed image URLs
- ✅ `client/app/admin/enquiries/[id]/page.tsx` - Fixed image URLs
- ✅ `client/app/admin/enquiries/page.tsx` - Fixed image URLs
- ✅ `client/app/admin/collections/page.tsx` - Fixed image URLs

## Verify Supabase Bucket is Public

**IMPORTANT:** Make sure your Supabase Storage bucket is set to **Public**:

1. Go to Supabase Dashboard → **Storage**
2. Click on your `uploads` bucket
3. Go to **Settings** tab
4. Make sure **Public bucket** is **enabled** ✅
5. If it's not public, enable it and save

## Test
After deploying these changes:
1. Images from Supabase should display correctly
2. Both full Supabase URLs and relative paths should work
3. Check browser console for any CORS errors (if you see CORS errors, the bucket might not be public)
