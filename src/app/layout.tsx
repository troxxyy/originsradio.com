import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import './index.css'
import localFont from 'next/font/local'
import { SITE_URL } from '@/lib/site'
import JsonLd from '@/components/seo/JsonLd'
import { ORGANIZATION_ID } from '@/lib/seo'

const newake = localFont({
  src: '../../public/fonts/NewakeFont-Demo.otf',
  variable: '--font-newake',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'OriginsRadio — Electronic Music Radio, DJs & Events', template: '%s | OriginsRadio' },
  description: 'Independent electronic music radio, DJ sets, artists and events from OriginsRadio. Discover techno, house and the underground music scene in Ankara and beyond.',
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  openGraph: {
    title: 'OriginsRadio — Electronic Music Radio, DJs & Events',
    description: 'Independent electronic music radio, DJ sets, artists and events from Ankara and beyond.',
    type: 'website',
    siteName: 'OriginsRadio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OriginsRadio — Electronic Music Radio, DJs & Events',
    description: 'Independent electronic music radio, DJ sets, artists and events from Ankara and beyond.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${newake.variable}`}>
      <body>
        <JsonLd data={[
          { '@context': 'https://schema.org', '@type': 'Organization', '@id': ORGANIZATION_ID, name: 'OriginsRadio', alternateName: 'Origins Radio', url: SITE_URL, logo: `${SITE_URL}/originslogo.png`, email: 'info@originsradio.com', sameAs: ['https://www.instagram.com/origins.radio/', 'https://www.youtube.com/@originsradiotr'] },
          { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'OriginsRadio', alternateName: 'Origins Radio', url: SITE_URL, publisher: { '@id': ORGANIZATION_ID } },
        ]} />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
