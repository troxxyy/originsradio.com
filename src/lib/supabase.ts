import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Create admin client with service role key for admin operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Helper function to get Supabase client with error handling
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  }
  return supabase
}

// Helper function to get Supabase admin client with error handling
export const getSupabaseAdminClient = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured. Please set VITE_SUPABASE_SERVICE_ROLE_KEY environment variable.')
  }
  return supabaseAdmin
}

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          name: string
          bio: string | null
          photo_url: string | null
          location: string | null
          genre: string[] | null
          featured: boolean
          social_links: Record<string, any> | null
          views_count: number | null
          years_experience: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          bio?: string | null
          photo_url?: string | null
          location?: string | null
          genre?: string[] | null
          featured?: boolean
          social_links?: Record<string, any> | null
          views_count?: number | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          bio?: string | null
          photo_url?: string | null
          location?: string | null
          genre?: string[] | null
          featured?: boolean
          social_links?: Record<string, any> | null
          views_count?: number | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          title: string
          artist_id: string
          audio_url: string
          cover_art_url: string | null
          duration: number | null
          release_date: string | null
          views_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist_id: string
          audio_url: string
          cover_art_url?: string | null
          duration?: number | null
          release_date?: string | null
          views_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist_id?: string
          audio_url?: string
          cover_art_url?: string | null
          duration?: number | null
          release_date?: string | null
          views_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sets: {
        Row: {
          id: string
          title: string
          artist_id: string
          audio_url: string
          duration: number | null
          release_date: string
          views_count: number | null
          created_at: string
          updated_at: string
          artists?: {
            id: string
            name: string
            photo_url: string | null
            bio: string | null
          }
        }
        Insert: {
          id?: string
          title: string
          artist_id: string
          audio_url: string
          duration?: number | null
          release_date: string
          views_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist_id?: string
          audio_url?: string
          duration?: number | null
          release_date?: string
          views_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          artist_id: string
          description: string | null
          location: string | null
          date: string
          image_url: string | null
          tags: string[] | null
          upcoming: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist_id: string
          description?: string | null
          location?: string | null
          date: string
          image_url?: string | null
          tags?: string[] | null
          upcoming?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist_id?: string
          description?: string | null
          location?: string | null
          date?: string
          image_url?: string | null
          tags?: string[] | null
          upcoming?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 