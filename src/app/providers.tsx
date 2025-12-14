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

  // #region agent log - debug instrumentation
  const __orLog = (hypothesisId: string, location: string, message: string, data?: Record<string, unknown>) => {
    try {
      fetch("http://127.0.0.1:7242/ingest/d566a5c0-ce65-4742-a027-2a70ece3fc46", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId,
          location,
          message,
          data,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    __orLog("C", "src/app/providers.tsx:pathname", "Providers observed route change", {
      pathname,
      isLoading,
      isAdminPage,
    });
  }, [pathname]); // only on route changes
  // #endregion agent log

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
