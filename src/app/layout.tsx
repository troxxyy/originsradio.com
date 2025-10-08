import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OriginsRadio - Ankara\'s Interactive Radio Station',
  description: 'OriginsRadio - Ankara\'s premier interactive radio station featuring live shows, music, events, and cultural experiences.',
  keywords: 'radio, Ankara, music, events, live shows, interactive radio, Origins, Turkey, streaming',
  authors: [{ name: 'Origins' }],
  openGraph: {
    type: 'website',
    url: 'https://originsradio.com/',
    title: 'OriginsRadio - Ankara\'s Interactive Radio Station',
    description: 'OriginsRadio - Ankara\'s premier interactive radio station featuring live shows, music, events, and cultural experiences.',
    images: ['/originslogo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OriginsRadio - Ankara\'s Interactive Radio Station',
    description: 'OriginsRadio - Ankara\'s premier interactive radio station featuring live shows, music, events, and cultural experiences.',
    images: ['/originslogo.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon.ico' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://originsradio.com/" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="theme-color" content="#000000" />
        {/* IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT! */}
        <script src="https://cdn.gpteng.co/gptengineer.js" type="module" async></script>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
