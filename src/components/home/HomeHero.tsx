import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Orb from "@/components/three/Orb";

const HomeHero = () => {
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

  const headlineClass =
    "font-black uppercase tracking-tight text-[clamp(3rem,6vw,6.5rem)] leading-[0.9] drop-shadow-[0_0_30px_rgba(59,72,255,0.45)] font-newake";

  const sectionClass =
    "flex flex-col pointer-events-none cursor-pointer transition-all duration-500 ease-out transform-gpu perspective-1000";

  const textGroupClass = 
    "transition-all duration-700 ease-out transform-gpu pointer-events-auto inline-flex flex-col gap-0 w-fit group-hover-container";

  const ScrambleText = ({ text, finalText, active, className }: { text: string; finalText?: string; active: boolean; className?: string }) => {
    const characters = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*", []);
    const [display, setDisplay] = useState(text);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
      // Cleanup helper
      const clearTimers = () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };

      if (!active) {
        clearTimers();
        setDisplay(text);
        return;
      }

      // Start scrambling immediately on hover
      clearTimers();
      intervalRef.current = window.setInterval(() => {
        setDisplay(() => {
          let out = "";
          for (let i = 0; i < text.length; i++) {
            const originalChar = text[i];
            if (originalChar === " ") {
              out += " ";
              continue;
            }
            const rand = Math.floor(Math.random() * characters.length);
            out += characters[rand];
          }
          return out;
        });
      }, 12); // very fast

      // Stop after 2 seconds and reveal target instantly
      timeoutRef.current = window.setTimeout(() => {
        clearTimers();
        setDisplay(finalText ?? text);
      }, 1500);

      return () => {
        clearTimers();
        setDisplay(text);
      };
    }, [active, text, finalText, characters]);

    return <span className={className} aria-label={text}>{display}</span>;
  };

  return (
    <section className="relative isolate w-full h-screen -my-8 sm:my-0 overflow-hidden bg-transparent">
      <div className="absolute inset-0 z-10">
        <Orb className="w-full h-full pointer-events-auto" />
      </div>

      <div className="pointer-events-none relative z-20 flex h-full w-full items-center">
        <div className="pointer-events-none flex h-full w-full items-center justify-between px-8 md:px-12 lg:px-16">
          <Link
            to="/events"
            className={`${sectionClass} items-start justify-center text-white text-left group`}
            style={{ perspective: "1000px" }}
          >
            <div
              className={textGroupClass}
              onMouseEnter={() => setHoverLeft(true)}
              onMouseLeave={() => setHoverLeft(false)}
            >
              <ScrambleText
                text="Explore"
                finalText="Join"
                active={hoverLeft}
                className={`${headlineClass} block hover-3d-text`}
              />
              <ScrambleText
                text="the"
                finalText="the"
                active={hoverLeft}
                className={`${headlineClass} block hover-3d-text`}
              />
              <ScrambleText
                text="Events"
                finalText="Raves"
                active={hoverLeft}
                className={`${headlineClass} block hover-3d-text`}
              />
            </div>
          </Link>
          <Link
            to="/artists"
            className={`${sectionClass} items-end justify-center text-white text-right group`}
            style={{ perspective: "1000px" }}
          >
            <div
              className={textGroupClass}
              onMouseEnter={() => setHoverRight(true)}
              onMouseLeave={() => setHoverRight(false)}
            >
              <ScrambleText
                text="Experience"
                finalText="Live"
                active={hoverRight}
                className={`${headlineClass} block hover-3d-text`}
              />
              <ScrambleText
                text="the"
                finalText="the"
                active={hoverRight}
                className={`${headlineClass} block hover-3d-text`}
              />
              <ScrambleText
                text="Music"
                finalText="Culture"
                active={hoverRight}
                className={`${headlineClass} block hover-3d-text`}
              />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
