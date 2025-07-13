-- Database Updates for Origins Radio
-- Add views counter and years of experience to existing tables

-- 1. Add views counter to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 2. Add years of experience to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;

-- 3. Add views counter to tracks table
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 4. Add views counter to sets table
ALTER TABLE sets 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 5. Create function to increment views
CREATE OR REPLACE FUNCTION increment_views(table_name TEXT, record_id UUID)
RETURNS VOID AS $$
BEGIN
  IF table_name = 'artists' THEN
    UPDATE artists SET views_count = views_count + 1 WHERE id = record_id;
  ELSIF table_name = 'tracks' THEN
    UPDATE tracks SET views_count = views_count + 1 WHERE id = record_id;
  ELSIF table_name = 'sets' THEN
    UPDATE sets SET views_count = views_count + 1 WHERE id = record_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to update artist experience based on creation date
CREATE OR REPLACE FUNCTION update_artist_experience()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate years of experience based on created_at date
  NEW.years_experience = EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM NEW.created_at);
  
  -- Ensure minimum of 1 year experience
  IF NEW.years_experience < 1 THEN
    NEW.years_experience = 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update experience when artist is created
DROP TRIGGER IF EXISTS update_artist_experience_trigger ON artists;
CREATE TRIGGER update_artist_experience_trigger
  BEFORE INSERT OR UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_experience();

-- 8. Update existing artists with calculated experience
UPDATE artists 
SET years_experience = GREATEST(1, EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM created_at))
WHERE years_experience = 0 OR years_experience IS NULL;

-- 9. Create indexes for better performance on views queries
CREATE INDEX IF NOT EXISTS idx_artists_views ON artists(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_views ON tracks(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_sets_views ON sets(views_count DESC);

-- 10. Add RLS policies for views (if RLS is enabled)
-- Allow public read access to views_count
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to views') THEN
    CREATE POLICY "Allow public read access to views" ON artists
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to track views') THEN
    CREATE POLICY "Allow public read access to track views" ON tracks
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to set views') THEN
    CREATE POLICY "Allow public read access to set views" ON sets
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update views') THEN
    CREATE POLICY "Allow authenticated update views" ON artists
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update track views') THEN
    CREATE POLICY "Allow authenticated update track views" ON tracks
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update set views') THEN
    CREATE POLICY "Allow authenticated update set views" ON sets
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 11. Create a view for popular content
CREATE OR REPLACE VIEW popular_content AS
SELECT 
  'artist' as content_type,
  id,
  name as title,
  views_count,
  created_at
FROM artists
WHERE views_count > 0
UNION ALL
SELECT 
  'track' as content_type,
  id,
  title,
  views_count,
  created_at
FROM tracks
WHERE views_count > 0
UNION ALL
SELECT 
  'set' as content_type,
  id,
  title,
  views_count,
  created_at
FROM sets
WHERE views_count > 0
ORDER BY views_count DESC;

-- 12. Add comments for documentation
COMMENT ON COLUMN artists.views_count IS 'Number of profile views for this artist';
COMMENT ON COLUMN artists.years_experience IS 'Years of experience as a DJ/artist';
COMMENT ON COLUMN tracks.views_count IS 'Number of times this track has been viewed/played';
COMMENT ON COLUMN sets.views_count IS 'Number of times this set has been viewed/played';
COMMENT ON FUNCTION increment_views(TEXT, UUID) IS 'Increment views counter for a specific record';
COMMENT ON FUNCTION update_artist_experience() IS 'Automatically calculate years of experience based on creation date'; 