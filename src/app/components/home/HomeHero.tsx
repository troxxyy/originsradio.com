'use client'

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { Ticket, Users, Radio, Navigation, LogIn, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentRadioSlot } from "@/hooks/use-radio";
import Orb from "@/components/three/Orb";
import { useIsMobile } from "../../hooks/use-mobile";

type RouteKey = "events" | "fm" | "artists" | "thisWeek";

type RouteItem = {
  key: RouteKey;
  href: string;
  icon: React.ElementType;
  text: string;
  description: string;
};

const routes: RouteItem[] = [
  { key: "events", href: "/events", icon: Ticket, text: "Events", description: "Live experiences" },
  { key: "fm", href: "/radio/schedule", icon: Radio, text: "Radio", description: "Weekly schedule" },
  { key: "artists", href: "/artists", icon: Users, text: "Artists", description: "Our collective" },
  { key: "thisWeek", href: "/thisweek", icon: Navigation, text: "This Week", description: "What's happening" },
];

const HomeHero: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<RouteKey | null>(null);
  const { currentSlot } = useCurrentRadioSlot(5000);
  const isMobile = useIsMobile();
  const isLive = !!currentSlot?.isLiveStream;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay error or user interaction requirement
        console.log('Autoplay prevented');
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
        // Prevent video from claiming audio context
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.muted = true;
          video.volume = 0;
        }}
      >
        <source src="/website-gif.mov" type="video/quicktime" />
        <source src="/website-gif.mov" type="video/mp4" />
      </video>
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-black/60 sm:bg-black/40" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-[#050508]/80" />
      
      {/* Ambient light effects */}
      <div className={cn(
        "absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-opacity duration-700",
        "bg-gradient-to-br from-cyan-500/8 to-teal-500/5",
        "-top-[300px] -left-[300px] z-[3]",
        mounted ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-opacity duration-700 delay-150",
        "bg-gradient-to-br from-blue-500/6 to-indigo-500/4",
        "-bottom-[200px] -right-[200px] z-[3]",
        mounted ? "opacity-100" : "opacity-0"
      )} />

      {/* 3D Orb - using mix-blend-mode to show video through */}
      {!isMobile && (
        <div className="absolute inset-0 z-10 pointer-events-none mix-blend-screen brightness-125 saturate-125">
          <Orb className="w-full h-full" />
        </div>
      )}

      {/* Artist Login */}
      <div className={cn(
        "fixed z-50",
        "top-[calc(0.75rem+env(safe-area-inset-top))] right-[calc(0.75rem+env(safe-area-inset-right))]",
        "sm:top-[calc(1.5rem+env(safe-area-inset-top))] sm:right-[calc(1.5rem+env(safe-area-inset-right))]"
      )}>
        <Link 
          href="/artist/login" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-colors group"
          aria-label="Artist Login"
          title="Artist Login"
        >
          <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Artist Login</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Hero Text */}
        <div className={cn(
          "text-center mb-8 sm:mb-16 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Tagline */}
          <p className={cn(
            "text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white/40 mb-4 transition-all duration-700 delay-100",
            mounted ? "opacity-100" : "opacity-0"
          )}>
            Underground Sound
          </p>
          
          {/* Main Title */}
          <h1 className="font-newake text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white uppercase leading-none">
            Origins
          </h1>
          
          {/* Subtitle with glow */}
          <div className="relative mt-4">
            <p className="text-sm sm:text-base tracking-[0.35em] uppercase text-white/50 font-light">
              Radio Collective
            </p>
            <div className="absolute inset-0 blur-xl bg-white/5 -z-10" />
          </div>

          {/* Live indicator */}
          <div className={cn(
            "inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full",
            "bg-white/[0.03] border border-white/[0.06]",
            "transition-all duration-700 delay-300",
            mounted ? "opacity-100" : "opacity-0"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isLive ? "bg-emerald-400" : "bg-white/30"
            )} />
            <span className="text-xs tracking-widest uppercase text-white/50">
              {isLive ? "Now Live" : "Listen Soon"}
            </span>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl transition-all duration-200 delay-100",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          {routes.map((route, index) => {
            const IconComponent = route.icon;
            const isHovered = hoveredCard === route.key;
            
            return (
              <Link
                key={route.key}
                href={route.href}
                className="group relative"
                onMouseEnter={() => setHoveredCard(route.key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ 
                  transitionDelay: mounted ? `${200 + index * 75}ms` : '0ms'
                }}
              >
                {/* Card */}
                <div className={cn(
                  "relative flex flex-row sm:flex-col items-center sm:justify-center text-left sm:text-center",
                  "p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl",
                  "bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]",
                  "hover:bg-white/[0.04] hover:border-white/[0.08]",
                  "transition-all duration-300 ease-out"
                )}>
                  {/* Icon container - minimal transparent */}
                  <div className={cn(
                    "relative z-10 mr-4 sm:mr-0 sm:mb-4 p-3 sm:p-3.5 rounded-xl",
                    "bg-white/[0.03] border border-white/[0.05]",
                    "backdrop-blur-sm",
                    "transition-all duration-300 ease-out",
                    "group-hover:bg-white/[0.06] group-hover:border-white/[0.1]"
                  )}>
                    <IconComponent 
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300",
                        "text-white/50 group-hover:text-white/80"
                      )}
                      strokeWidth={1.5} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h2 className="relative z-10 font-newake text-base sm:text-lg tracking-wide text-white/80 group-hover:text-white/95 uppercase mb-1 transition-colors duration-300">
                      {route.text}
                    </h2>
                    
                    {/* Description */}
                    <p className="relative z-10 text-[10px] sm:text-xs leading-snug text-white/40 group-hover:text-white/60 tracking-wide transition-colors duration-300 truncate sm:whitespace-normal">
                      {route.description}
                    </p>
                  </div>

                  {/* Arrow indicator - minimal reveal */}
                  <div className={cn(
                    "absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10",
                    "opacity-0 group-hover:opacity-60 transition-all duration-300 ease-out",
                    "translate-x-1 group-hover:translate-x-0"
                  )}>
                    <ChevronRight className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom text */}
        <p className={cn(
          "mt-8 sm:mt-16 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-white",
          "transition-all duration-700 delay-400",
          mounted ? "opacity-100" : "opacity-100"
        )}>
          Ankara • Istanbul • Bali
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050508] to-transparent z-[45] pointer-events-none" />
    </section>
  );
};

export default HomeHero;
