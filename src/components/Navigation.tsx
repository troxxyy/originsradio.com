
import { Home, User, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const links = [
    { name: "Home", icon: Home, href: "/" },
    { name: "OurWork", icon: User, href: "/ourwork" },
    { name: "About", icon: Info, href: "/about" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass px-6 py-3 rounded-full flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="text-white/100 hover:text-white transition-colors group flex items-center gap-2"
          >
            <link.icon className="w-5 h-5" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {link.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
