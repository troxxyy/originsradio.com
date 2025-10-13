import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Artist = Database['public']['Tables']['artists']['Row'];
type ArtistInsert = Database['public']['Tables']['artists']['Insert'];
type ArtistUpdate = Database['public']['Tables']['artists']['Update'];

// Get all artists
export const getArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching artists:', error);
    throw error;
  }
  
  return data || [];
};

// Get artist by ID
export const getArtistById = async (id: string): Promise<Artist | null> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching artist:', error);
    return null;
  }
  
  return data;
};

// Add new artist
export const addArtist = async (artistData: ArtistInsert): Promise<Artist | null> => {
  const { data, error } = await supabase
    .from('artists')
    .insert(artistData)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error creating artist:', error);
    return null;
  }
  
  return data;
};

// Update existing artist
export const updateArtist = async (id: string, updates: ArtistUpdate): Promise<Artist | null> => {
  const updateData: ArtistUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('artists')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error updating artist:', error);
    return null;
  }
  
  return data;
};

// Delete artist
export const deleteArtist = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('artists')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting artist:', error);
    return false;
  }
  
  return true;
};

// Bulk update artists
export const bulkUpdateArtists = async (ids: string[], updates: ArtistUpdate): Promise<void> => {
  const updateData: ArtistUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('artists')
    .update(updateData)
    .in('id', ids);
  
  if (error) {
    console.error('Error bulk updating artists:', error);
    throw error;
  }
};

// Bulk delete artists
export const bulkDeleteArtists = async (ids: string[]): Promise<number> => {
  const { error } = await supabase
    .from('artists')
    .delete()
    .in('id', ids);
  
  if (error) {
    console.error('Error bulk deleting artists:', error);
    return 0;
  }
  
  return ids.length;
};

// Search artists
export const searchArtists = async (query: string): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .or(`name.ilike.%${query}%,bio.ilike.%${query}%,location.ilike.%${query}%`)
    .order('name');
  
  if (error) {
    console.error('Error searching artists:', error);
    throw error;
  }
  
  return data || [];
};

// Get paginated artists with filters
export const getPaginatedArtists = async (
  page: number = 1, 
  limit: number = 12, 
  filters: {
    featured?: boolean;
    location?: string;
    genre?: string;
    search?: string;
  } = {}
): Promise<{ artists: Artist[]; total: number; pages: number }> => {
  let query = supabase.from('artists').select('*', { count: 'exact' });
  
  // Apply filters
  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }
  
  if (filters.location && filters.location !== 'all') {
    query = query.ilike('location', `%${filters.location}%`);
  }
  
  if (filters.genre && filters.genre !== 'all') {
    query = query.contains('genre', [filters.genre]);
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
  }
  
  // Get total count
  const { count } = await query;
  const total = count || 0;
  const pages = Math.ceil(total / limit);
  
  // Get paginated data
  const startIndex = (page - 1) * limit;
  const { data, error } = await query
    .order('name')
    .range(startIndex, startIndex + limit - 1);
  
  if (error) {
    console.error('Error fetching paginated artists:', error);
    throw error;
  }
  
  return {
    artists: data || [],
    total,
    pages
  };
};

// Get artist stats
export const getArtistStats = async () => {
  const { data, error } = await supabase
    .from('artists')
    .select('featured');
  
  if (error) {
    console.error('Error fetching artist stats:', error);
    return {
      total: 0,
      featured: 0,
      active: 0,
      inactive: 0,
      pending: 0,
    };
  }
  
  const artists = data || [];
  const featured = artists.filter(artist => artist.featured).length;
  
  return {
    total: artists.length,
    featured,
    active: artists.length, // All artists are considered active
    inactive: 0,
    pending: 0,
  };
};

// Get featured artists
export const getFeaturedArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('featured', true)
    .order('name');
  
  if (error) {
    console.error('Error fetching featured artists:', error);
    throw error;
  }
  
  return data || [];
};

// Get artists by location
export const getArtistsByLocation = async (location: string): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .ilike('location', `%${location}%`)
    .order('name');
  
  if (error) {
    console.error('Error fetching artists by location:', error);
    throw error;
  }
  
  return data || [];
};

// Get artists by genre
export const getArtistsByGenre = async (genre: string): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .contains('genre', [genre])
    .order('name');
  
  if (error) {
    console.error('Error fetching artists by genre:', error);
    throw error;
  }
  
  return data || [];
};

// Export artists data
export const exportArtistsData = async (): Promise<string> => {
  const artists = await getArtists();
  return JSON.stringify(artists, null, 2);
};

// Export types for use in other files
export type { Artist, ArtistInsert, ArtistUpdate }; 