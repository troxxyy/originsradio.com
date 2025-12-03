'use client'

import { Mail, Youtube, Instagram, Cloud, Radio, MapPin, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";
import ConsumerDisclosureDialog from "./ConsumerDisclosureDialog";
import Link from "next/link";

interface EventFooterProps {}

const EventFooter = ({}: EventFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 sm:mt-20 text-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        {/* Decorative top border with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 sm:mb-12" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 py-8 sm:py-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="h-5 w-5 text-white" />
              <h3 className="text-lg sm:text-xl font-semibold text-white">Origins Radio</h3>
            </div>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Premier interactive radio station bringing you the best in electronic music, live shows, and cultural experiences. We connect artists, music lovers, and the creative community.
            </p>
            <div className="flex items-center gap-2 text-sm sm:text-base text-white/70">
              <MapPin className="h-4 w-4" />
              <span>Turkey</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-white/90">Explore</h3>
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 py-1">
                <Music className="h-4 w-4" />
                Live Radio
              </Link>
              <Link href="/events" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 py-1">
                <Calendar className="h-4 w-4" />
                Events
              </Link>
              <Link href="/artists" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 py-1">
                <Radio className="h-4 w-4" />
                Artists
              </Link>
              <Link href="/about" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 py-1">
                About Us
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-white/90">Connect</h3>
            <div className="space-y-4">
              <a 
                href="mailto:info@originsradio.com" 
                className="inline-flex items-center gap-2 text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 py-1 min-h-[44px]"
              >
                <Mail className="h-4 w-4" /> 
                info@originsradio.com
              </a>
              
              <div className="space-y-3">
                <div className="text-xs sm:text-sm uppercase tracking-wide text-white/60 mb-3">Follow Us</div>
                <div className="flex flex-col gap-3">
                  <a 
                    href="https://www.youtube.com/@originsradiotr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 py-1 min-h-[44px]"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>
                  <a 
                    href="https://www.instagram.com/origins.radio/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 py-1 min-h-[44px]"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                  <a 
                    href="https://on.soundcloud.com/RAQQfrZ27sD539NXA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-200 py-1 min-h-[44px]"
                  >
                    <Cloud className="h-4 w-4" />
                    SoundCloud
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-white/90">Legal</h3>
            <div className="flex flex-col gap-4">
              <PrivacyPolicyDialog
                triggerLabel="Privacy Policy"
                variant="ghost"
                size="sm"
                buttonClassName="px-0 h-auto text-sm sm:text-base text-white/80 hover:text-white underline-offset-4 hover:underline justify-start py-1 min-h-[44px]"
              />
              <ConsumerDisclosureDialog
                triggerLabel="Consumer Disclosure"
                variant="ghost"
                size="sm"
                buttonClassName="px-0 h-auto text-sm sm:text-base text-white/80 hover:text-white underline-offset-4 hover:underline justify-start py-1 min-h-[44px]"
              />
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Supporting Turkey's electronic music scene since 2023. All content is owned by respective artists and Origins Radio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="text-sm sm:text-base text-white/60">
              © {currentYear} Origins Radio — All rights reserved.
            </div>
            <div className="text-xs sm:text-sm text-white/50">
              Made with ♡ by Origins Radio
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EventFooter; 
