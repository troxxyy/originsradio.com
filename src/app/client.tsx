'use client'

import React from 'react'

export function ClientOnly() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Only import and render after client-side mount
  const ClientApp = React.lazy(() => import('./client-app'))
  
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ClientApp />
    </React.Suspense>
  )
}
