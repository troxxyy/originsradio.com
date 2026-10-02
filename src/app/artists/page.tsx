import ArtistsPageClient from './ArtistsPageClient'
import { getPublicArtists } from '@/lib/public-content'
import { pageMetadata, absoluteUrl } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 300
export const metadata = pageMetadata('DJs, Artists & Booking in Ankara', 'Explore the OriginsRadio DJ roster, resident artists and guest selectors. Browse techno, house and electronic music artists and send a DJ booking enquiry.', '/artists')

export default async function ArtistsPage({ searchParams }: { searchParams: Promise<{ genre?: string | string[] }> }) {
  const [artists, params] = await Promise.all([getPublicArtists(), searchParams])
  const genre = typeof params.genre === 'string' ? params.genre : undefined
  const selectedGenre = artists.flatMap(artist => artist.genre || []).find(value => value.toLowerCase() === genre?.toLowerCase())
  const visibleArtists = selectedGenre ? artists.filter(artist => artist.genre?.includes(selectedGenre)) : artists
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OriginsRadio Artists', url: absoluteUrl('/artists'), mainEntity: { '@type': 'ItemList', itemListElement: visibleArtists.map((artist, index) => ({ '@type': 'ListItem', position: index + 1, name: artist.name, url: absoluteUrl(`/artists/${artist.slug}`) })) } }} />
    <ArtistsPageClient initialArtists={artists} initialGenre={genre} />
  </>
}
