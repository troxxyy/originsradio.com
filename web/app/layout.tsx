import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Origins Radio',
  description: 'Artist pages powered by Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-semibold text-xl">Origins Radio</Link>
            <nav className="text-sm opacity-80">
              <Link href="/artists" className="hover:underline">Artists</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="container py-10 opacity-70 text-sm">
          © {new Date().getFullYear()} Origins Radio
        </footer>
      </body>
    </html>
  )
}


