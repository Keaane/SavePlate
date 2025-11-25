# Quick Deployment Guide - SavePlate

## ✅ Pre-Deployment Checklist

- [x] Build tested successfully (`npm run build` works)
- [x] Database setup complete (see `database_setup.sql`)
- [ ] Storage buckets created (see `STORAGE_SETUP.md`) - **Required for image uploads**
- [ ] Supabase project active

## 🚀 Deploy to Vercel (Recommended - 2 minutes)

### Option 1: Deploy via GitHub (Easiest)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login (free account)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects settings (already configured in `vercel.json`)
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   - Follow prompts to link/create project
   - Press enter to accept defaults

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## 🌐 Deploy to Netlify (Alternative)

1. **Push to GitHub** (same as above)

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Netlify auto-detects settings from `netlify.toml`
   - Click "Deploy site"

## 📝 Environment Variables (Optional)

Your Supabase credentials are already hardcoded as fallbacks. If you want to use environment variables instead:

1. In Vercel/Netlify dashboard:
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   - Redeploy

## ✅ Post-Deployment Verification

After deployment, test:

1. ✅ App loads at the deployed URL
2. ✅ Can sign up/login
3. ✅ Can browse food items
4. ✅ Can view vendor profiles
5. ✅ Image uploads work (if storage buckets are set up)

## 🔧 If Something Breaks

1. Check browser console for errors
2. Verify Supabase project is active
3. Check deployment logs in Vercel/Netlify dashboard
4. Ensure storage buckets are created (see `STORAGE_SETUP.md`)

---

**Ready to deploy?** Use Vercel via GitHub for the fastest deployment! 🚀

