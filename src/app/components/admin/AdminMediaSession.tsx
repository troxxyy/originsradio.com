'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

export default function AdminMediaSession() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    let active = true
    const showUser = (user: { email?: string; is_anonymous?: boolean } | undefined) => {
      if (!active) return
      setEmail(user && !user.is_anonymous ? user.email || 'Admin account' : null)
      setLoading(false)
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => showUser(session?.user))
    void supabase.auth.getSession().then(({ data, error }) => showUser(error ? undefined : data.session?.user))
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_MEDIA_ORIGIN) return null

  return (
    <div className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-gray-300" role="status">
      {loading ? 'Checking admin sign-in…' : email ? (
        <>Signed in as <span className="text-white">{email}</span>. You can upload artist photos and blog images with your authorized admin account.</>
      ) : (
        <>
          Sign in with your admin account to upload artist photos and blog images.{' '}
          <Link href="/artist/login?next=/artistcontrolsecret/artists" className="text-cyan-300 underline">Sign in</Link>
        </>
      )}
    </div>
  )
}
