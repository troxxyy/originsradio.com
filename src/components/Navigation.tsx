import { Home, User, Info, Music } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const isGoCrazyPage = location.pathname === "/gocrazy";
  
  const links = [
    { name: "", icon: Home, href: "/" },
    { name: "OurWork", icon: User, href: "/ourwork" },
    { name: "About", icon: Info, href: "/about" },
    { name: "GoCrazy", icon: Music, href: "/gocrazy" },
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
      <div className={cn(navItemClass, "flex items-center gap-4 sm:gap-8 px-3 sm:px-6")}>
        {links.slice(1).map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="text-white/100 hover:text-white transition-colors group flex items-center gap-2 px-1"
          >
            {link.icon && <link.icon className="w-5 h-5" />}
            <span className="text-sm font-medium hidden sm:inline-block sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
              {link.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
