'use client'

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Ticket, Users, Radio, Navigation, LogIn, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentRadioSlot } from "@/hooks/use-radio";
import Orb from "@/components/three/Orb";

type RouteKey = "events" | "fm" | "artists" | "thisWeek";

type RouteItem = {
  key: RouteKey;
  href: string;
  icon: React.ElementType;
  text: string;
  description: string;
};

const routes: RouteItem[] = [
  { key: "events", href: "/events", icon: Ticket, text: "Events", description: "Exclusive experiences" },
  { key: "fm", href: "/radio/schedule", icon: Radio, text: "Radio", description: "Weekly broadcasts" },
  { key: "artists", href: "/artists", icon: Users, text: "Artists", description: "Join the collective" },
  { key: "thisWeek", href: "/thisweek", icon: Navigation, text: "This Week", description: "Ankara nightlife" },
];

const HomeHero: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<RouteKey | null>(null);
  const { currentSlot } = useCurrentRadioSlot(5000);
  const isLive = !!currentSlot?.isLiveStream;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
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
      <div className="absolute inset-0 z-[1] bg-black/50" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-[#050508]/80" />
      
      {/* Ambient light effects */}
      <div className={cn(
        "absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-opacity duration-1000",
        "bg-gradient-to-br from-cyan-500/8 to-teal-500/5",
        "-top-[300px] -left-[300px] z-[3]",
        mounted ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-opacity duration-1000 delay-300",
        "bg-gradient-to-br from-blue-500/6 to-indigo-500/4",
        "-bottom-[200px] -right-[200px] z-[3]",
        mounted ? "opacity-100" : "opacity-0"
      )} />

      {/* 3D Orb - using mix-blend-mode to show video through */}
      <div className="absolute inset-0 z-10 pointer-events-none mix-blend-screen">
        <Orb className="w-full h-full" />
      </div>

      {/* Artist Login */}
      <Link
        href="/artist/login"
        className={cn(
          "fixed top-4 right-4 sm:top-6 sm:right-6 z-[80]",
          "inline-flex items-center gap-2 px-4 py-2.5",
          "liquid-glass-pill rounded-full",
          "text-white/70 hover:text-white text-sm",
          "transition-all duration-300 group"
        )}
      >
        <LogIn className="w-4 h-4" strokeWidth={1.5} />
        <span className="font-medium tracking-wide">Login</span>
      </Link>

      {/* Main Content */}
      <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Hero Text */}
        <div className={cn(
          "text-center mb-12 sm:mb-16 transition-all duration-1000",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Tagline */}
          <p className={cn(
            "text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white/40 mb-4 transition-all duration-1000 delay-200",
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
            "transition-all duration-1000 delay-500",
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
          "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl transition-all duration-1000 delay-300",
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
                  transitionDelay: mounted ? `${400 + index * 100}ms` : '0ms'
                }}
              >
                {/* Card glow on hover */}
                <div className={cn(
                  "absolute -inset-1 rounded-3xl blur-xl transition-opacity duration-500",
                  "bg-gradient-to-br from-white/10 to-white/5",
                  isHovered ? "opacity-100" : "opacity-0"
                )} />
                
                {/* Card */}
                <div className={cn(
                  "relative flex flex-col items-center justify-center text-center",
                  "p-5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl",
                  "liquid-glass-card transform-gpu",
                  "overflow-hidden"
                )}>
                  {/* Shine effect */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  )} />
                  
                  {/* Icon */}
                  <div className={cn(
                    "mb-4 p-3 rounded-2xl",
                    "bg-white/[0.04] group-hover:bg-white/[0.08]",
                    "border border-white/[0.06] group-hover:border-white/[0.1]",
                    "transition-all duration-500",
                    "group-hover:scale-110"
                  )}>
                    <IconComponent 
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-white/90 transition-colors duration-500" 
                      strokeWidth={1.5} 
                    />
                  </div>
                  
                  {/* Title */}
                  <h2 className="font-newake text-base sm:text-lg tracking-wide text-white/90 uppercase mb-1">
                    {route.text}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-[10px] sm:text-xs leading-snug text-white/55 group-hover:text-white/70 tracking-wide transition-colors duration-500">
                    {route.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className={cn(
                    "absolute bottom-3 right-3 sm:bottom-4 sm:right-4",
                    "opacity-0 group-hover:opacity-100 transition-all duration-500",
                    "translate-x-2 group-hover:translate-x-0"
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
          "mt-12 sm:mt-16 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-white/20",
          "transition-all duration-1000 delay-700",
          mounted ? "opacity-100" : "opacity-0"
        )}>
          Ankara • Istanbul • Underground
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050508] to-transparent z-[45] pointer-events-none" />
    </section>
  );
};

export default HomeHero;
