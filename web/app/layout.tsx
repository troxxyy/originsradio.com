import './globals.css'

export const metadata = {
  title: 'Origins Radio',
  description: 'Artist pages powered by Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


