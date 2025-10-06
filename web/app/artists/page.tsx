import Link from 'next/link'
import { getArtistsForSitemap } from '../../lib/artists'

export const revalidate = 3600

export default async function Page() {
  const artists = await getArtistsForSitemap()
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Artists</h1>
      <ul className="mt-6 space-y-2">
        {artists.map((a) => (
          <li key={a.slug}>
            <Link className="text-blue-600 hover:underline" href={`/${a.slug}`}>{a.slug}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}


