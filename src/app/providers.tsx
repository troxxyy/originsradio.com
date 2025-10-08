'use client'

import { useState, useEffect } from "react"
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
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false
    const lastVisit = localStorage.getItem("lastVisit")
    return !lastVisit || Date.now() - parseInt(lastVisit) > ONE_HOUR
  })

  useEffect(() => {
    console.log("App mounted, isLoading:", isLoading)
    if (isLoading) {
      localStorage.setItem("lastVisit", Date.now().toString())
    }
  }, [isLoading])

  const handleLoadingComplete = () => {
    console.log("handleLoadingComplete called, setting isLoading to false")
    setIsLoading(false)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <TicketPopup />

          {/* Loading Screen - Only show when needed */}
          {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}

          {/* Main Content - Only shown when loading is complete */}
          <div className={isLoading ? "loading-hidden" : "block"}>
            <Navigation />
            <MusicPlayer />
            {children}
          </div>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
}
