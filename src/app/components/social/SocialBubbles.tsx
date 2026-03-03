'use client'

import { useState, useEffect } from "react";
import { useWebHaptics } from "web-haptics/react";
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
  const { trigger } = useWebHaptics();

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
                "liquid-glass-pill liquid-glass-bubble",
                "transition-all duration-300",
                "hover:scale-110 hover:-translate-y-1",
                "group"
              )}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
              onClick={() => trigger('light')}
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
