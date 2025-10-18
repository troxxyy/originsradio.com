'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Ticket, Users, Radio, Navigation, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentRadioSlot } from "@/hooks/use-radio";
import Orb from "@/components/three/Orb";

type RouteKey = "events" | "fm" | "artists" | "thisWeek";

type RouteItem = {
  key: RouteKey;
  href: string;
  icon: any;
  text: string;
  description?: string;
  position?: string;
};

const ScrambleText: React.FC<{
  text: string;
  active: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ text, className, onClick }) => {
  const combinedClass = `${className ?? ""} cursor-pointer`;
  return (
    <span className={combinedClass} aria-label={text} onClick={onClick}>
      {text}
    </span>
  );
};

const initialHoverStates = {
  events: false,
  fm: false,
  artists: false,
  thisWeek: false,
};

const HomeHero: React.FC = () => {
  const [hoverStates, setHoverStates] = useState<typeof initialHoverStates>(initialHoverStates);

  const { currentSlot } = useCurrentRadioSlot(5000);
  const isLive = !!currentSlot?.isLiveStream;

  useEffect(() => {
    // ensure clean hover state on mount
    setHoverStates(initialHoverStates);
  }, []);

  const headlineClass =
    "font-black uppercase tracking-tight text-[clamp(3rem,6vw,6.5rem)] leading-[0.9] drop-shadow-[0_0_30px_rgba(59,72,255,0.45)] font-newake pointer-events-auto";

  const sectionClass =
    "flex flex-col pointer-events-auto cursor-pointer transition-all duration-500 ease-out transform-gpu perspective-1000";

  const textGroupClass =
    "transition-all duration-700 ease-out transform-gpu pointer-events-auto inline-flex flex-col gap-0 w-fit items-center md:items-start text-center md:text-left group-hover-container";

  const mobileOrder = ["fm", "events", "artists", "thisWeek"] as const;

  const router = useRouter();

  const routes: RouteItem[] = [
    { key: "events", href: "/events", icon: Ticket, text: "Events", description: "Our Exclusive", position: "top-left" },
    { key: "fm", href: "/radio/schedule", icon: Radio, text: "Fm", description: "Timetable for Week", position: "top-right" },
    { key: "artists", href: "/artists", icon: Users, text: "Artists", description: "Join Us", position: "bottom-left" },
    { key: "thisWeek", href: "/thisweek", icon: Navigation, text: "This Week", description: "In Your City", position: "bottom-right" },
  ];

  const handleHover = (key: RouteKey, isHovering: boolean) => {
    setHoverStates(prev => ({ ...prev, [key]: isHovering }));
  };

  const handleMouseLeave = (key: RouteKey) => {
    setHoverStates(prev => ({ ...prev, [key]: false }));
  };

  const LiveStatus: React.FC = () => (
    <div className="flex items-center gap-2 mt-1">
      <span className={cn("w-2.5 h-2.5 rounded-full animate-pulse", isLive ? "bg-white" : "bg-red-500")} />
      <span className="text-sm uppercase tracking-wide text-white/70">{isLive ? "live now" : "currently offline"}</span>
    </div>
  );

  return (
    <section className="relative isolate w-full h-screen overflow-hidden bg-transparent">
      <div className="absolute inset-0 z-10">
        <Orb className="w-full h-full pointer-events-none" />
      </div>

      <div className="fixed top-3 right-3 sm:top-6 sm:right-6 z-[80] perspective-1000 pointer-events-auto">
        <Link
          href="/artist/login"
          className="artist-login-btn inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-colors group"
          aria-label="Artist Login"
          title="Artist Login"
        >
          <LogIn className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm font-medium">Artist Login</span>
        </Link>
      </div>

      <div className="pointer-events-auto relative z-30 flex h-full w-full items-center">
        <div className="pointer-events-auto w-full h-full px-8 md:px-12 lg:px-16 flex flex-col justify-start md:justify-center gap-10 pt-[25vh] md:pt-0 md:-mt-[400px]">

          <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-8 md:hidden justify-center">
            {mobileOrder.map((key) => {
              const route = routes.find(r => r.key === key)!;
              const IconComponent = route.icon;
              const isHovered = hoverStates[route.key as keyof typeof hoverStates];

              return (
                <Link key={route.key} href={route.href} className={`${sectionClass} text-white group items-center home-hero-link`}>
                  <div
                    className={textGroupClass}
                    onMouseEnter={() => handleHover(route.key, true)}
                    onMouseLeave={() => handleMouseLeave(route.key)}
                  >
                    <div className="flex items-center gap-3 mb-2 justify-center">
                      {route.key === "events" ? (
                        <>
                          <ScrambleText text={route.text} active={isHovered} className={`${headlineClass} block hover-3d-text`} onClick={() => router.push(route.href)} />
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                        </>
                      ) : (
                        <>
                          <ScrambleText text={route.text} active={isHovered} className={`${headlineClass} block hover-3d-text`} onClick={() => router.push(route.href)} />
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                        </>
                      )}
                    </div>

                    {route.key === "fm" && <LiveStatus />}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="w-full hidden md:flex items-center justify-between px-4 sm:px-8">
            {routes.slice(0, 2).map((route) => {
              const IconComponent = route.icon;
              const isHovered = hoverStates[route.key as keyof typeof hoverStates];

              return (
                <Link key={route.key} href={route.href} className={`${sectionClass} text-white group items-center home-hero-link`}>
                  <div className={textGroupClass} onMouseEnter={() => handleHover(route.key, true)} onMouseLeave={() => handleMouseLeave(route.key)}>
                    <div className="flex items-center gap-3 mb-2">
                      {route.key === "events" ? (
                        <>
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                          <ScrambleText text={route.text} active={isHovered} className={`${headlineClass} block hover-3d-text`} onClick={() => router.push(route.href)} />
                        </>
                      ) : (
                        <>
                          <ScrambleText text={route.text} active={isHovered} className={`${headlineClass} block hover-3d-text`} onClick={() => router.push(route.href)} />
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                        </>
                      )}
                    </div>

                    {route.key === "fm" && <LiveStatus />}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="w-full hidden md:flex items-center justify-between px-4 sm:px-8">
            {routes.slice(2).reverse().map((route) => {
              const IconComponent = route.icon;
              const isHovered = hoverStates[route.key as keyof typeof hoverStates];

              return (
                <Link key={route.key} href={route.href} className={`${sectionClass} text-white group items-center home-hero-link`}>
                  <div className={textGroupClass} onMouseEnter={() => handleHover(route.key, true)} onMouseLeave={() => handleMouseLeave(route.key)}>
                    <div className="flex items-center gap-4 mb-2">
                      {route.key === "thisWeek" ? (
                        <>
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                          <ScrambleText text={route.text} active={isHovered} className={`${headlineClass} block hover-3d-text`} />
                        </>
                      ) : (
                        <>
                          <ScrambleText text={route.text} active={isHovered} className={`${headlineClass} block hover-3d-text`} />
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
