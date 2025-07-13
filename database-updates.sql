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

-- 5. Create likes table for artist likes
CREATE TABLE IF NOT EXISTS artist_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Using text for anonymous users (browser fingerprint or session)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artist_id, user_id)
);

-- 6. Create function to increment views
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

-- 7. Create function to toggle artist like
CREATE OR REPLACE FUNCTION toggle_artist_like(artist_uuid UUID, user_identifier TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like exists
  SELECT EXISTS(SELECT 1 FROM artist_likes WHERE artist_id = artist_uuid AND user_id = user_identifier) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM artist_likes WHERE artist_id = artist_uuid AND user_id = user_identifier;
    RETURN FALSE;
  ELSE
    -- Add like
    INSERT INTO artist_likes (artist_id, user_id) VALUES (artist_uuid, user_identifier);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to get artist like count
CREATE OR REPLACE FUNCTION get_artist_like_count(artist_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  like_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO like_count FROM artist_likes WHERE artist_id = artist_uuid;
  RETURN like_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to check if user liked artist
CREATE OR REPLACE FUNCTION is_artist_liked_by_user(artist_uuid UUID, user_identifier TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_liked BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM artist_likes WHERE artist_id = artist_uuid AND user_id = user_identifier) INTO is_liked;
  RETURN is_liked;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to update artist experience based on creation date
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

-- 11. Create trigger to automatically update experience when artist is created
DROP TRIGGER IF EXISTS update_artist_experience_trigger ON artists;
CREATE TRIGGER update_artist_experience_trigger
  BEFORE INSERT OR UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_experience();

-- 12. Update existing artists with calculated experience
UPDATE artists 
SET years_experience = GREATEST(1, EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM created_at))
WHERE years_experience = 0 OR years_experience IS NULL;

-- 13. Create indexes for better performance on views queries
CREATE INDEX IF NOT EXISTS idx_artists_views ON artists(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_views ON tracks(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_sets_views ON sets(views_count DESC);

-- 14. Create indexes for likes table
CREATE INDEX IF NOT EXISTS idx_artist_likes_artist_id ON artist_likes(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_likes_user_id ON artist_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_likes_created_at ON artist_likes(created_at DESC);

-- 15. Add RLS policies for views (if RLS is enabled)
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

-- 16. Add RLS policies for likes table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to likes') THEN
    CREATE POLICY "Allow public read access to likes" ON artist_likes
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert likes') THEN
    CREATE POLICY "Allow public insert likes" ON artist_likes
      FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public delete own likes') THEN
    CREATE POLICY "Allow public delete own likes" ON artist_likes
      FOR DELETE USING (true);
  END IF;
END $$;

-- 17. Create a view for popular content
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

-- 18. Create a view for artist likes
CREATE OR REPLACE VIEW artist_likes_view AS
SELECT 
  a.id as artist_id,
  a.name as artist_name,
  COUNT(al.id) as like_count
FROM artists a
LEFT JOIN artist_likes al ON a.id = al.artist_id
GROUP BY a.id, a.name
ORDER BY like_count DESC;

-- 19. Add comments for documentation
COMMENT ON COLUMN artists.views_count IS 'Number of profile views for this artist';
COMMENT ON COLUMN artists.years_experience IS 'Years of experience as a DJ/artist';
COMMENT ON COLUMN tracks.views_count IS 'Number of times this track has been viewed/played';
COMMENT ON COLUMN sets.views_count IS 'Number of times this set has been viewed/played';
COMMENT ON TABLE artist_likes IS 'Table to track user likes for artists';
COMMENT ON COLUMN artist_likes.user_id IS 'User identifier (browser fingerprint or session ID)';
COMMENT ON FUNCTION increment_views(TEXT, UUID) IS 'Increment views counter for a specific record';
COMMENT ON FUNCTION toggle_artist_like(UUID, TEXT) IS 'Toggle like status for an artist by a user';
COMMENT ON FUNCTION get_artist_like_count(UUID) IS 'Get total like count for an artist';
COMMENT ON FUNCTION is_artist_liked_by_user(UUID, TEXT) IS 'Check if user has liked an artist';
COMMENT ON FUNCTION update_artist_experience() IS 'Automatically calculate years of experience based on creation date'; 