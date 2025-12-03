import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Artists & DJs - Origins Radio | Electronic Music',
    template: '%s | Origins Radio',
  },
  description:
    "Meet the talented DJs and producers of Origins Radio. Discover resident artists, guest selectors, and emerging talent in the electronic music scene.",
  keywords: [
    'Origins Radio',
    'DJs',
    'electronic music',
    'techno',
    'house',
    'underground',
    'radio artists',
    'DJs and producers',
    'Electronic Music',
    'Techno',
    'House',
    'Underground',
    'Music Scene',
    'DJ',
    'Producer',
    'Music',
    'Events',
    'Booking',
  ],
  alternates: {
    canonical: '/artists',
  },
  openGraph: {
    title: 'Artists & DJs - Origins Radio',
    description:
      "Discover resident and guest DJs of Origins Radio from the underground scene.",
    type: 'website',
    url: '/artists',
    siteName: 'OriginsRadio',
    images: [
      {
        url: '/originslogo.png',
        width: 1200,
        height: 630,
        alt: 'Origins Radio Artists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artists & DJs - Origins Radio',
    description:
      "Discover resident and guest DJs of Origins Radio from the underground scene.",
    images: ['/originslogo.png'],
  },
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
  category: 'Music',
}

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
