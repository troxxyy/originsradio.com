import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white">
      <p className="text-sm tracking-widest text-white/50">404</p>
      <h1 className="text-3xl font-bold sm:text-5xl">Page not found</h1>
      <p className="text-white/70">This page may have moved or is no longer available.</p>
      <Link href="/" className="rounded-full bg-white px-6 py-3 text-black">Back to Origins Radio</Link>
    </main>
  )
}
