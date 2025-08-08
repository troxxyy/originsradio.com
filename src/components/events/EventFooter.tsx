import { Mail, Youtube, Instagram, Cloud, Radio, MapPin, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";
import ConsumerDisclosureDialog from "./ConsumerDisclosureDialog";

interface EventFooterProps {}

const EventFooter = ({}: EventFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 text-white relative">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Decorative top border with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="h-5 w-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Origins Radio</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Ankara's premier interactive radio station bringing you the best in electronic music, live shows, and cultural experiences. We connect artists, music lovers, and the creative community.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4" />
              <span>Ankara, Turkey</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Explore</h3>
            <div className="flex flex-col gap-3">
              <a href="/" className="text-sm text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2">
                <Music className="h-3 w-3" />
                Live Radio
              </a>
              <a href="/events" className="text-sm text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Events
              </a>
              <a href="/artists" className="text-sm text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2">
                <Radio className="h-3 w-3" />
                Artists
              </a>
              <a href="/about" className="text-sm text-white/80 hover:text-white transition-colors duration-200">
                About Us
              </a>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Connect</h3>
            <div className="space-y-3">
              <a 
                href="mailto:info@originsradio.com" 
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors duration-200"
              >
                <Mail className="h-4 w-4" /> 
                info@originsradio.com
              </a>
              
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-white/60 mb-3">Follow Us</div>
                <div className="flex flex-col gap-2">
                  <a 
                    href="https://www.youtube.com/@originsradiotr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>
                  <a 
                    href="https://www.instagram.com/origins.radio/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                  <a 
                    href="https://on.soundcloud.com/RAQQfrZ27sD539NXA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors duration-200"
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Legal</h3>
            <div className="flex flex-col gap-3">
              <PrivacyPolicyDialog
                triggerLabel="Privacy Policy"
                variant="ghost"
                size="sm"
                buttonClassName="px-0 h-auto text-sm text-white/80 hover:text-white underline-offset-4 hover:underline justify-start"
              />
              <ConsumerDisclosureDialog
                triggerLabel="Consumer Disclosure"
                variant="ghost"
                size="sm"
                buttonClassName="px-0 h-auto text-sm text-white/80 hover:text-white underline-offset-4 hover:underline justify-start"
              />
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/60 leading-relaxed">
                  Supporting Turkey's electronic music scene since 2023. All content is owned by respective artists and Origins Radio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/60">
              © {currentYear} Origins Radio — All rights reserved.
            </div>
            <div className="text-xs text-white/50">
              Made with ♡ in Ankara
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EventFooter; 
