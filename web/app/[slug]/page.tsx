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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const artist = await getArtistBySlug(params.slug)
  if (!artist) return { robots: { index: false, follow: false } }
  const url = `https://origins.radio/${artist.slug}`
  return {
    title: `${artist.name} | Origins Radio`,
    description: artist.bio ? artist.bio.slice(0, 160) : undefined,
    alternates: { canonical: url },
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

export default async function Page({ params }: { params: { slug: string } }) {
  const artist = await getArtistBySlug(params.slug)
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
    <main className="container py-10">
      <JsonLd json={jsonLd} />
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {artist.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.photo_url}
            alt={artist.name}
            className="w-full md:w-64 h-64 object-cover rounded-xl card"
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-semibold">{artist.name}</h1>
          {artist.location && (
            <p className="mt-2 opacity-80">{artist.location}</p>
          )}
          {artist.bio && (
            <p className="mt-6 leading-7 opacity-90 whitespace-pre-line">{artist.bio}</p>
          )}
          {artist.social_links && (
            <div className="mt-6 flex flex-wrap gap-3">
              {Object.entries(artist.social_links).map(([key, url]) => (
                <a key={key} href={String(url)} target="_blank" rel="noopener noreferrer" className="card px-3 py-1 rounded-md hover:opacity-90">
                  {key}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}


