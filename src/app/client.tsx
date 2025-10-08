'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Lenis from 'lenis'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

export function ClientOnly() {
  const [AppComponent, setAppComponent] = React.useState<React.ComponentType | null>(null)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    
    // Globally enforce 75% zoom on mobile devices by adjusting the viewport meta tag
    if (typeof window !== 'undefined') {
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        const head = document.head || document.getElementsByTagName('head')[0];
        let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
        if (!viewportMeta) {
          viewportMeta = document.createElement('meta');
          viewportMeta.setAttribute('name', 'viewport');
          head.appendChild(viewportMeta);
        }
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=0.75, maximum-scale=0.75');
      }
    }

    // Initialize Lenis smooth scroll once
    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Use dynamic import path to prevent static analysis
    const appPath = '../' + 'App'
    import(/* webpackIgnore: true */ appPath).then((mod) => {
      setAppComponent(() => mod.default)
    }).catch(() => {
      // Fallback to regular import if webpack ignore doesn't work
      import('../App').then((mod) => {
        setAppComponent(() => mod.default)
      })
    })

    return () => {
      lenis.destroy()
    }
  }, [])

  if (!isClient || !AppComponent) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppComponent />
      <SpeedInsights />
      <Analytics />
    </QueryClientProvider>
  )
}
