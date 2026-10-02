'use client'

import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-white/70">Please try loading this page again.</p>
      <button onClick={reset} className="rounded-full bg-white px-6 py-3 text-black">Try again</button>
      <Link href="/" className="underline">Back to Origins Radio</Link>
    </main>
  )
}
