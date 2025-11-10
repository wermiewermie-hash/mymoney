# Database Setup Instructions

## How to set up your database

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/srioriygosfwkohptqlc

2. Click on **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `migrations/001_initial_schema.sql`

5. Paste it into the SQL editor

6. Click **Run** (or press Cmd/Ctrl + Enter)

7. You should see "Success. No rows returned" - this means your database is set up!

## What this creates

### Tables:
- **profiles** - Stores user information (username, email, full name)
- **assets** - Stores each asset (bank accounts, stocks, retirement accounts, index funds)
- **snapshots** - Tracks net worth history over time

### Security:
- Row Level Security (RLS) is enabled so users can only see their own data
- Automatic profile creation when users sign up
- Automatic timestamp updates

### Asset Types Supported:
- bank_account
- stocks
- retirement_account
- index_funds

## Testing the database

After running the migration, you can test it by going to **Table Editor** in the Supabase dashboard and you should see the three tables: profiles, assets, and snapshots.
