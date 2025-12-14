import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import './index.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://origins.radio'),
  title: 'OriginsRadio - Interactive Radio Station',
  description: 'OriginsRadio - Premier interactive radio station featuring live shows, music, events, and cultural experiences.',
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  openGraph: {
    title: 'OriginsRadio - Interactive Radio Station',
    description: 'OriginsRadio - Premier interactive radio station featuring live shows, music, events, and cultural experiences.',
    type: 'website',
    siteName: 'OriginsRadio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OriginsRadio - Interactive Radio Station',
    description: 'OriginsRadio - Premier interactive radio station featuring live shows, music, events, and cultural experiences.',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 0.75,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT! */}
        <script src="https://cdn.gpteng.co/gptengineer.js" type="module" async></script>
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
