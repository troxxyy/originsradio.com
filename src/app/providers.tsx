'use client'

import { useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { HelmetProvider } from "react-helmet-async"
import Navigation from "@/components/Navigation"
import MerchPopup from "@/components/MerchPopup"
import { AudioVisualizerProvider } from "@/contexts/AudioVisualizerContext"
import { OrbActivationProvider } from "@/contexts/OrbActivationContext"
import { MERCH_ENABLED } from "@/lib/site-features"

const MusicPlayer = dynamic(() => import("@/components/music/MusicPlayer"), {
  ssr: false,
  loading: () => null,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const pathname = usePathname()
  
  // Check if we're on admin pages where MusicPlayer should be disabled
  const isAdminPage = pathname?.startsWith('/artistcontrolsecret') || 
                     pathname?.startsWith('/uploads') || 
                     pathname?.startsWith('/originsradio/adminuploads')
  const isSnowPage = ['/snow', '/lineup', '/hotels', '/prices', '/reservation', '/contact'].includes(pathname)
  const hideMusicPlayer = isAdminPage || isSnowPage

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <AudioVisualizerProvider>
            <OrbActivationProvider>
              <Toaster />
              <Sonner />

              {MERCH_ENABLED && <MerchPopup />}
              {pathname !== "/" && !isSnowPage && <Navigation />}
              {!hideMusicPlayer && <MusicPlayer />}
              {children}
            </OrbActivationProvider>
          </AudioVisualizerProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
}
