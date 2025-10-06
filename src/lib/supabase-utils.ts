import { getSupabaseClient, getSupabaseAdminClient, isSupabaseConfigured } from './supabase'
import type { Database } from './supabase'

type Artist = Database['public']['Tables']['artists']['Row']
type Track = Database['public']['Tables']['tracks']['Row']
type Set = Database['public']['Tables']['sets']['Row']
type Event = Database['public']['Tables']['events']['Row']
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type OurWorkProject = Database['public']['Tables']['our_work_projects']['Row']
type SetRow = Database['public']['Tables']['sets']['Row']

// Utility function to generate slug from name (kept for backward compatibility)
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '') // Remove special characters but keep spaces
    .replace(/\s+/g, '') // Remove all spaces
    .trim()
}

// Utility function to generate random slug for events
export const generateRandomSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
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
  // Ensure we have at least anonymous session to satisfy authenticated policies
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      await supabase.auth.signInAnonymously()
    }
  } catch (authErr) {
    // eslint-disable-next-line no-console
    console.error('Auth error before creating set:', authErr)
  }
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

// Admin bypass: uses service role client to bypass RLS for admin-only inserts
export const createSetAdmin = async (set: Database['public']['Tables']['sets']['Insert']): Promise<Set | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create set (admin)')
    return null
  }

  const supabaseAdmin = getSupabaseAdminClient()
  const { data, error } = await supabaseAdmin
    .from('sets')
    .insert(set)
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error creating set (admin):', error)
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
  // Ensure we have an authenticated session for storage policies
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      await supabase.auth.signInAnonymously()
    }
  } catch (authErr) {
    console.error('Auth error before audio upload:', authErr)
  }
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
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
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot upload image file')
    return null
  }
  
  const supabase = getSupabaseClient()
  // Ensure we have an authenticated session for storage policies
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      await supabase.auth.signInAnonymously()
    }
  } catch (authErr) {
    console.error('Auth error before image upload:', authErr)
  }
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
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

// Chat message functions
export const getChatMessages = async (limit = 50): Promise<ChatMessage[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty chat messages')
    return []
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching chat messages:', error)
    return []
  }
  
  return data || []
}

export const createChatMessage = async (tagName: string, message: string, isEmoji = false): Promise<ChatMessage | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create chat message')
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      tag_name: tagName,
      message: message,
      is_emoji: isEmoji
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating chat message:', error)
    return null
  }
  
  return data
}

export const subscribeToChatMessages = (callback: (message: ChatMessage) => void) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot subscribe to chat messages')
    return null
  }
  
  const supabase = getSupabaseClient()
  const subscription = supabase
    .channel('chat_messages')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      (payload) => {
        callback(payload.new as ChatMessage)
      }
    )
    .subscribe()
  
  return subscription
} 

// Our Work utilities
export const getOurWorkProjects = async (): Promise<OurWorkProject[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty our_work_projects array')
    return []
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('our_work_projects')
    .select('*')
    .order('upcoming', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching our_work_projects:', error)
    throw error
  }

  return data || []
}

// Get our work project by slug
export const getOurWorkProjectBySlug = async (slug: string): Promise<OurWorkProject | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning null for our_work_project by slug')
    return null
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('our_work_projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Error fetching our_work_project by slug:', error)
    return null
  }

  return data
}

// ThisWeek utilities
export const getThisWeekEvents = async (): Promise<any[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty thisweek events array')
    return []
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('thisweek')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching thisweek events:', error)
    throw error
  }

  return data || []
}

export const getThisWeekEventsByDate = async (startDate: string, endDate: string): Promise<any[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty thisweek events array')
    return []
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('thisweek')
    .select('*')
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching thisweek events by date:', error)
    throw error
  }

  return data || []
}

export const createThisWeekEvent = async (eventData: {
  club_name: string
  event_artist: string
  price: string
  image_url: string
  event_date: string
  event_url?: string
}): Promise<any> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create thisweek event')
    throw new Error('Supabase not configured')
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('thisweek')
    .insert([eventData])
    .select()
    .single()

  if (error) {
    console.error('Error creating thisweek event:', error)
    throw error
  }

  return data
}

export const updateThisWeekEvent = async (id: string, eventData: Partial<{
  club_name: string
  event_artist: string
  price: string
  image_url: string
  event_date: string
  event_url: string
}>): Promise<any> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot update thisweek event')
    throw new Error('Supabase not configured')
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('thisweek')
    .update(eventData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating thisweek event:', error)
    throw error
  }

  return data
}

export const deleteThisWeekEvent = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot delete thisweek event')
    throw new Error('Supabase not configured')
  }

  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from('thisweek')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting thisweek event:', error)
    throw error
  }
}

// Radio schedule utilities
export interface RadioScheduleWeeklyRow {
  id: string
  day_of_week: number
  start_time_local: string
  duration_minutes: number
  content_type: 'set' | 'stream'
  set_id?: string | null
  stream_url?: string | null
  title: string
  timezone?: string | null
  is_active?: boolean | null
  sets?: Pick<SetRow, 'audio_url' | 'duration'> & {
    artists?: { name: string | null; photo_url: string | null } | null
  } | null
}

export const getWeeklyRadioSchedule = async (): Promise<RadioScheduleWeeklyRow[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty radio schedule')
    return []
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('radio_schedule_weekly')
    .select(`
      id, day_of_week, start_time_local, duration_minutes, content_type, set_id, stream_url, title, timezone, is_active,
      sets:sets(
        audio_url,
        duration,
        artists:artists(name, photo_url)
      )
    `)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })

  if (error) {
    // Table may not exist yet; return empty and avoid throwing to keep UI functional until schedule is added
    console.warn('getWeeklyRadioSchedule error:', error.message)
    return []
  }

  // Coerce via unknown to satisfy type checker; shapes depend on relational select
  return (data as unknown as RadioScheduleWeeklyRow[]) || []
}

// Artist account link helpers
export interface ArtistAccountRow {
  id: string
  user_id: string
  email: string | null
  artist_id: string
  created_at: string
}

export const getLinkedArtistForCurrentUser = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabaseClient()
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id
  if (!userId) return null
  const { data, error } = await supabase
    .from('artist_accounts')
    .select('artist_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return null
  return (data as any)?.artist_id || null
}

export const linkCurrentUserToArtist = async (artistId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseClient()
  const { data: session } = await supabase.auth.getSession()
  const user = session.session?.user
  if (!user) return false
  const { error } = await supabase
    .from('artist_accounts')
    .insert({ user_id: user.id, email: user.email ?? null, artist_id: artistId })
  if (error) {
    // eslint-disable-next-line no-console
    console.error('linkCurrentUserToArtist error', error)
    return false
  }
  return true
}

// Admin CRUD helpers for radio_schedule_weekly
export const getAllWeeklyRadioSchedule = async (): Promise<RadioScheduleWeeklyRow[]> => {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('radio_schedule_weekly')
    .select(`
      id, day_of_week, start_time_local, duration_minutes, content_type, set_id, stream_url, title, timezone, is_active,
      sets:sets(
        audio_url,
        duration,
        artists:artists(name, photo_url)
      )
    `)
    .order('day_of_week', { ascending: true })
    .order('start_time_local', { ascending: true })
  if (error) {
    console.error('Error fetching all weekly schedule:', error)
    return []
  }
  return (data as unknown as RadioScheduleWeeklyRow[]) || []
}

export const upsertWeeklyRadioSchedule = async (row: Partial<RadioScheduleWeeklyRow> & { id?: string }) => {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
  const supabaseAdmin = getSupabaseAdminClient()
  const payload: any = {
    id: row.id,
    day_of_week: row.day_of_week,
    start_time_local: row.start_time_local,
    duration_minutes: row.duration_minutes ?? 60,
    content_type: row.content_type,
    set_id: row.set_id ?? null,
    stream_url: row.stream_url ?? null,
    title: row.title ?? '',
    timezone: row.timezone ?? 'Europe/Istanbul',
    is_active: row.is_active ?? true,
  }
  const { data, error } = await supabaseAdmin
    .from('radio_schedule_weekly')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .maybeSingle()
  if (error) {
    console.error('Error upserting weekly radio schedule:', error)
    throw error
  }
  return data
}

export const deleteWeeklyRadioSchedule = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
  const supabaseAdmin = getSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from('radio_schedule_weekly')
    .delete()
    .eq('id', id)
  if (error) {
    console.error('Error deleting weekly radio schedule:', error)
    return false
  }
  return true
}