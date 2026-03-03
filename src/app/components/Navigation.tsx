'use client'

import { Home, Info, Users, Ticket, Navigation as NavigationIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useWebHaptics } from "web-haptics/react";

const Navigation = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [mounted, setMounted] = useState(false);
  const { trigger } = useWebHaptics();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const links = [
    { name: "", icon: Home, href: "/" },
    { name: "Events", icon: Ticket, href: "/events" },
    { name: "Artists", icon: Users, href: "/artists" },
    { name: "Blog", icon: BookOpen, href: "/blog" },
    { name: "About", icon: Info, href: "/about" },
    { name: "This Week", icon: NavigationIcon, href: "/thisweek" },
  ];

  return (
    <nav className={cn(
      "fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[70]",
      "flex items-center gap-1.5",
      "transition-all duration-700",
      mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
    )}>
      {/* Home button */}
      <Link
        href="/"
        onClick={() => trigger('light')}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full",
          "bg-white/[0.04] hover:bg-white/[0.08]",
          "border border-white/[0.06] hover:border-white/[0.12]",
          "backdrop-blur-xl",
          "transition-all duration-300",
          "hover:scale-105",
          pathname === "/" && "bg-white/[0.08] border-white/[0.12]"
        )}
      >
        <Home className="w-4 h-4 text-white/70" strokeWidth={1.5} />
      </Link>

      {/* Other links */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1.5 rounded-full",
        "bg-white/[0.03] border border-white/[0.05]",
        "backdrop-blur-xl"
      )}>
        {links.slice(1).map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => trigger('light')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full",
                "transition-all duration-300",
                "hover:bg-white/[0.06]",
                isActive
                  ? "bg-white/[0.06] text-white/90"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <link.icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-xs font-medium tracking-wide hidden sm:inline">
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
