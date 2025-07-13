-- Storage Bucket Setup for Origins Radio
-- Run these scripts in your Supabase SQL Editor

-- 1. Create audio storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies for audio bucket
CREATE POLICY "Allow public read access to audio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Allow authenticated uploads to audio bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates to audio files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes from audio bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'audio' AND auth.role() = 'authenticated');

-- 4. Create storage policies for images bucket
CREATE POLICY "Allow public read access to image files" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated uploads to images bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates to image files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes from images bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated'); 