## Audio proxy for Supabase (Cloudflare Worker)

To ensure CORS and Range headers for audio analysis, deploy a minimal Cloudflare Worker and set the proxy base URL in env:

1. Deploy a Worker (example name `supabase-audio-proxy`).
2. Set env in your app:

```
VITE_AUDIO_PROXY_ORIGIN=https://supabase-audio-proxy.<your-account>.workers.dev/
```

With this set, audio URLs are wrapped via `src/lib/audioProxy.ts` and `<audio crossOrigin="anonymous">` is enabled in `src/components/music/MusicPlayer.tsx` so `Orb` can attach a Web Audio analyser.



# Origins Radio

A modern music platform built with React, TypeScript, and Supabase.

## Project Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd origins-radio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the root directory
touch .env

# Add your Supabase credentials to the .env file:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Example .env file:**
```
VITE_SUPABASE_URL=https://azfazwgrfazdaunigqbd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Run the development server:
```bash
npm run dev
```

## Environment Variables

The following environment variables are required for full functionality:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

⚠️ **Important**: 
- Never commit your `.env` file to version control. It's already added to `.gitignore` for security.
- The application will work without these variables but will show warnings and return empty data for Supabase operations.
- For production deployment (Vercel), add these environment variables in your Vercel project settings.

## Development

- **Development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Type checking**: `npx tsc --noEmit`

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel project settings:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your Supabase credentials

### Local Development Without Supabase

The application is designed to work without Supabase configuration for development purposes. When Supabase is not configured:
- Data fetching functions return empty arrays or null values
- Console warnings will be shown for Supabase operations
- The UI will gracefully handle missing data

## Supabase Setup

For full functionality, you'll need to set up a Supabase project:

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Set up the database schema (see `SUPABASE_SETUP.md` for details)
4. Create storage buckets for audio and images
5. Configure Row Level Security policies

See `SUPABASE_SETUP.md` for detailed setup instructions.