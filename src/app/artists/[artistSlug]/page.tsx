import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import ArtistDetailClient from './ArtistDetailClient'
import { getPublicArtist, getPublicArtists } from '@/lib/public-content'
import { absoluteUrl, breadcrumbs, excerpt, pageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 300
type Props = { params: Promise<{ artistSlug: string }> }

export async function generateStaticParams() {
  return (await getPublicArtists()).filter((artist) => artist.slug).map((artist) => ({ artistSlug: artist.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await getPublicArtist((await params).artistSlug)
  if (!artist) return { title: 'Artist not found', robots: { index: false, follow: true } }
  const description = excerpt(artist.bio || `Discover ${artist.name}${artist.location ? ` from ${artist.location}` : ''} on OriginsRadio. Explore their profile, music and DJ booking enquiries.`)
  return pageMetadata(`${artist.name} — DJ Profile & Booking`, description, `/artists/${artist.slug}`, artist.photo_url || '/opengraph-image')
}

export default async function ArtistDetailPage({ params }: Props) {
  const { artistSlug } = await params
  const artist = await getPublicArtist(artistSlug)
  if (!artist) notFound()
  if (artist.slug !== artistSlug) permanentRedirect(`/artists/${artist.slug}`)
  const socialLinks = Object.values(artist.social_links || {}).filter((value): value is string => typeof value === 'string' && /^https?:\/\//.test(value))
  return <>
    <JsonLd data={[
      { '@context': 'https://schema.org', '@type': 'Person', name: artist.name, description: artist.bio || undefined, image: artist.photo_url ? absoluteUrl(artist.photo_url) : undefined, url: absoluteUrl(`/artists/${artist.slug}`), sameAs: socialLinks.length ? socialLinks : undefined, knowsAbout: artist.genre || undefined },
      breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Artists', path: '/artists' }, { name: artist.name, path: `/artists/${artist.slug}` }]),
    ]} />
    <ArtistDetailClient artistSlug={artist.slug} initialArtist={artist} />
  </>
}
