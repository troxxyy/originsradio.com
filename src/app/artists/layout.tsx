import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artists - Origins Radio | Electronic Music DJs in Ankara',
  description: 'Meet the talented DJs and producers of Origins Radio. Discover resident artists, guest selectors, and emerging talent in Ankara\'s electronic music scene.',
  openGraph: {
    title: 'Artists - Origins Radio',
    description: 'Meet the talented DJs and producers of Origins Radio',
    type: 'website',
  },
}

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
