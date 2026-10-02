import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import type { Database } from './supabase'
import { fetchWeeklyRadioSchedule, getRadioWeekKeys, type WeeklyScheduleSnapshot } from './radio-schedule-data'

export type PublicArtist = Database['public']['Tables']['artists']['Row'] & { slug: string }
export type PublicBlog = Database['public']['Tables']['blogs']['Row']
export type PublicProject = Database['public']['Tables']['our_work_projects']['Row'] & { location?: string | null; ticket_url?: string | null; form_url?: string | null; tiers?: { name: string; price: number }[] | null; price?: number | null }

// Public rendering always uses the anonymous role, without shared user sessions.
function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Public content is temporarily unavailable.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}

// Supabase caps a response at 1,000 rows. Read every page so older public
// articles and profiles remain reachable as the catalogue grows.
async function allRows<T>(read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await read(offset, offset + 999)
    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < 1000) return rows
  }
}

export const getPublicArtists = unstable_cache(async (): Promise<PublicArtist[]> => {
  const query = publicClient().from('artists')
    .select('id,name,slug,bio,photo_url,location,genre,featured,social_links,views_count,years_experience,created_at,updated_at')
    .order('name').order('id')
  return allRows<PublicArtist>((from, to) => query.range(from, to))
}, ['public-artists-v1'], { revalidate: 300, tags: ['public-artists'] })

export const getPublicArtist = async (slug: string) => {
  const artists = await getPublicArtists()
  return artists.find((artist) => artist.slug === slug)
    ?? artists.find((artist) => artist.name.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '') === slug)
    ?? null
}

export const getPublicBlogs = unstable_cache(async (): Promise<PublicBlog[]> => {
  const query = publicClient().from('blogs')
    .select('id,title,slug,content,excerpt,author,cover_image_url,status,featured,tags,seo_title,seo_description,published_at,created_at,updated_at')
    .eq('status', 'published').order('published_at', { ascending: false }).order('id')
  return allRows<PublicBlog>((from, to) => query.range(from, to))
}, ['public-blogs-v1'], { revalidate: 300, tags: ['public-blogs'] })

export const getPublicBlog = async (slug: string) => {
  const blogs = await getPublicBlogs()
  return blogs.find((blog) => blog.slug === slug) ?? null
}

const getCachedSchedule = unstable_cache(async (weekMondayIstanbul: string, weekMondayUtc: string) => {
  return fetchWeeklyRadioSchedule(publicClient(), { weekMondayIstanbul, weekMondayUtc })
}, ['public-radio-schedule-v1'], { revalidate: 60, tags: ['public-radio-schedule'] })

export async function getPublicSchedule(): Promise<WeeklyScheduleSnapshot> {
  const keys = getRadioWeekKeys()
  return { ...keys, items: await getCachedSchedule(keys.weekMondayIstanbul, keys.weekMondayUtc), generatedAt: new Date().toISOString() }
}

export const getPublicProjects = unstable_cache(async (): Promise<PublicProject[]> => {
  const query = publicClient().from('our_work_projects')
    .select('id,title,description,image_url,tags,date,upcoming,created_at,updated_at,location,ticket_url,form_url,tiers,slug,price')
    .order('created_at', { ascending: false }).order('id')
  return allRows<PublicProject>((from, to) => query.range(from, to))
}, ['public-projects-v1'], { revalidate: 300, tags: ['public-projects'] })

export async function getPublicProject(slug: string) {
  return (await getPublicProjects()).find((project) => project.slug === slug) ?? null
}
