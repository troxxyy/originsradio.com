import { redirect } from 'next/navigation'

export default function LegacyArtistPage({ params }: { params: { slug: string } }) {
  // Redirect legacy /artists/{slug} to new /{slug}
  redirect(`/${params.slug}`)
}
