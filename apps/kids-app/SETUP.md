# Net Worth Tracker Setup

## Supabase Configuration

Since this app uses username-only authentication (no email validation), you need to disable email confirmation in Supabase:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/srioriygosfwkohptqlc
2. Click **Authentication** in the left sidebar
3. Click **Providers** tab
4. Scroll down to **Email**
5. Make sure **"Enable email confirmations"** is turned OFF

This allows users to sign up with just a username and password without needing to verify an email address.

## How Authentication Works

- Users sign up with **username** and **password** only
- The system auto-generates a fake email (`username@networthtracker.app`) for Supabase Auth
- Users never see or interact with emails
- Login uses **username** and **password**

## Database Structure

- **profiles** table stores only: id, username, full_name, created_at, updated_at
- Email has been removed from profiles
- Authentication email is handled transparently by Supabase Auth
