# My Money - Monorepo

This monorepo contains both the Parent and Kids apps for the My Money family finance tracking application.

## Structure

```
mymoney/
├── apps/
│   ├── parent-app/     # Parent dashboard (Net Worth Tracker)
│   └── kids-app/       # Kids dashboard (Allowance & Goals)
├── shared/             # Shared components, utilities, and styles (for future use)
└── .git/               # Single git repository
```

## Apps

### Parent App
- **Local Development**: `http://localhost:3001`
- **Production URL**: https://mymoney-agxx.vercel.app
- **Vercel Project**: `mymoney-parents`
- **Features**: Net worth tracking, asset management, stock portfolio, family goals

### Kids App
- **Local Development**: `http://localhost:3000`
- **Production URL**: https://mymoney-gilt-six.vercel.app
- **Vercel Project**: `mymoney-kids`
- **Features**: Allowance tracking, savings goals, kid-friendly interface

## Development

Each app runs independently:

```bash
# Parent app
cd apps/parent-app
npm install
npm run dev  # Runs on port 3001

# Kids app
cd apps/kids-app
npm install
npm run dev  # Runs on port 3000
```

## Shared Authentication & Database

Both apps share:
- Supabase authentication system
- Unified password reset flow (hosted on parent app)
- PostgreSQL database with separate tables for each app

## Deployment

Each app is deployed separately to Vercel:
- Vercel projects point to respective subdirectories (`apps/parent-app` and `apps/kids-app`)
- Environment variables are configured per project
- Both apps share the same GitHub repository

## Future Improvements

The `shared/` directory is prepared for extracting common components:
- Modal components
- Card layouts
- Color schemes and design tokens
- Authentication utilities
- Supabase client configuration
# Auto-deploy test - Sun Nov 10 2025
# Deployment trigger - fixing NEXT_PUBLIC_SITE_URL
