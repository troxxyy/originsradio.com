import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Filter, Calendar, Star, MapPin } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  date?: string; // Add date for sorting events
  upcoming?: boolean; // Flag for upcoming events
}

const projects: Project[] = [
  {
    title: "PIXEL ANKARA EVERY FRIDAY ORIGINS EXCLUSIVE EVENTS",
    description: "Every Friday, we transform Pixel Ankara into an electrifying hub of electronic music and cutting-edge visuals. Our weekly ritual brings together the best local and international talents, creating an immersive atmosphere where music, light, and energy converge. Each Friday presents a unique theme and sonic journey, making it Ankara's most anticipated weekly electronic music event. Join us as we push the boundaries of nightlife culture with state-of-the-art sound systems and mesmerizing visual productions.",
    imageUrl: "/ourwork/pixel.jpeg",
    tags: ["Weekly Event", "Electronic Music", "Visual", ],
    upcoming: true,
    date: "Every Friday",
  },
  {
    title: "ORIGINSRADIO PRESENTS: ECZODIA",
    description: "Experience the powerful sonic journey of ECZODIA, a rising DJ/producer who masterfully blends Trance, Rave, and Hard Techno. Having cut his teeth in the world of Hardmusic, ECZODIA now focuses on the Techno aesthetic with a versatile approach to the genre. Drawing influences from both English and Dutch electronic music cultures, ECZODIA brings an unmistakable energy that has already landed him on the prestigious Boiler Room stage. With a future performance at Tomorrowland on the horizon, this is your chance to witness one of the most exciting rising names in the scene before global dominance.",
    imageUrl: "/ourwork/eczo1.png",
    tags: ["Electronic Music", "Techno", "Live Performance"],
    date: "March 28, 2024",
  },
  
  {
    title: "NADIDANE - CATAMARAN SESSIONS",
    description: "The ultimate sea party took over Kuşadası, Aydın, bringing together hundreds of partygoers for an unforgettable experience! Hosted by us, the event was filled with high-energy music, endless dancing, and incredible vibes. Under the shining sun and on the wavy sea, we created memories that will last a lifetime.Missed it? Stay tuned for our next adventure in 2025 summer.",
    imageUrl: "/ourwork/nadidane.jpeg",
    tags: [, "Visual", "Interactive"],
    upcoming: false,
    date: "June 19, 2024",
  },
  {
    "title": "AIROD LIVE AT MILYON PERFORMANCE HALL",
    "description": "On December 13, techno powerhouse AIROD delivered an earth-shattering performance at Milyon Performance Hall, presented by Culter Hot Cage. With a raw, industrial aesthetic and bone-shaking basslines, the event was a sonic explosion that resonated through the crowd. AIROD's signature style, blending deep techno with high-energy rave elements, left the audience in a trance-like state. The event was a landmark night for the Ankara electronic music scene, bringing together ravers from all over Turkey for an experience that felt both intimate and cinematic.",
    "imageUrl": "/ourwork/airod.PNG",
    "tags": ["Live Performance" , "Collaboration"],
    "date": "December 13, 2024"
  },
  {
    "title": "RED MOON AT JW MARRIOTT",
    "description": "On November 1st, the legendary Red Moon event took over the JW Marriott, transforming it into a dark and atmospheric techno haven. The event, running from 20:00 to 05:00, brought together a lineup of top-tier artists including ARQ, CALYPSOERF, CASTOR, EGEMEN ALPAY, HOFMANN, KCGZ, LEDI CANNIT, and SINN. With a strict Halloween dress code, guests embraced eerie aesthetics and gothic fashion, enhancing the mysterious energy of the night. Red Moon delivered a hauntingly mesmerizing experience that kept the dance floor alive until dawn.",
    "imageUrl": "/ourwork/red.jpeg",
    "tags": ["Installation","Interactive"],
    "date": "November 1, 2024"
  },
  {
    title: "MAYFEST",
    description: "Pixel Cabin hosted Mayfest Reckoning, a tradition that follows immediately after Mayfest, one of Ankara's oldest festivals, on the night of May 3rd, Friday! In this legendary night, featuring students and alumni of Bilkent University, attendees indulged in all genres of electronic music for 10 hours.",
    imageUrl: "/ourwork/mayfest.jpeg",
    tags: ["Installation", "Sound Design"],
    date: "May 3, 2023"
  },
  {
    title: "DIVINIA COMMEDIA",
    description: "At the first anniversary of Origins, 'DIVINA COMMEDIA,' where mythology and electronic music merge, was with you. Inspired by the themes of Heaven (Paradiso), Purgatory (Purgatorio), and Hell (Inferno) depicted in Dante's Divine Comedy, we invited you to a post-death travel adventure at Vortex Art Club, where three different concepts would take place on three floors. In this mysterious journey, eight different artists took the stage.",
    imageUrl: "/ourwork/divina.jpeg",
    tags: ["Music", "Collaboration"],
    date: "April 15, 2023"
  },
  {
    "title": "GLOBAL GROOVE RIO",
    "description": "A night of tropical rhythms and vibrant energy, Global Groove Rio brought the spirit of Brazil to the dance floor. With a lineup featuring CASTOR, MIU LENA, and AR4T, attendees were transported to a sonic paradise of pulsating beats and lush visuals. The event's unique dress code, 'Tropical Glow,' encouraged guests to embrace bright colors, tropical prints, and warm tones, reflecting the vibrant energy of Rio. The terrace stage was packed until sunrise, marking another unforgettable night in Origins history.",
    "imageUrl": "/ourwork/rio.jpg",
    "tags": ["Music"],
    "date": "March 10, 2023"
  },
  {
    "title": "METU GRADUATION PRE-PARTY",
    "description": "Held at A2 Gathering on June 7, this pre-party was the ultimate way for METU graduates to celebrate the end of an era. With an open-air venue at sunset, attendees danced to electrifying sets by Cluster and Salih Cabuk. The event captured the essence of youthful energy, with a visually stunning stage setup, luxury cars surrounding the dance floor, and a golden-hour aesthetic that made for picture-perfect memories. This night cemented itself as a must-attend tradition for METU students, blending music, nostalgia, and an unrelenting party spirit.",
    "imageUrl": "/ourwork/metu.PNG",
    "tags": ["Live Performance"],
    "date": "June 7, 2023"
  },

  {
    "title": "GLOBAL GROOVE TEHRAN",
    "description": "Taking over Tehran's underground scene, Global Groove Tehran was an immersive night of cultural fusion and deep electronic sounds. The terrace stage featured a standout lineup with GERCEK DORMAN, CASTOR, CALYPSOERF, and B:HAYRI, creating a sonic journey that blended Persian heritage with cutting-edge electronic music. Guests followed a unique 'Persian Patterns' dress code, inspired by traditional carpets and timeless elegance. The event seamlessly merged tradition with the future, offering an unparalleled dance experience in the heart of the city.",
    "imageUrl": "/ourwork/tehran.jpg",
    "tags": ["Electronic Music"],
    "date": "February 18, 2023"
  },
  {
    "title": "FULL ELECTRONIC II",
    "description": "Hosted at The Mug Coffee Co. in TOBB ETÜ, Full Electronic II was an intimate yet electrifying gathering for true electronic music enthusiasts. Featuring a carefully curated lineup including CASTOR, CATZ (AFTER), and SINA, the event blended deep beats with a cozy atmosphere. The visuals created a dreamlike setting, with ethereal projections and hypnotic lighting. Attendees were immersed in a surreal sonic journey that blurred the lines between reality and sound, proving once again that electronic music can thrive in the most unexpected spaces.",
    "imageUrl": "/ourwork/full.PNG",
    "tags": ["Electronic Music"],
    "date": "January 20, 2023"
  },
  
  {
    "title": "DISCO NIGHT AT IF PERFORMANCE HALL",
    "description": "Taking a step back in time, Disco Night on April 2nd at IF Performance Hall was a dazzling tribute to the golden era of disco. Featuring AUF's special disco set alongside CASTOR and SUNTER, the event brought groovy basslines, glittering outfits, and a dance floor packed with nostalgia-fueled energy. The 70s-themed decor, complete with disco balls and psychedelic visuals, created an immersive atmosphere where every guest felt like they had stepped into a Studio 54 dreamscape. A night of pure joy and retro vibes!",
    "imageUrl": "/ourwork/disco.jpeg",
    "tags": ["Live Performance" , "Installation"],
    "date": "April 2, 2023"
  }
];

const OurWork = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

  
  // Get all unique tags - memoized to prevent recalculation
  const allTags = useMemo(() => 
    Array.from(new Set(projects.flatMap(project => project.tags))),
    []
  );
  
  // Memoize upcoming and past events to avoid recomputation on every render
  const upcomingEvents = useMemo(() => 
    projects.filter(project => project.upcoming),
    []
  );
  
  const pastEvents = useMemo(() => 
    projects.filter(project => !project.upcoming),
    []
  );
  
  // Filter projects based on active tag, section, and search - memoized
  const filteredProjects = useMemo(() => {
    let filtered;
    
    // Apply section filter first - use pre-computed arrays when possible
    if (activeSection === 'upcoming') {
      filtered = upcomingEvents;
    } else if (activeSection === 'past') {
      filtered = pastEvents;
    } else {
      filtered = projects;
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Then filter by tag if one is selected
    return activeTag ? filtered.filter(project => project.tags.includes(activeTag)) : filtered;
  }, [activeSection, activeTag, searchTerm, upcomingEvents, pastEvents, projects]);

  // Debug logging to troubleshoot filter issues
  useEffect(() => {
    console.log("Active tag:", activeTag);
    console.log("Filtered projects:", filteredProjects.length);
  }, [activeTag, filteredProjects]);

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    document.body.style.overflow = "hidden";
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    document.body.style.overflow = "auto";
  };

  // Tag button click handler with explicit state update
  const handleTagClick = (tag: string) => {
    if (tag === activeTag) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
    }
  };
  


  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen">
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
                Our Work
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Explore our portfolio of events, where we push the boundaries of sound and visual art to create unique, immersive experiences.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                />
              </div>

              {/* Section Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value as 'all' | 'upcoming' | 'past')}
                  className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all appearance-none cursor-pointer"
                  aria-label="Filter by event type"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming Events</option>
                  <option value="past">Past Events</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tag filtering */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                activeTag === null 
                  ? "bg-white/20 border-white/30 text-white" 
                  : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/15 hover:border-white/25"
              } border`}
            >
              All Tags
            </button>
            
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 border ${
                  activeTag === tag 
                    ? "bg-white/20 border-white/30 text-white" 
                    : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/15 hover:border-white/25"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No events found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => openProjectDetails(project)}
                  className="group cursor-pointer"
                >
                  <div className="glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu hover:scale-105">
                    {/* Project Image */}
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Upcoming Badge */}
                      {project.upcoming && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Upcoming
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="p-8">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                        {project.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{project.date}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20">
                            +{project.tags.length - 2} more
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Project Details Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div 
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProjectDetails}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ 
                  type: "spring",
                  damping: 30,
                  stiffness: 500
                }}
                className="glass backdrop-blur-sm rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <motion.img 
                    src={selectedProject.imageUrl} 
                    alt={selectedProject.title} 
                    className="w-full object-contain max-h-[70vh] mx-auto"
                    initial={{ scale: 1.1, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Upcoming badge in modal */}
                  {selectedProject.upcoming && (
                    <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
                      UPCOMING EVENT
                    </div>
                  )}
                  
                  <motion.button 
                    onClick={closeProjectDetails}
                    className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Close project details"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                <motion.div 
                  className="p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedProject.title}</h2>
                    {selectedProject.date && (
                      <div className="text-md font-medium text-gray-400">
                        <span className="inline-flex items-center">
                          <Calendar className="h-5 w-5 mr-2" />
                          {selectedProject.date}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-lg mb-8">{selectedProject.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-white/10 rounded-full text-sm text-white/80 border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <motion.button 
                      onClick={closeProjectDetails}
                      className="px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default OurWork; 