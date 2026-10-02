import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogDetailClient from './BlogDetailClient'
import { getPublicBlog, getPublicBlogs } from '@/lib/public-content'
import { absoluteUrl, breadcrumbs, excerpt, ORGANIZATION_ID, pageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 300
type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublicBlogs()).map((blog) => ({ slug: blog.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getPublicBlog((await params).slug)
  if (!blog) return { title: 'Article not found', robots: { index: false, follow: true } }
  // Incomplete admin fields must not replace the real article headline/summary.
  const title = blog.seo_title?.trim().length && blog.seo_title.trim().length >= 10 ? blog.seo_title.trim() : blog.title
  const description = [blog.seo_description, blog.excerpt, blog.content].map(value => excerpt(value || '')).find(value => value.length >= 30)
    || `Read ${blog.title} on the OriginsRadio electronic music blog.`
  const metadata = pageMetadata(title, description, `/blog/${blog.slug}`, blog.cover_image_url || '/opengraph-image')
  return { ...metadata, openGraph: { ...metadata.openGraph, type: 'article', publishedTime: blog.published_at || undefined, modifiedTime: blog.updated_at || undefined, authors: blog.author ? [blog.author] : undefined } }
}

export default async function BlogDetailPage({ params }: Props) {
  const blog = await getPublicBlog((await params).slug)
  if (!blog) notFound()
  const related = (await getPublicBlogs()).filter((item) => item.id !== blog.id && item.tags?.some((tag) => blog.tags?.includes(tag))).slice(0, 3)
  return <>
    <JsonLd data={[
      { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: blog.title, description: blog.excerpt || excerpt(blog.content), mainEntityOfPage: absoluteUrl(`/blog/${blog.slug}`), image: blog.cover_image_url ? [absoluteUrl(blog.cover_image_url)] : undefined, datePublished: blog.published_at || undefined, dateModified: blog.updated_at || undefined, author: blog.author ? { '@type': 'Person', name: blog.author } : undefined, publisher: { '@id': ORGANIZATION_ID } },
      breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: blog.title, path: `/blog/${blog.slug}` }]),
    ]} />
    <BlogDetailClient blog={blog} relatedBlogs={related} />
  </>
}
