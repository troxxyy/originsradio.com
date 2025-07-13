

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
# Copy the example environment file
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

⚠️ **Important**: Never commit your `.env` file to version control. It's already added to `.gitignore` for security.

## Development

- **Development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Type checking**: `npx tsc --noEmit`