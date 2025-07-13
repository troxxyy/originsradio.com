import { getSupabaseClient, isSupabaseConfigured } from './supabase'
import type { Database } from './supabase'

type Artist = Database['public']['Tables']['artists']['Row']
type Track = Database['public']['Tables']['tracks']['Row']
type Set = Database['public']['Tables']['sets']['Row']
type Event = Database['public']['Tables']['events']['Row']

// Utility function to generate slug from name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '') // Remove special characters but keep spaces
    .replace(/\s+/g, '') // Remove all spaces
    .trim()
}

// Artist utilities
export const getArtists = async (): Promise<Artist[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty artists array')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching artists:', error)
    throw error
  }
  
  return data || []
}

export const getArtistById = async (id: string): Promise<Artist | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning null for artist')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching artist:', error)
    return null
  }
  
  return data
}

// Get artist by slug (name-based)
export const getArtistBySlug = async (slug: string): Promise<Artist | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning null for artist by slug')
    return null
  }
  
  const supabase = getSupabaseClient()
  // Get all artists and find the one that matches the slug
  const { data: allArtists, error } = await supabase
    .from('artists')
    .select('*')
  
  if (error) {
    console.error('Error fetching artists:', error)
    return null
  }
  
  // Find artist whose name generates the same slug
  const matchingArtist = allArtists?.find(artist => {
    const artistSlug = generateSlug(artist.name)
    return artistSlug === slug
  })
  
  return matchingArtist || null
}

export const createArtist = async (artist: Database['public']['Tables']['artists']['Insert']): Promise<Artist | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create artist')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('artists')
    .insert(artist)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error creating artist:', error)
    return null
  }
  
  return data
}

// Track utilities
export const getTracks = async (): Promise<Track[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty tracks array')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      artists (
        id,
        name,
        photo_url
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tracks:', error)
    throw error
  }
  
  return data || []
}

export const getTracksByArtist = async (artistId: string): Promise<Track[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty tracks array')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tracks by artist:', error)
    throw error
  }
  
  return data || []
}

export const createTrack = async (track: Database['public']['Tables']['tracks']['Insert']): Promise<Track | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create track')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tracks')
    .insert(track)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error creating track:', error)
    return null
  }
  
  return data
}

export const updateTrack = async (id: string, track: Database['public']['Tables']['tracks']['Update']): Promise<Track | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot update track')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tracks')
    .update(track)
    .eq('id', id)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error updating track:', error)
    return null
  }
  
  return data
}

export const deleteTrack = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot delete track')
    return false
  }
  
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting track:', error)
    return false
  }
  
  return true
}

// Set utilities
export const getSets = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty sets array')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sets')
    .select(`
      *,
      artists (
        id,
        name,
        photo_url,
        location
      )
    `)
    .order('release_date', { ascending: false })
  
  if (error) {
    console.error('Error fetching sets:', error)
    throw error
  }
  
  return data || []
}

export const getSetsByArtist = async (artistId: string) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty sets array')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sets')
    .select(`
      *,
      artists (
        id,
        name,
        photo_url,
        location
      )
    `)
    .eq('artist_id', artistId)
    .order('release_date', { ascending: false })
  
  if (error) {
    console.error('Error fetching sets by artist:', error)
    throw error
  }
  
  return data || []
}

export const getSetById = async (id: string) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning null for set')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sets')
    .select(`
      *,
      artists (
        id,
       name,
        photo_url,
        bio
      )
    `)
    .eq('id', id)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching set:', error)
    return null
  }
  
  return data
}

export const createSet = async (set: Database['public']['Tables']['sets']['Insert']): Promise<Set | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create set')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sets')
    .insert(set)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error creating set:', error)
    return null
  }
  
  return data
}

export const updateSet = async (id: string, set: Database['public']['Tables']['sets']['Update']): Promise<Set | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot update set')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sets')
    .update(set)
    .eq('id', id)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error updating set:', error)
    return null
  }
  
  return data
}

export const deleteSet = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot delete set')
    return false
  }
  
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('sets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting set:', error)
    return false
  }
  
  return true
}

// Event utilities
export const getEvents = async (): Promise<Event[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty events array')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      artists (
        id,
        name,
        photo_url
      )
    `)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching events:', error)
    throw error
  }
  
  return data || []
}

export const getEventsByArtist = async (artistId: string): Promise<Event[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty events array')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      artists (
        id,
        name,
        photo_url
      )
    `)
    .eq('artist_id', artistId)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching events by artist:', error)
    throw error
  }
  
  return data || []
}

export const createEvent = async (event: Database['public']['Tables']['events']['Insert']): Promise<Event | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create event')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error creating event:', error)
    return null
  }
  
  return data
}

export const updateEvent = async (id: string, event: Database['public']['Tables']['events']['Update']): Promise<Event | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot update event')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error updating event:', error)
    return null
  }
  
  return data
}

export const deleteEvent = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot delete event')
    return false
  }
  
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting event:', error)
    return false
  }
  
  return true
}

// File upload utilities
export const uploadAudioFile = async (file: File, path: string): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot upload audio file')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, file)
  
  if (error) {
    console.error('Error uploading audio file:', error)
    return null
  }
  
  const { data: urlData } = supabase.storage
    .from('audio')
    .getPublicUrl(data.path)
  
  return urlData.publicUrl
}

export const uploadImageFile = async (file: File, path: string): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot upload image file')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file)
  
  if (error) {
    console.error('Error uploading image file:', error)
    return null
  }
  
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)
  
  return urlData.publicUrl
} 

// Artist likes functions
export const toggleArtistLike = async (artistId: string, userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot toggle like')
    return false
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .rpc('toggle_artist_like', {
      artist_uuid: artistId,
      user_identifier: userId
    })
  
  if (error) {
    console.error('Error toggling artist like:', error)
    return false
  }
  
  return data
}

export const getArtistLikeCount = async (artistId: string): Promise<number> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning 0 for like count')
    return 0
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .rpc('get_artist_like_count', {
      artist_uuid: artistId
    })
  
  if (error) {
    console.error('Error getting artist like count:', error)
    return 0
  }
  
  return data || 0
}

export const isArtistLikedByUser = async (artistId: string, userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning false for like status')
    return false
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .rpc('is_artist_liked_by_user', {
      artist_uuid: artistId,
      user_identifier: userId
    })
  
  if (error) {
    console.error('Error checking artist like status:', error)
    return false
  }
  
  return data || false
}

// Generate a unique user identifier for anonymous users
export const generateUserId = (): string => {
  // Try to get existing user ID from localStorage
  let userId = localStorage.getItem('origins_radio_user_id')
  
  if (!userId) {
    // Generate a new user ID based on browser fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|')
    
    // Create a hash of the fingerprint
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    userId = `user_${Math.abs(hash)}_${Date.now()}`
    localStorage.setItem('origins_radio_user_id', userId)
  }
  
  return userId
} 