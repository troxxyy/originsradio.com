import { getAllArtistSlugs, getArtistBySlug } from '../../lib/artists'

function JsonLd({ json }: { json: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

export const revalidate = 86400 // 24h ISR

export async function generateStaticParams() {
  const slugs = await getAllArtistSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = await getArtistBySlug(slug)
  if (!artist) return { robots: { index: false, follow: false } }
  const url = `https://origins.radio/${artist.slug}`
  const canonicalUrl = `https://origins.radio/artists/${artist.slug}` // Point to /artists/ route as canonical
  return {
    title: `${artist.name} | Origins Radio`,
    description: artist.bio ? artist.bio.slice(0, 160) : undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      url,
      title: `${artist.name} | Origins Radio`,
      description: artist.bio ? artist.bio.slice(0, 200) : undefined,
      images: [{ url: `/og/${artist.slug}.png` }],
      type: 'profile',
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = await getArtistBySlug(slug)
  if (!artist) return null
  const url = `https://origins.radio/${artist.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url,
    image: artist.photo_url || undefined,
    sameAs: artist.social_links ? Object.values(artist.social_links) : undefined,
    description: artist.bio || undefined,
  }
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <JsonLd json={jsonLd} />
      <h1 className="text-3xl font-semibold">{artist.name}</h1>
      {artist.bio && <p className="mt-4 text-neutral-700">{artist.bio}</p>}
    </main>
  )
}


