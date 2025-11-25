# SavePlate - Surplus Food Redistribution Platform

SavePlate connects surplus food from vendors (restaurants, cafes, supermarkets) with students and low-income communities in Africa, reducing food waste while providing affordable meals.

## Features

- **Vendor Management**: Verified vendors can list surplus food with expiry timers
- **Student Dashboard**: Browse available food items with real-time availability
- **In-App Notifications**: Get notified when favorite vendors post new food
- **Rating System**: Rate and review vendors based on food quality
- **Reporting System**: Report issues with vendors or food items
- **Admin Dashboard**: Manage vendors, listings, and user reports

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router DOM
- **Styling**: Inline styles (no CSS framework)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd saveplate
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase (see `SETUP_INSTRUCTIONS.md`):
   - Run `database_setup.sql` in Supabase SQL Editor
   - Create storage buckets (see `STORAGE_SETUP.md`)

4. Start development server:
```bash
npm run dev
```

## Setup Instructions

1. **Database Setup**: See `SETUP_INSTRUCTIONS.md`
2. **Storage Setup**: See `STORAGE_SETUP.md` (required for image uploads)
3. **Environment Variables** (optional): Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` file

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

**Quick Deploy (Vercel - Recommended):**
```bash
npm run build
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Project Structure

```
saveplate/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # React context (AppContext)
│   ├── lib/            # Supabase client
│   └── utils/          # Utility functions
├── database_setup.sql  # Database schema
├── STORAGE_SETUP.md    # Storage bucket setup
├── DEPLOYMENT.md       # Deployment guide
└── SETUP_INSTRUCTIONS.md
```

## Documentation

- `SETUP_INSTRUCTIONS.md` - Complete setup guide
- `DEPLOYMENT.md` - Deployment instructions
- `STORAGE_SETUP.md` - Supabase storage configuration
- `MINIMAL_MVP_SCOPE.md` - MVP feature list
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

## License

MIT

## Contributing

This is a project for addressing food waste in African communities. Contributions are welcome!
