import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Ticket, Users, Radio, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentRadioSlot } from "@/hooks/use-radio";
import Orb from "@/components/three/Orb";

const HomeHero = () => {
  const [hoverStates, setHoverStates] = useState({
    events: false,
    fm: false,
    artists: false,
    thisWeek: false,
  });
  
  const { currentSlot } = useCurrentRadioSlot(5000);
  const isLive = !!currentSlot?.isLiveStream;

  const headlineClass =
    "font-black uppercase tracking-tight text-[clamp(3rem,6vw,6.5rem)] leading-[0.9] drop-shadow-[0_0_30px_rgba(59,72,255,0.45)] font-newake";

  const sectionClass =
    "flex flex-col pointer-events-none cursor-pointer transition-all duration-500 ease-out transform-gpu perspective-1000";

  const textGroupClass = 
    "transition-all duration-700 ease-out transform-gpu pointer-events-auto inline-flex flex-col gap-0 w-fit group-hover-container";

  const ScrambleText = ({ text, finalText, active, className }: { text: string; finalText?: string; active: boolean; className?: string }) => {
    const display = active ? (finalText ?? text) : text;
    return <span className={className} aria-label={text}>{display}</span>;
  };

  const routes = [
    {
      key: 'events',
      to: '/events',
      icon: Ticket,
      text: 'Events',
      finalText: 'Raves',
      description: 'Join the Raves',
      position: 'top-left'
    },
    {
      key: 'fm',
      to: '/radio/schedule',
      icon: Radio,
      text: 'FM',
      finalText: 'Live',
      description: 'Radio Schedule',
      position: 'top-right'
    },
    {
      key: 'artists',
      to: '/artists',
      icon: Users,
      text: 'Artists',
      finalText: 'Culture',
      description: 'Live the Culture',
      position: 'bottom-left'
    },
    {
      key: 'thisWeek',
      to: '/thisweek',
      icon: Navigation,
      text: 'This Week',
      finalText: 'Now',
      description: 'What\'s Now',
      position: 'bottom-right'
    }
  ];

  const handleHover = (key: string, isHovering: boolean) => {
    setHoverStates(prev => ({ ...prev, [key]: isHovering }));
  };

  return (
    <section className="relative isolate w-full h-screen -my-8 sm:my-0 overflow-hidden bg-transparent">
      <div className="absolute inset-0 z-10">
        <Orb className="w-full h-full pointer-events-auto" />
      </div>

      <div className="pointer-events-none relative z-20 flex h-full w-full items-center">
        <div className="pointer-events-none w-full h-full px-8 md:px-12 lg:px-16 flex flex-col justify-center gap-10 -mt-[400px]">
          {/* Top row: Events + FM on opposite sides */}
          <div className="w-full flex items-center justify-between px-4 sm:px-8">
            {routes.slice(0, 2).map((route) => {
              const IconComponent = route.icon;
              const isHovered = hoverStates[route.key as keyof typeof hoverStates];

              return (
                <Link
                  key={route.key}
                  to={route.to}
                  className={`${sectionClass} text-white group items-center`}
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className={textGroupClass}
                    onMouseEnter={() => handleHover(route.key, true)}
                    onMouseLeave={() => handleHover(route.key, false)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {route.key === 'fm' || route.key === 'artists' ? (
                        <>
                          <ScrambleText
                            text={route.text}
                            finalText={route.finalText}
                            active={isHovered}
                            className={`${headlineClass} block hover-3d-text`}
                          />
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                        </>
                      ) : (
                        <>
                          <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                          <ScrambleText
                            text={route.text}
                            finalText={route.finalText}
                            active={isHovered}
                            className={`${headlineClass} block hover-3d-text`}
                          />
                        </>
                      )}
                    </div>

                    {route.key === 'fm' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "w-2.5 h-2.5 rounded-full animate-pulse",
                          isLive ? "bg-white" : "bg-red-500"
                        )} />
                        <span className="text-sm uppercase tracking-wide text-white/70">
                          {isLive ? "live now" : "currently offline"}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom row: This Week (left) + Artists (right) */}
          <div className="w-full flex items-center justify-between px-4 sm:px-8">
            {routes.slice(2).reverse().map((route) => {
              const IconComponent = route.icon;
              const isHovered = hoverStates[route.key as keyof typeof hoverStates];

              return (
                <Link
                  key={route.key}
                  to={route.to}
                  className={`${sectionClass} text-white group items-center`}
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className={textGroupClass}
                    onMouseEnter={() => handleHover(route.key, true)}
                    onMouseLeave={() => handleHover(route.key, false)}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                      <ScrambleText
                        text={route.text}
                        finalText={route.finalText}
                        active={isHovered}
                        className={`${headlineClass} block hover-3d-text`}
                      />
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
