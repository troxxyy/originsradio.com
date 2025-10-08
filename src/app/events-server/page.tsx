import { getOurWorkProjects } from '@/lib/supabase-utils'
import EventsClient from './EventsClient'
import { Metadata } from 'next'

// Enable ISR - revalidate every 10 minutes
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Events - Origins Radio | Ankara Electronic Music Events',
  description: 'Discover upcoming electronic music events, shows, and parties in Ankara. Join Origins Radio for unforgettable music experiences.',
}

export default async function EventsServerPage() {
  // Fetch events on the server
  const projects = await getOurWorkProjects()

  return <EventsClient initialEvents={projects} />
}
