'use client'

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Calendar, MapPin } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { useOurWorkProjects } from "@/hooks/use-supabase";
import type { TicketTier } from "@/components/events/TicketPurchaseModal";
import Link from "next/link";
import { generateSlug } from "@/lib/supabase-utils";

interface ProjectUiModel {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  date?: string;
  upcoming?: boolean;
  location?: string;
  ticketUrl?: string;
  tiers?: TicketTier[];
  formUrl?: string; // invite-only entry form
  slug?: string; // random identifier for URL
}

const staticProjects: ProjectUiModel[] = [
  {
    title: "Backyard Secrets Lounge",
    description: "Invite-only lounge night curated by Originsradio & Culter. Free event. Form doldurarak giriş talebi oluşturun.",
    imageUrl: "/ourwork/disco.jpeg",
    tags: ["invite-only", "lounge"],
    date: "August 29, Friday — Doors 22:00",
    upcoming: true,
    location: "Backyard Secrets",
    formUrl: "/invite/backyardsecretslounge"
  },
  {
    title: "ORIGINSRADIO PRESENTS: ECZODIA",
    description: "Experience the powerful sonic journey of ECZODIA, a rising DJ/producer who masterfully blends Trance, Rave, and Hard Techno. Having cut his teeth in the world of Hardmusic, ECZODIA now focuses on the Techno aesthetic with a versatile approach to the genre. Drawing influences from both English and Dutch electronic music cultures, ECZODIA brings an unmistakable energy that has already landed him on the prestigious Boiler Room stage. With a future performance at Tomorrowland on the horizon, this is your chance to witness one of the most exciting rising names in the scene before global dominance.",
    imageUrl: "/ourwork/eczo1.png",
    tags: [],
    date: "March 28, 2024",
    upcoming: false,
    location: "Pixel",
    ticketUrl: "https://biletino.com/tr/e-126q/eczodia-originsradio-presents-pixel-ankara/",
    tiers: [
      { id: "early", name: "Early Bird", price: 350, currency: "TRY" },
      { id: "general", name: "General Admission", price: 450, currency: "TRY" },
      { id: "door", name: "At The Door", price: 550, currency: "TRY" },
    ],
  },
  
  {
    title: "NADIDANE - CATAMARAN SESSIONS",
    description: "The ultimate sea party took over Kuşadası, Aydın, bringing together hundreds of partygoers for an unforgettable experience! Hosted by us, the event was filled with high-energy music, endless dancing, and incredible vibes. Under the shining sun and on the wavy sea, we created memories that will last a lifetime.Missed it? Stay tuned for our next adventure in 2025 summer.",
    imageUrl: "/ourwork/nadidane.jpeg",
    tags: [],
    upcoming: false,
    date: "June 19, 2024",
  },
  {
    "title": "AIROD LIVE AT MILYON PERFORMANCE HALL",
    "description": "On December 13, techno powerhouse AIROD delivered an earth-shattering performance at Milyon Performance Hall, presented by Culter Hot Cage. With a raw, industrial aesthetic and bone-shaking basslines, the event was a sonic explosion that resonated through the crowd. AIROD's signature style, blending deep techno with high-energy rave elements, left the audience in a trance-like state. The event was a landmark night for the electronic music scene, bringing together ravers from all over Turkey for an experience that felt both intimate and cinematic.",
    "imageUrl": "/ourwork/airod.PNG",
    "tags": [],
    "date": "December 13, 2024",
    upcoming: false
  },
  {
    "title": "RED MOON AT JW MARRIOTT",
    "description": "On November 1st, the legendary Red Moon event took over the JW Marriott, transforming it into a dark and atmospheric techno haven. The event, running from 20:00 to 05:00, brought together a lineup of top-tier artists including ARQ, CALYPSOERF, CASTOR, EGEMEN ALPAY, HOFMANN, KCGZ, LEDI CANNIT, and SINN. With a strict Halloween dress code, guests embraced eerie aesthetics and gothic fashion, enhancing the mysterious energy of the night. Red Moon delivered a hauntingly mesmerizing experience that kept the dance floor alive until dawn.",
    "imageUrl": "/ourwork/red.jpeg",
    "tags": [],
    "date": "November 1, 2024",
    upcoming: false
  },
  {
    title: "MAYFEST",
    description: "Pixel Cabin hosted Mayfest Reckoning, a tradition that follows immediately after Mayfest, one of the oldest festivals, on the night of May 3rd, Friday! In this legendary night, featuring students and alumni of Bilkent University, attendees indulged in all genres of electronic music for 10 hours.",
    imageUrl: "/ourwork/mayfest.jpeg",
    tags: [],
    date: "May 3, 2023",
    upcoming: false
  },
  {
    title: "DIVINIA COMMEDIA",
    description: "At the first anniversary of Origins, 'DIVINA COMMEDIA,' where mythology and electronic music merge, was with you. Inspired by the themes of Heaven (Paradiso), Purgatory (Purgatorio), and Hell (Inferno) depicted in Dante's Divine Comedy, we invited you to a post-death travel adventure at Vortex Art Club, where three different concepts would take place on three floors. In this mysterious journey, eight different artists took the stage.",
    imageUrl: "/ourwork/divina.jpeg",
    tags: [],
    date: "April 15, 2023",
    upcoming: false
  },
  {
    "title": "GLOBAL GROOVE RIO",
    "description": "A night of tropical rhythms and vibrant energy, Global Groove Rio brought the spirit of Brazil to the dance floor. With a lineup featuring CASTOR, MIU LENA, and AR4T, attendees were transported to a sonic paradise of pulsating beats and lush visuals. The event's unique dress code, 'Tropical Glow,' encouraged guests to embrace bright colors, tropical prints, and warm tones, reflecting the vibrant energy of Rio. The terrace stage was packed until sunrise, marking another unforgettable night in Origins history.",
    "imageUrl": "/ourwork/rio.jpg",
    "tags": [],
    "date": "March 10, 2023",
    upcoming: false
  },
  {
    "title": "METU GRADUATION PRE-PARTY",
    "description": "Held at A2 Gathering on June 7, this pre-party was the ultimate way for METU graduates to celebrate the end of an era. With an open-air venue at sunset, attendees danced to electrifying sets by Cluster and Salih Cabuk. The event captured the essence of youthful energy, with a visually stunning stage setup, luxury cars surrounding the dance floor, and a golden-hour aesthetic that made for picture-perfect memories. This night cemented itself as a must-attend tradition for METU students, blending music, nostalgia, and an unrelenting party spirit.",
    "imageUrl": "/ourwork/metu.PNG",
    "tags": [],
    "date": "June 7, 2023",
    upcoming: false
  },

  {
    "title": "GLOBAL GROOVE TEHRAN",
    "description": "Taking over Tehran's underground scene, Global Groove Tehran was an immersive night of cultural fusion and deep electronic sounds. The terrace stage featured a standout lineup with GERCEK DORMAN, CASTOR, CALYPSOERF, and B:HAYRI, creating a sonic journey that blended Persian heritage with cutting-edge electronic music. Guests followed a unique 'Persian Patterns' dress code, inspired by traditional carpets and timeless elegance. The event seamlessly merged tradition with the future, offering an unparalleled dance experience in the heart of the city.",
    "imageUrl": "/ourwork/tehran.jpg",
    "tags": [],
    "date": "February 18, 2023",
    upcoming: false
  },
  {
    "title": "FULL ELECTRONIC II",
    "description": "Hosted at The Mug Coffee Co. in TOBB ETÜ, Full Electronic II was an intimate yet electrifying gathering for true electronic music enthusiasts. Featuring a carefully curated lineup including CASTOR, CATZ (AFTER), and SINA, the event blended deep beats with a cozy atmosphere. The visuals created a dreamlike setting, with ethereal projections and hypnotic lighting. Attendees were immersed in a surreal sonic journey that blurred the lines between reality and sound, proving once again that electronic music can thrive in the most unexpected spaces.",
    "imageUrl": "/ourwork/full.PNG",
    "tags": [],
    "date": "January 20, 2023",
    upcoming: false
  },
  
  {
    "title": "DISCO NIGHT AT IF PERFORMANCE HALL",
    "description": "Taking a step back in time, Disco Night on April 2nd at IF Performance Hall was a dazzling tribute to the golden era of disco. Featuring AUF's special disco set alongside CASTOR and SUNTER, the event brought groovy basslines, glittering outfits, and a dance floor packed with nostalgia-fueled energy. The 70s-themed decor, complete with disco balls and psychedelic visuals, created an immersive atmosphere where every guest felt like they had stepped into a Studio 54 dreamscape. A night of pure joy and retro vibes!",
    "imageUrl": "/ourwork/disco.jpeg",
    "tags": [],
    "date": "April 2, 2023",
    upcoming: false
  }
];

export default function EventsPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const { data: remoteProjects, isLoading } = useOurWorkProjects();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

  
  // Get all unique tags - memoized to prevent recalculation
  const projects: ProjectUiModel[] = useMemo(() => {
    if (remoteProjects && remoteProjects.length > 0) {
      return remoteProjects.map(p => ({
        title: p.title,
        description: p.description,
        imageUrl: p.image_url,
        tags: p.tags || [],
        date: p.date || undefined,
        upcoming: p.upcoming,
        // Optional fields if your Supabase table gets extended later
        location: (p as any).location,
        ticketUrl: (p as any).ticket_url,
        tiers: (p as any).tiers,
        formUrl: (p as any).form_url,
        slug: p.slug, // Use the random slug from database
      }))
    }
    return staticProjects
  }, [remoteProjects])

  // Memoize upcoming and past events to avoid recomputation on every render
  const upcomingEvents = useMemo(() => {
    return projects.filter(project => project.upcoming);
  }, [projects]);
  
  const pastEvents = useMemo(() => {
    return projects.filter(project => !project.upcoming);
  }, [projects]);
  
  // Helper function to parse date strings
  const parseDate = (dateStr: string): Date => {
    // Handle "Every Friday" and similar recurring events
    if (dateStr.toLowerCase().includes('every') || dateStr.toLowerCase().includes('weekly')) {
      return new Date('2099-12-31'); // Put recurring events at the top
    }
    
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If parsing fails, return a very old date
    return new Date('1900-01-01');
  };

  // Sort events by date
  const sortedUpcomingEvents = useMemo(() => {
    return upcomingEvents.sort((a, b) => {
      if (a.date && b.date) {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateA.getTime() - dateB.getTime(); // Earliest first for upcoming
      }
      return 0;
    });
  }, [upcomingEvents]);

  const sortedPastEvents = useMemo(() => {
    return pastEvents.sort((a, b) => {
      if (a.date && b.date) {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime(); // Latest first for past
      }
      return 0;
    });
  }, [pastEvents]);

  // Event card component
  const EventCard = ({ project, index, isPast = false }: { project: ProjectUiModel; index: number; isPast?: boolean }) => (
    <motion.div
      key={project.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer h-full"
    >
      <Link 
        href={`/events/${project.slug || generateSlug(project.title)}`}
        onClick={() => setIsNavigating(true)}
      >
        <div className={`glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu hover:scale-105 h-full flex flex-col min-h-[28rem] sm:min-h-[30rem] md:min-h-[32rem] lg:min-h-[34rem] ${isPast ? 'opacity-60' : ''}`}>
          {/* Project Image */}
          <div className="relative h-96 md:h-[26rem] overflow-hidden">
            <img
              src={project.imageUrl}
              alt={project.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isPast ? 'filter grayscale blur-[1px]' : ''}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className={`absolute inset-0 ${isPast ? 'bg-black/40' : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'}`} />
            
            {/* Upcoming marquee strip */}
            {project.upcoming && !isNavigating && (
              <div className="absolute top-0 left-0 right-0 h-10 bg-black/60 border-b border-white/10 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/60 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/60 to-transparent z-10" />
                <div className="flex h-full items-center">
                  <div className="animate-marquee-very-slow whitespace-nowrap flex">
                    {/* First set of text */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={`first-${i}`} className="mx-8 text-lg font-black uppercase tracking-[0.24em] text-white/95 flex-shrink-0">
                        UPCOMING
                        <span className="mx-8 inline-block align-middle text-white/50">•</span>
                      </span>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={`second-${i}`} className="mx-8 text-lg font-black uppercase tracking-[0.24em] text-white/95 flex-shrink-0">
                        UPCOMING
                        <span className="mx-8 inline-block align-middle text-white/50">•</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="p-6 flex flex-col flex-1">
            <h3 className={`text-xl font-semibold mb-1 group-hover:text-white/90 transition-colors line-clamp-2 min-h-[3.25rem] ${isPast ? 'text-gray-400' : 'text-white'}`}>
              {project.title}
            </h3>
            
            {project.date && (
              <div className="flex items-center gap-2 text-gray-400 mb-3">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{project.date}</span>
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-2 text-gray-400 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{project.location}</span>
              </div>
            )}

            <p className={`text-sm line-clamp-2 ${isPast ? 'text-gray-500' : 'text-gray-400'}`}>
              {project.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <div className={`min-h-screen ${isNavigating ? 'navigating' : ''}`}>
        {/* Hero Section */}
        <div className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                Events
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Explore our portfolio of events, where we push the boundaries of sound and visual art to create unique, immersive experiences.
              </p>
            </motion.div>
          </div>
        </div>



        {/* Loading State */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400">Loading events...</p>
            </div>
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!isLoading && (
          <>
            {/* Upcoming Events Section */}
            {sortedUpcomingEvents.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-3xl font-bold text-white mb-4">Upcoming Events</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-white to-gray-400 rounded-full"></div>
                </motion.div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {sortedUpcomingEvents.map((project, index) => (
                    <EventCard key={project.title} project={project} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events Section */}
            {sortedPastEvents.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.03 }}
                  className="mb-8"
                >
                  <h2 className="text-3xl font-bold text-gray-400 mb-4">Past Events</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                </motion.div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {sortedPastEvents.map((project, index) => (
                    <EventCard key={project.title} project={project} index={index} isPast={true} />
                  ))}
                </div>
              </div>
            )}

            {/* No events found */}
            {sortedUpcomingEvents.length === 0 && sortedPastEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">No events found</h3>
                <p className="text-gray-400">Check back soon for upcoming events</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
