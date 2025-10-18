import ArtistDetailClient from './ArtistDetailClient'
import type { Metadata } from 'next'
import { getAllArtistSlugs, getArtistSEOData } from '../../../lib/artists'

export default async function ArtistDetailPage({ params }: { params: { artistSlug: string } }) {
  const { artistSlug } = params
  return <ArtistDetailClient artistSlug={artistSlug} />
}

export const revalidate = 86400 // 24h ISR

export async function generateStaticParams() {
  const slugs = await getAllArtistSlugs()
  return slugs.map((slug) => ({ artistSlug: slug }))
}

export async function generateMetadata({ params }: { params: { artistSlug: string } }): Promise<Metadata> {
  const { artistSlug } = params
  const seoData = await getArtistSEOData(artistSlug)
  
  if (!seoData) {
    return { 
      robots: { index: false, follow: false },
      title: 'Artist Not Found | Origins Radio'
    }
  }

  return {
    title: seoData.metadata.title,
    description: seoData.metadata.description,
    keywords: seoData.metadata.keywords,
    alternates: seoData.metadata.alternates,
    openGraph: seoData.metadata.openGraph,
    twitter: seoData.metadata.twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}


