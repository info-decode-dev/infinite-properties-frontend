# Vercel Deployment Guide

This guide will help you deploy the Infinite Properties Frontend to Vercel.

## Prerequisites

- GitHub account with repository: `info-decode-dev/infinite-properties-frontend`
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Backend API deployed on Railway

## Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository: `info-decode-dev/infinite-properties-frontend`
5. Click **"Import"**

## Step 2: Configure Project Settings

Vercel should auto-detect Next.js, but verify:

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: Leave empty (or set to `/` if needed)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

## Step 3: Add Environment Variables

Before deploying, add environment variables:

1. In Vercel project settings, go to **Environment Variables**
2. Click **"Add New"**
3. Add this variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://infinite-properties-backend-production.up.railway.app`
   - **Environment**: Production, Preview, Development (select all)
4. Click **"Save"**

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Vercel will provide a URL like: `https://infinite-properties-frontend.vercel.app`

## Step 5: Update CORS_ORIGIN in Railway

After getting your Vercel URL:

1. Go to **Railway** → Your Backend Service → **Variables**
2. Find `CORS_ORIGIN`
3. Update it to your Vercel URL:
   ```
   https://your-frontend-url.vercel.app
   ```
   - Include `https://`
   - No trailing slash
   - Exact match
4. Save (Railway will auto-redeploy)

## Step 6: Test Your Application

1. Visit your Vercel frontend URL
2. Test features:
   - Browse properties
   - View property details
   - Submit enquiries
   - Test admin login

## Environment Variables Summary

### Required for Vercel:
```env
NEXT_PUBLIC_API_URL=https://infinite-properties-backend-production.up.railway.app
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

### API Calls Fail
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS_ORIGIN in Railway matches Vercel URL exactly
- Check browser console for CORS errors

### 404 Errors
- Verify root directory is correct
- Check Next.js routing configuration

## Next Steps

- Set up custom domain (optional)
- Configure preview deployments
- Set up monitoring and analytics
