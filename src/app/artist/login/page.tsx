'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVerifyNotice, setShowVerifyNotice] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured()) return
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/artist/dashboard')
      }
    }
    checkSession()
  }, [router])

  useEffect(() => {
    if (searchParams?.get('verify') === '1') {
      setShowVerifyNotice(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured.')
      return
    }
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = getSupabaseClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        return
      }
      router.replace('/artist/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-16">
      <div className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6 w-full max-w-md">
        {/* Beta disclaimer - prominent red banner */}
        <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-600/10 text-red-200 text-sm">
          <strong className="block font-semibold">Beta feature</strong>
          <span className="block">This artist area is in beta — we're gathering feedback. Please be cautious when using it.</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Artist Login</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage your profile and sets</p>
        </div>

        {showVerifyNotice && (
          <div className="mb-4 p-3 rounded-lg border border-blue-400/30 bg-blue-500/10 text-blue-200 text-sm">
            Please check your email to verify your account before logging in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          No account? <Link href="/artist/signup" className="text-white">Sign up</Link>
          <span className="mx-2">•</span>
          <Link href="/" className="hover:text-white">Back to home</Link>
        </div>
      </div>
    </div>
  )
}

export default function ArtistLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

