import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EventDetailClient from './EventDetailClient'
import { getPublicProject, getPublicProjects } from '@/lib/public-content'
import { absoluteUrl, breadcrumbs, excerpt, pageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 300
type Props = { params: Promise<{ eventSlug: string }> }

export async function generateStaticParams() {
  return (await getPublicProjects()).filter((project) => project.slug).map((project) => ({ eventSlug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublicProject((await params).eventSlug)
  if (!project) return { title: 'Event not found', robots: { index: false, follow: true } }
  return pageMetadata(project.title, excerpt(project.description), `/events/${project.slug}`, project.image_url || '/opengraph-image')
}

export default async function EventDetailPage({ params }: Props) {
  const project = await getPublicProject((await params).eventSlug)
  if (!project) notFound()
  return <>
    <JsonLd data={[
      { '@context': 'https://schema.org', '@type': 'WebPage', name: project.title, description: excerpt(project.description), url: absoluteUrl(`/events/${project.slug}`) },
      breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Events', path: '/events' }, { name: project.title, path: `/events/${project.slug}` }]),
    ]} />
    <EventDetailClient initialProject={project} />
  </>
}
