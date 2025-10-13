import type { Metadata } from 'next'
import { Providers } from './providers'
import './index.css'

export const metadata: Metadata = {
  title: 'OriginsRadio - Ankara\'s Interactive Radio Station',
  description: 'OriginsRadio - Ankara\'s premier interactive radio station featuring live shows, music, events, and cultural experiences.',
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  themeColor: '#000000',
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
      </body>
    </html>
  )
}
