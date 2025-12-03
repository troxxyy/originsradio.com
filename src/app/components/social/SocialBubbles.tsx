'use client'

import { useState, useEffect } from "react";
import { Youtube, Instagram, Cloud, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const socialLinks = [
  { key: 'youtube', icon: Youtube, url: 'https://www.youtube.com/@originsradiotr', label: 'YouTube' },
  { key: 'instagram', icon: Instagram, url: 'https://www.instagram.com/origins.radio/', label: 'Instagram' },
  { key: 'soundcloud', icon: Cloud, url: 'https://on.soundcloud.com/RAQQfrZ27sD539NXA', label: 'SoundCloud' },
  { key: 'support', icon: Heart, url: 'https://nowpayments.io/payment/?iid=5015396769&source=button', label: 'Support' }
];

const SocialBubbles = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn(
      "fixed top-20 left-1/2 -translate-x-1/2 z-[60]",
      "transition-all duration-700",
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="flex items-center gap-1">
        {socialLinks.map((link, index) => {
          const IconComponent = link.icon;
          
          return (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full",
                "bg-white/[0.03] hover:bg-white/[0.08]",
                "border border-white/[0.05] hover:border-white/[0.12]",
                "backdrop-blur-xl",
                "transition-all duration-300",
                "hover:scale-110 hover:-translate-y-1",
                "group"
              )}
              style={{ 
                transitionDelay: `${index * 50}ms`
              }}
              aria-label={link.label}
            >
              <IconComponent 
                className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" 
                strokeWidth={1.5}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialBubbles;
