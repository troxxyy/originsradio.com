import PageLayout from '@/components/layout/PageLayout'
import HomeHero from '@/components/home/HomeHero'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('Electronic Music Radio, DJ Sets & Ankara Events', 'Listen to OriginsRadio, an independent electronic music collective. Explore techno and house DJ sets, discover artists, and follow events in Ankara and beyond.', '/')

export default function HomePage() {
  return (
    <PageLayout customBackground="bg-transparent" showFooter={false}>
      <HomeHero />
    </PageLayout>
  )
}
