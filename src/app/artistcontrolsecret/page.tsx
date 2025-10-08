'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ArtistControlGuard from "@/components/admin/ArtistControlGuard"

export default function ArtistControlPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the artists management page
    router.replace('/artistcontrolsecret/artists')
  }, [router])

  return (
    <ArtistControlGuard>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Redirecting...</p>
      </div>
    </ArtistControlGuard>
  )
}
