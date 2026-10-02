import BlogPageClient from './BlogPageClient'
import { getPublicBlogs } from '@/lib/public-content'
import { pageMetadata, absoluteUrl } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 300
export const metadata = pageMetadata('Electronic Music Blog & Ankara Scene', 'Electronic music stories, artist interviews, DJ culture and the Ankara scene from OriginsRadio. Read our latest published articles.', '/blog')

export default async function BlogPage() {
  const blogs = await getPublicBlogs()
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OriginsRadio Blog', url: absoluteUrl('/blog'), mainEntity: { '@type': 'ItemList', itemListElement: blogs.map((blog, index) => ({ '@type': 'ListItem', position: index + 1, name: blog.title, url: absoluteUrl(`/blog/${blog.slug}`) })) } }} />
    <BlogPageClient initialBlogs={blogs} />
  </>
}
