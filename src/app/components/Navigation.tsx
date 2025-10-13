'use client'

import { Home, Info, Users, Ticket, Navigation as NavigationIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const pathname = usePathname();
  const isGoCrazyPage = pathname === "/gocrazy";
  
  const links = [
    { name: "", icon: Home, href: "/" },
    { name: "Events", icon: Ticket, href: "/events" },
    { name: "Artists", icon: Users, href: "/artists" },
    { name: "Blog", icon: BookOpen, href: "/blog" },
    { name: "About", icon: Info, href: "/about" },
    { name: "This Week", icon: NavigationIcon, href: "/thisweek", iconClassName: "animate-red-glow" },
  ];

  // Define styles based on current page
  const navItemClass = isGoCrazyPage 
    ? "bg-black border border-white/20 px-6 py-3 rounded-full"
    : "glass px-6 py-3 rounded-full";

  // Add responsive container class
  const navContainerClass = "fixed top-3 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 w-auto max-w-[calc(100vw-16px)] px-2";

  return (
    <nav className={navContainerClass}>
      {/* Home button in its own bubble */}
      <div className={cn(navItemClass, "px-4 sm:px-6")}>
        <Link
          href={links[0].href}
          className="text-white/100 hover:text-white transition-colors group flex items-center nav-link"
        >
          {(() => {
            const IconComponent = links[0].icon;
            return <IconComponent className="w-5 h-5" />;
          })()}
          <span className="text-sm font-medium hidden group-hover:opacity-100 transition-opacity font-newake">
            {links[0].name}
          </span>
        </Link>
      </div>

      {/* Other navigation links in a separate bubble */}
      <div className={cn(navItemClass, "flex items-center gap-4 sm:gap-8 px-6 sm:px-6")}>
        {links.slice(1).map((link) => (
          <div key={link.name} className="relative">
            <Link
              href={link.href}
              className="text-white/100 hover:text-white transition-colors group flex items-center gap-2 px-1 nav-link"
            >
              {link.icon && <link.icon className={cn("w-5 h-5", (link as any).iconClassName)} />}
              <span className="nav-label text-sm font-medium hidden sm:inline-block font-newake">
                {link.name}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
