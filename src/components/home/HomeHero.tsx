import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Ticket, Users, Radio, Navigation, LogIn } from "lucide-react";
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

  // Reset all hover states on mount to ensure clean state
  useEffect(() => {
    setHoverStates({
      events: false,
      fm: false,
      artists: false,
      thisWeek: false,
    });
  }, []);

  const headlineClass =
    "font-black uppercase tracking-tight text-[clamp(3rem,6vw,6.5rem)] leading-[0.9] drop-shadow-[0_0_30px_rgba(59,72,255,0.45)] font-newake pointer-events-auto";

  const sectionClass =
    "flex flex-col pointer-events-auto cursor-pointer transition-all duration-500 ease-out transform-gpu perspective-1000";

  const textGroupClass = 
    "transition-all duration-700 ease-out transform-gpu pointer-events-auto inline-flex flex-col gap-0 w-fit items-center md:items-start text-center md:text-left group-hover-container";

  const mobileOrder = ["fm", "events", "artists", "thisWeek"] as const;

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
      finalText: 'our exclusive',
      description: 'Our Exclusive',
      position: 'top-left'
    },
    {
      key: 'fm',
      to: '/radio/schedule',
      icon: Radio,
      text: 'Fm',
      finalText: 'timetable',
      description: 'Timetable for Week',
      position: 'top-right'
    },
    {
      key: 'artists',
      to: '/artists',
      icon: Users,
      text: 'Artists',
      finalText: 'join us',
      description: 'Join Us',
      position: 'bottom-left'
    },
    {
      key: 'thisWeek',
      to: '/thisweek',
      icon: Navigation,
      text: 'This Week',
      finalText: 'in your city',
      description: 'In Your City',
      position: 'bottom-right'
    }
  ];

  const handleHover = (key: string, isHovering: boolean) => {
    setHoverStates(prev => ({ ...prev, [key]: isHovering }));
  };

  const handleMouseLeave = (key: string) => {
    // Force reset to ensure it always goes back to original state
    setHoverStates(prev => ({ ...prev, [key]: false }));
  };

  

  return (
    <section className="relative isolate w-full h-screen overflow-hidden bg-transparent">
      <div className="absolute inset-0 z-10">
        <Orb className="w-full h-full pointer-events-auto" />
      </div>

      {/* Artist Login Button */}
      <div className="fixed top-3 right-3 sm:top-6 sm:right-6 z-[80] perspective-1000 pointer-events-auto">
        <Link 
          to="/artist/login" 
          className="artist-login-btn inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-colors group"
          aria-label="Artist Login"
          title="Artist Login"
        >
          <LogIn className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm font-medium">Artist Login</span>
        </Link>
      </div>

      <div className="pointer-events-auto relative z-20 flex h-full w-full items-center">
        <div className="pointer-events-auto w-full h-full px-8 md:px-12 lg:px-16 flex flex-col justify-start md:justify-center gap-10 pt-[25vh] md:pt-0 md:-mt-[400px]">
          <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-8 md:hidden">
            {mobileOrder.map((key) => {
              const route = routes.find((item) => item.key === key);
              if (!route) {
                return null;
              }

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
                    onMouseLeave={() => handleMouseLeave(route.key)}
                    onMouseOut={() => handleMouseLeave(route.key)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ScrambleText
                        text={route.text}
                        finalText={route.finalText}
                        active={isHovered}
                        className={`${headlineClass} block hover-3d-text`}
                      />
                      <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
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

          {/* Top row: Events + FM on opposite sides */}
          <div className="w-full hidden md:flex items-center justify-between px-4 sm:px-8">
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
                    onMouseLeave={() => handleMouseLeave(route.key)}
                    onMouseOut={() => handleMouseLeave(route.key)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ScrambleText
                        text={route.text}
                        finalText={route.finalText}
                        active={isHovered}
                        className={`${headlineClass} block hover-3d-text`}
                      />
                      <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
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
          <div className="w-full hidden md:flex items-center justify-between px-4 sm:px-8">
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
                    onMouseLeave={() => handleMouseLeave(route.key)}
                    onMouseOut={() => handleMouseLeave(route.key)}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <ScrambleText
                        text={route.text}
                        finalText={route.finalText}
                        active={isHovered}
                        className={`${headlineClass} block hover-3d-text`}
                      />
                      <IconComponent className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
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
