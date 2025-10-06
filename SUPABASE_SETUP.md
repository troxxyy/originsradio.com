# Supabase Setup Guide

## The Issue
The blog details page shows a black screen because the Supabase environment variables are not configured.

## Solution

1. **Create a `.env` file** in the project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and API keys

3. **Replace the placeholder values:**
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Verification
After setting up the environment variables, the blog details page should work correctly. You can test by navigating to `/blog` and clicking on any blog post.

## Database Setup
Make sure your Supabase database has the required tables and data:
- The `blogs` table should exist with the proper schema
- Run the migrations in the `supabase/migrations/` folder
- Ensure there are published blog posts in the database
