'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUploadsRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the main uploads page
    router.replace('/uploads')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <p className="text-gray-400">Redirecting...</p>
    </div>
  )
}
