# SavePlate Deployment Guide

This guide covers deploying SavePlate to various platforms.

## Prerequisites

1. ✅ Database setup complete (see `database_setup.sql`)
2. ✅ Storage buckets created (see `STORAGE_SETUP.md`)
3. ✅ Build tested locally

## Environment Variables

The app uses these environment variables (optional - defaults are already configured):

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Note:** If not set, the app will use the default values already in the code.

## Local Build Test

Test the production build locally first:

```bash
npm run build
npm run preview
```

This will create a `dist` folder with the optimized production build.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Or Deploy via GitHub**:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

4. **Configure Environment Variables** (if needed):
   - Go to Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if you want to use different values
   - Redeploy

**Vercel Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Option 2: Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy via CLI**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Or Deploy via GitHub**:
   - Push your code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

4. **Configure Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if needed

**Netlify Configuration:**
A `netlify.toml` file is included for automatic configuration.

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.js**:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/saveplate/' // Replace with your repo name
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

### Option 4: Other Static Hosting

Any static hosting service can host the `dist` folder after running `npm run build`:

- **Cloudflare Pages**
- **AWS S3 + CloudFront**
- **Firebase Hosting**
- **Surge.sh**
- **Render** (Static Sites)

## Post-Deployment Checklist

After deployment, verify:

1. ✅ App loads without errors
2. ✅ Authentication works (sign up/login)
3. ✅ Database connection works
4. ✅ Image uploads work (if storage buckets are set up)
5. ✅ All routes work correctly
6. ✅ Notifications load
7. ✅ Ratings display correctly

## Troubleshooting

### Build Fails

- Check for syntax errors: `npm run lint`
- Verify all dependencies are installed: `npm install`
- Check console for specific error messages

### App Works Locally but Not Deployed

- Verify environment variables are set in deployment platform
- Check browser console for errors
- Verify Supabase URLs are accessible from the deployment domain
- Check CORS settings in Supabase if needed

### Images Not Loading

- Verify storage buckets are created in Supabase
- Check storage bucket policies are set correctly
- Verify bucket is public (for `food-images`)

### Authentication Issues

- Verify Supabase project is active
- Check Supabase dashboard for any service interruptions
- Verify redirect URLs are configured in Supabase Auth settings if needed

## Quick Deploy Commands

**Vercel:**
```bash
vercel
```

**Netlify:**
```bash
npm run build && netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
npm run deploy
```

---

**Recommended:** Start with Vercel - it's the easiest and fastest option for React apps!

