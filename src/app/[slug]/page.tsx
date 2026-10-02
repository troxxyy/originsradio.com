import { notFound, permanentRedirect } from 'next/navigation'
import { getPublicArtist, getPublicArtists } from '@/lib/public-content'

export const revalidate = 300
export async function generateStaticParams() {
  return (await getPublicArtists()).filter((artist) => artist.slug).map((artist) => ({ slug: artist.slug }))
}

export default async function LegacyArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const artist = await getPublicArtist((await params).slug)
  if (!artist) notFound()
  permanentRedirect(`/artists/${artist.slug}`)
}
