'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export default function ArtistSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured()) return
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      if (data.session) router.replace('/artist/dashboard')
    }
    checkSession()
  }, [router])

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
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/artist/dashboard`
        }
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      router.replace('/artist/login?verify=1')
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
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Artist Signup</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

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
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <Link href="/artist/login" className="text-white">Log in</Link>
        </div>
      </div>
    </div>
  )
}

