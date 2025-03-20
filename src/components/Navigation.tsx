import { Home, User, Info, Music } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const isGoCrazyPage = location.pathname === "/gocrazy";
  const [showTooltip, setShowTooltip] = useState(false);
  
  const links = [
    { name: "", icon: Home, href: "/" },
    { name: "OurWork", icon: User, href: "/ourwork" },
    { name: "About", icon: Info, href: "/about" },
    { name: "3DVS", icon: Music, href: "/gocrazy", needsTooltip: true },
  ];

  // Define styles based on current page
  const navItemClass = isGoCrazyPage 
    ? "bg-black border border-white/20 px-6 py-3 rounded-full"
    : "glass px-6 py-3 rounded-full";

  // Add responsive container class
  const navContainerClass = "fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-3 w-auto";

  return (
    <nav className={navContainerClass}>
      {/* Home button in its own bubble */}
      <div className={cn(navItemClass, "px-4 sm:px-6")}>
        <Link
          to={links[0].href}
          className="text-white/100 hover:text-white transition-colors group flex items-center "
        >
          {(() => {
            const IconComponent = links[0].icon;
            return <IconComponent className="w-5 h-5" />;
          })()}
          <span className="text-sm font-medium hidden group-hover:opacity-100 transition-opacity">
            {links[0].name}
          </span>
        </Link>
      </div>

      {/* Other navigation links in a separate bubble */}
      <div className={cn(navItemClass, "flex items-center gap-14 sm:gap-8 px-6 sm:px-6")}>
        {links.slice(1).map((link) => (
          <div
            key={link.name}
            className="relative"
            onMouseEnter={() => link.needsTooltip ? setShowTooltip(true) : null}
            onMouseLeave={() => link.needsTooltip ? setShowTooltip(false) : null}
          >
            <Link
              to={link.href}
              className="text-white/100 hover:text-white transition-colors group flex items-center gap-2 px-1"
            >
              {link.icon && <link.icon className="w-5 h-5" />}
              <span className="text-sm font-medium hidden sm:inline-block sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                {link.name}
              </span>
            </Link>
            {link.needsTooltip && showTooltip && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs p-2 rounded-md whitespace-nowrap z-50">
                This feature is currently in beta and only a few capabilities are online
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
