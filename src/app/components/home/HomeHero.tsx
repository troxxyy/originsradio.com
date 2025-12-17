'use client'

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { Ticket, Users, Radio, Navigation, BookOpen, Info, Youtube, Instagram, Cloud, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentRadioSlot } from "@/hooks/use-radio";
import Orb from "@/components/three/Orb";
import { useIsMobile } from "../../hooks/use-mobile";
import { useOrbActivation } from "@/contexts/OrbActivationContext";

type RouteKey = "events" | "fm" | "artists" | "blog" | "about" | "thisWeek";

type RouteItem = {
  key: RouteKey;
  href: string;
  icon: React.ElementType;
  text: string;
  isComingSoon?: boolean;
};

const routes: RouteItem[] = [
  { key: "events", href: "/events", icon: Ticket, text: "Events" },
  { key: "fm", href: "/radio/schedule", icon: Radio, text: "Radio" },
  { key: "artists", href: "/artists", icon: Users, text: "Artists" },
  { key: "about", href: "/about", icon: Info, text: "About" },
  { key: "thisWeek", href: "/thisweek", icon: Navigation, text: "This Week" },
];

const socialLinks = [
  { key: 'youtube', icon: Youtube, url: 'https://www.youtube.com/@originsradiotr', label: 'YouTube' },
  { key: 'instagram', icon: Instagram, url: 'https://www.instagram.com/origins.radio/', label: 'Instagram' },
  { key: 'soundcloud', icon: Cloud, url: 'https://on.soundcloud.com/RAQQfrZ27sD539NXA', label: 'SoundCloud' },
  { key: 'support', icon: Heart, url: 'https://nowpayments.io/payment/?iid=5015396769&source=button', label: 'Support' }
];

const HomeHero: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [hoveredRoute, setHoveredRoute] = useState<RouteKey | null>(null);
  const [videoOpacity, setVideoOpacity] = useState(1.0);
  const { currentSlot } = useCurrentRadioSlot(5000);
  const isMobile = useIsMobile();
  const isLive = !!currentSlot?.isLiveStream;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isOrbActive } = useOrbActivation();

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

  // Fade out video after 30 seconds when radio is live
  useEffect(() => {
    if (isLive) {
      const fadeTimer = setTimeout(() => {
        setVideoOpacity(0);
      }, 30000); // 30 seconds

      return () => clearTimeout(fadeTimer);
    } else {
      // Reset opacity when not live
      setVideoOpacity(0.7);
    }
  }, [isLive]);

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
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: videoOpacity }}
        // Prevent video from claiming audio context
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.muted = true;
          video.volume = 0;
        }}
      >
        <source src="/website background compres.mp4" type="video/mp4" />
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
      {/* Activated when play or unmute button is pressed */}
      {!isMobile && isOrbActive && (
        <div className="absolute inset-0 z-10 pointer-events-none mix-blend-screen brightness-[90%] saturate-125">
          <Orb className="w-full h-full" />
        </div>
      )}


      {/* Main Content */}
      <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Hero Text */}
        <div className={cn(
          "text-center mb-10 sm:mb-16 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Tagline */}
          <p className={cn(
            "text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white/40 mb-4 transition-all duration-700 delay-100",
            mounted ? "opacity-100" : "opacity-0"
          )}>
            live everyday at 9pm istanbul time
          </p>
          
          {/* Main Title */}
          <div className="relative">
            <h1 className="font-newake text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white/80 uppercase leading-none relative z-10">
              originsradio
            </h1>
            {/* Overlay glow effect */}
            <div className="absolute inset-0 blur-2xl bg-white/10 -z-10" />
            <div className="absolute inset-0 blur-[60px] bg-gradient-to-r from-cyan-500/20 via-transparent to-teal-500/20 -z-10" />
          </div>
          
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

        {/* Central Layout Container */}
        <div className={cn(
          "flex flex-col items-center gap-6 sm:gap-8 w-full max-w-4xl mx-auto",
          "mt-[10vh] sm:mt-0",
          "transition-all duration-700 delay-200",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          {/* Big Navigation Panel */}
          <nav className={cn(
            "flex flex-nowrap overflow-x-auto items-center justify-center pt-[15px] pb-2 px-2 sm:p-2 rounded-[2rem] sm:rounded-full gap-2 sm:gap-2",
            "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
            "shadow-2xl shadow-black/20",
            "max-w-full w-full sm:w-auto",
            "scrollbar-hide snap-x snap-mandatory"
          )}>
            {routes.map((route, index) => {
              const IconComponent = route.icon;
              const isHovered = hoveredRoute === route.key;
              
              return (
                <Link
                  key={route.key}
                  href={route.href}
                  className="group relative outline-none flex-shrink-0 snap-center"
                  onMouseEnter={() => setHoveredRoute(route.key)}
                  onMouseLeave={() => setHoveredRoute(null)}
                >
                  <div className={cn(
                    "relative flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-4 rounded-full",
                    "transition-all duration-300 ease-out",
                    "hover:bg-white/[0.08]",
                    "active:scale-95"
                  )}>
                    <IconComponent 
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 flex-shrink-0",
                        "text-white/50 group-hover:text-white"
                      )} 
                      strokeWidth={1.5}
                    />
                    <span className={cn(
                      "font-newake text-xs sm:text-lg tracking-wide uppercase whitespace-nowrap",
                      "text-white/60 group-hover:text-white",
                      "transition-colors duration-300"
                    )}>
                      {route.text}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Social Bubbles */}
          <div className="flex items-center gap-3 sm:gap-4">
            {socialLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.key}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full",
                    "bg-white/[0.03] border border-white/[0.08] backdrop-blur-md",
                    "hover:bg-white/[0.1] hover:scale-110 hover:-translate-y-1",
                    "transition-all duration-300 ease-out",
                    "group"
                  )}
                  aria-label={link.label}
                >
                  <IconComponent 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-white transition-colors" 
                    strokeWidth={1.5}
                  />
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom text */}
        <p className={cn(
          "mt-12 sm:mt-16 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-white/30",
          "transition-all duration-700 delay-400",
          mounted ? "opacity-100" : "opacity-0"
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
