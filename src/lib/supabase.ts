import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
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