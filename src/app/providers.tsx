'use client'

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { HelmetProvider } from "react-helmet-async"
import LoadingScreen from "@/components/LoadingScreen"
import Navigation from "@/components/Navigation"
import TicketPopup from "@/components/TicketPopup"
import MusicPlayer from "@/components/music/MusicPlayer"

const ONE_HOUR = 60 * 60 * 1000

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [isLoading, setIsLoading] = useState(true) // Always start with loading screen
  const pathname = usePathname()
  
  // Check if we're on admin pages where MusicPlayer should be disabled
  const isAdminPage = pathname?.startsWith('/artistcontrolsecret') || 
                     pathname?.startsWith('/uploads') || 
                     pathname?.startsWith('/originsradio/adminuploads')

  useEffect(() => {
    // Add loading class to body to prevent flash
    document.body.classList.add('loading')
    
    // Check if we should skip loading based on recent visit
    if (typeof window !== 'undefined') {
      const lastVisit = localStorage.getItem("lastVisit")
      const shouldSkipLoading = lastVisit && Date.now() - parseInt(lastVisit) < ONE_HOUR
      
      if (shouldSkipLoading) {
        // Skip loading screen for recent visits
        setIsLoading(false)
        document.body.classList.remove('loading')
      } else {
        // Show loading screen and mark visit
        localStorage.setItem("lastVisit", Date.now().toString())
      }
    }
    
    return () => {
      document.body.classList.remove('loading')
    }
  }, [])

  const handleLoadingComplete = () => {
    console.log("handleLoadingComplete called, setting isLoading to false")
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsLoading(false)
      document.body.classList.remove('loading')
    }, 100)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <TicketPopup />

          {/* Loading Screen */}
          {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}

          {/* Main Content - Only render after loading */}
          {!isLoading && (
            <>
              <Navigation />
              {/* Only render MusicPlayer on non-admin pages to avoid interference with admin functionality */}
              {!isAdminPage && <MusicPlayer />}
              {children}
            </>
          )}
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
}
