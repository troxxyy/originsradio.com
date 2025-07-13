# Supabase Integration for Origins Radio

This document outlines the Supabase integration for the Origins Radio project, including setup, database schema, and usage examples.

## Setup

### 1. Installation
Supabase client has been installed:
```bash
npm install @supabase/supabase-js
```

### 2. Configuration
The Supabase client is configured in `src/lib/supabase.ts` with your provided credentials:
- URL: `https://azfazwgrfazdaunigqbd.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Database Schema

### Tables

#### Artists Table
```sql
CREATE TABLE artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tracks Table
```sql
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Sets Table
```sql
CREATE TABLE sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  release_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Storage Buckets

Create the following storage buckets in your Supabase dashboard:

### Audio Bucket
- Name: `audio`
- Public bucket for storing audio files
- Policies: Allow public read access

### Images Bucket
- Name: `images`
- Public bucket for storing artist photos and other images
- Policies: Allow public read access

## Usage Examples

### 1. Fetching Data

```typescript
import { useSets, useArtists } from '../hooks/use-supabase';

// In a component
const { data: sets, isLoading, error } = useSets();
const { data: artists } = useArtists();
```

### 2. Creating Data

```typescript
import { useCreateArtist, useCreateSet } from '../hooks/use-supabase';

const createArtist = useCreateArtist();
const createSet = useCreateSet();

// Create an artist
await createArtist.mutateAsync({
  name: 'Artist Name',
  bio: 'Artist bio...',
  photo_url: 'https://example.com/photo.jpg'
});

// Create a set
await createSet.mutateAsync({
  title: 'Set Title',
  artist_id: 'artist-uuid',
  audio_url: 'https://example.com/audio.mp3',
  release_date: '2025-01-15'
});
```

### 3. File Uploads

```typescript
import { useUploadAudio, useUploadImage } from '../hooks/use-supabase';

const uploadAudio = useUploadAudio();
const uploadImage = useUploadImage();

// Upload audio file
const audioUrl = await uploadAudio.mutateAsync({
  file: audioFile,
  path: `sets/${Date.now()}-${audioFile.name}`
});

// Upload image file
const imageUrl = await uploadImage.mutateAsync({
  file: imageFile,
  path: `artists/${Date.now()}-${imageFile.name}`
});
```

## Components

### Admin Interface
Located at `src/pages/AdminArtists.tsx`, this comprehensive admin interface provides:
- Adding new artists
- Adding new sets
- File uploads for audio and images

### Updated UpNext Component
The `src/components/home/UpNext.tsx` component has been updated to:
- Fetch sets from Supabase
- Display dynamic data from the database
- Fall back to static data if Supabase is not configured

## Hooks

### Available Hooks
- `useArtists()` - Fetch all artists
- `useArtist(id)` - Fetch specific artist
- `useCreateArtist()` - Create new artist
- `useTracks()` - Fetch all tracks
- `useTracksByArtist(artistId)` - Fetch tracks by artist
- `useCreateTrack()` - Create new track
- `useSets()` - Fetch all sets
- `useSet(id)` - Fetch specific set
- `useCreateSet()` - Create new set
- `useUploadAudio()` - Upload audio files
- `useUploadImage()` - Upload image files

## Error Handling

All Supabase operations include proper error handling:
- Network errors are caught and logged
- User-friendly error messages via toast notifications
- Graceful fallbacks for missing data

## Security

### Row Level Security (RLS)
Consider implementing RLS policies for production:

```sql
-- Example: Allow public read access to artists
CREATE POLICY "Allow public read access" ON artists
  FOR SELECT USING (true);

-- Example: Allow authenticated users to create artists
CREATE POLICY "Allow authenticated insert" ON artists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Storage Policies
```sql
-- Allow public read access to audio files
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

-- Allow authenticated uploads to audio bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');
```

## Next Steps

1. **Set up the database tables** in your Supabase dashboard
2. **Create storage buckets** for audio and images
3. **Configure RLS policies** for security
4. **Test the integration** using the admin panel
5. **Deploy and monitor** the application

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Supabase project allows requests from your domain
2. **Storage Access**: Check that storage buckets are public or have proper policies
3. **RLS Policies**: Verify that RLS policies allow the operations you need
4. **File Uploads**: Ensure file size limits are appropriate for your use case

### Debug Tips

- Check browser console for detailed error messages
- Use Supabase dashboard to monitor queries and storage usage
- Test queries directly in Supabase SQL editor
- Verify environment variables are correctly set 