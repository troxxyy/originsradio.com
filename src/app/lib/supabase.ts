import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  return supabase
}

// Helper function to get Supabase admin client with error handling
export const getSupabaseAdminClient = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.')
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
      artist_likes: {
        Row: {
          id: string
          artist_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          user_id?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          tag_name: string
          message: string
          is_emoji: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tag_name: string
          message: string
          is_emoji?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tag_name?: string
          message?: string
          is_emoji?: boolean
          created_at?: string
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
          peaks_url?: string | null
          duration: number | null
          release_date: string
          set_number: number | null
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
          peaks_url?: string | null
          duration?: number | null
          release_date: string
          set_number?: number | null
          views_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist_id?: string
          audio_url?: string
          peaks_url?: string | null
          duration?: number | null
          release_date?: string
          set_number?: number | null
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
      our_work_projects: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          tags: string[]
          date: string | null
          upcoming: boolean
          location?: string | null
          ticket_url?: string | null
          tiers?: Record<string, any> | null
          form_url?: string | null
          price?: number | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url: string
          tags?: string[]
          date?: string | null
          upcoming?: boolean
          location?: string | null
          ticket_url?: string | null
          tiers?: Record<string, any> | null
          form_url?: string | null
          price?: number | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          tags?: string[]
          date?: string | null
          upcoming?: boolean
          location?: string | null
          ticket_url?: string | null
          tiers?: Record<string, any> | null
          form_url?: string | null
          price?: number | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          author: string
          cover_image_url: string | null
          status: 'draft' | 'published'
          featured: boolean
          tags: string[]
          seo_title: string | null
          seo_description: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          author: string
          cover_image_url?: string | null
          status?: 'draft' | 'published'
          featured?: boolean
          tags?: string[]
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          author?: string
          cover_image_url?: string | null
          status?: 'draft' | 'published'
          featured?: boolean
          tags?: string[]
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
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