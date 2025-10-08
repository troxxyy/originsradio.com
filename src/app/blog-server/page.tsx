import { getPublishedBlogs } from '@/data/blogs-supabase'
import BlogClient from './BlogClient'

// This is a Server Component - it runs on the server
export const revalidate = 3600 // Revalidate every hour (ISR)

export default async function BlogServerPage() {
  // Fetch data on the server
  const { blogs } = await getPublishedBlogs(1, 100)

  // Pass data to client component
  return <BlogClient initialBlogs={blogs} />
}
