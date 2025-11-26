# SavePlate

A surplus food redistribution platform connecting vendors with students and communities in Africa. Reduce food waste while providing affordable meals.

## Features

- **Vendor Management**: Verified vendors list surplus food with expiry timers
- **Student Dashboard**: Browse, search, and filter available food items
- **Notifications**: Get alerts when favorite vendors post new food
- **Ratings & Reviews**: Rate vendors based on food quality
- **Reporting System**: Report issues for admin review
- **Admin Dashboard**: Manage vendors, listings, and reports

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel or Netlify

---

## Quick Start Guide

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- A Supabase account (free at [supabase.com](https://supabase.com))

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd saveplate

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL
   - anon/public key

3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Set Up Database

1. Go to Supabase Dashboard > **SQL Editor**
2. Open `sql/00_RUN_ALL.sql` from this project
3. Copy the entire contents and paste into SQL Editor
4. Click **Run**

### Step 4: Set Up Storage Buckets

1. Go to Supabase Dashboard > **Storage**
2. Click **New bucket**
3. Create `food-images`:
   - Name: `food-images`
   - Public bucket: **YES** (checked)
4. Create `vendor-docs`:
   - Name: `vendor-docs`
   - Public bucket: **NO** (unchecked)
5. Go back to SQL Editor and run `sql/06_storage_policies.sql`

### Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 6: Create Admin User

1. Sign up in the app with your email
2. Go to Supabase Dashboard > **SQL Editor**
3. Run:

```sql
UPDATE profiles
SET role = 'admin', verification_status = 'verified', is_verified = true
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);
```

4. Log out and log back in to access `/admin`

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click Deploy

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Site Settings

---

## Project Structure

```
saveplate/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (routes)
│   ├── context/        # React context (global state)
│   ├── lib/            # Supabase client
│   └── utils/          # Utility functions
├── sql/                # Database setup scripts
├── public/             # Static assets
└── dist/               # Production build
```

---

## User Roles

| Role | Access |
|------|--------|
| **Student** | Browse food, contact vendors, rate/review, report |
| **Vendor** | List food, manage listings, view orders |
| **Admin** | Verify vendors, manage reports, view analytics |

---

## SQL Files Reference

Run these in order if `00_RUN_ALL.sql` fails:

| File | Description |
|------|-------------|
| `01_core_tables.sql` | Creates profiles and food_items tables |
| `02_feature_tables.sql` | Creates notifications, favorites, reports, reviews |
| `03_rls_policies.sql` | Row Level Security policies |
| `04_functions_triggers.sql` | Database functions and triggers |
| `05_grants_permissions.sql` | User permissions |
| `06_storage_policies.sql` | Storage bucket policies |
| `07_seed_admin.sql` | Create admin user |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

---

## Support

For issues or questions, please open an issue on GitHub.

---

## License

MIT License
