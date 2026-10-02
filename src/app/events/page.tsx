import EventsPageClient from './EventsPageClient'
import { getPublicProjects } from '@/lib/public-content'
import { absoluteUrl, pageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 300
export const metadata = pageMetadata('Electronic Music Events & Ankara Event Archive', 'Explore OriginsRadio electronic music events, club nights and past shows in Ankara and beyond. Browse the event archive and published upcoming announcements.', '/events')

export default async function EventsPage() {
  const projects = await getPublicProjects()
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OriginsRadio Events', url: absoluteUrl('/events'), mainEntity: { '@type': 'ItemList', itemListElement: projects.filter((project) => project.slug).map((project, index) => ({ '@type': 'ListItem', position: index + 1, name: project.title, url: absoluteUrl(`/events/${project.slug}`) })) } }} />
    <EventsPageClient initialProjects={projects} />
  </>
}
