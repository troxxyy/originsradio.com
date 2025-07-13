import { supabase } from './supabase'
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
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('artist_id', artistId)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching events by artist:', error)
    throw error
  }
  
  return data || []
}

export const createEvent = async (event: Database['public']['Tables']['events']['Insert']): Promise<Event | null> => {
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
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  
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
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Error uploading image file:', error)
    return null
  }
  
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)
  
  return urlData.publicUrl
} 