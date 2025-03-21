import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";

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
    upcoming: true,
    date: "March 28, 2025",
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
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Refs for scroll animations
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect values
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
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
  
  // Filter projects based on active tag and section - memoized
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
    
    // Then filter by tag if one is selected
    return activeTag ? filtered.filter(project => project.tags.includes(activeTag)) : filtered;
  }, [activeSection, activeTag, upcomingEvents, pastEvents, projects]);

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
  
  // Project card component - extracted to reduce re-renders
  const ProjectCard = ({ project, index }: { project: Project, index: number }) => (
    <motion.div
      key={project.title}
      layout={false} // Disable layout animations for better performance
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.05, 0.3), // Cap delay at 0.3s and reduce individual delay
      }}
      className="bg-zinc-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 cursor-pointer group relative"
      onClick={() => openProjectDetails(project)}
      whileHover={{ 
        y: -10,
        boxShadow: "0 10px 30px -15px rgba(255, 255, 255, 0.2)"
      }}
    >
      {project.title.includes("Pixel Ankara") && (
        <div className="absolute top-0 left-0 right-0 z-10 overflow-hidden whitespace-nowrap bg-gradient-to-r from-black via-zinc-900 to-black text-white font-bold py-2 shadow-lg border-y border-white/10">
          <div className="animate-marquee inline-block">
            <span className="text-white px-4 py-1 font-medium text-sm">• EVERY FRIDAY • </span>
            <span className="text-white px-4 py-1 font-medium text-sm">• EVERY FRIDAY • </span>
            <span className="text-white px-4 py-1 font-medium text-sm">• EVERY FRIDAY • </span>
            <span className="text-white px-4 py-1 font-medium text-sm">• EVERY FRIDAY • </span>
            <span className="text-white px-4 py-1 font-medium text-sm">• EVERY FRIDAY • </span>
          </div>
        </div>
      )}
      
      {/* Upcoming event badge */}
      {project.upcoming && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          UPCOMING
        </div>
      )}
      
      <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-semibold group-hover:text-white transition-colors duration-300">{project.title}</h3>
        </div>
        
        {project.date && (
          <div className="mb-4 text-sm font-medium text-gray-400">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {project.date}
            </span>
          </div>
        )}
        
        <p className="text-gray-400 mb-6 text-lg line-clamp-3 group-hover:text-gray-300 transition-colors duration-300">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleTagClick(tag);
              }}
              className={`px-4 py-1.5 backdrop-blur-sm rounded-full text-sm border border-white/5 transition-colors duration-300 cursor-pointer hover:bg-white/10 ${
                activeTag === tag 
                  ? "bg-white/20 text-white" 
                  : "bg-zinc-800/50 text-gray-300"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      {/* Parallax background */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-fixed z-0"
        style={{
          backgroundImage: 'url("public/backgr.jpg")',
          y: backgroundY
        }}
      />
      <div className="absolute inset-0 bg-black/70 z-0" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="w-full max-w-7xl mx-auto relative z-10"
      >
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Our Work</h1>
          <p className="text-xl text-gray-400 max-w-3xl">
            Explore our portfolio of events, where we push the boundaries
            of sound and visual art to create unique, immersive experiences.
          </p>
        </motion.div>

        {/* Section filtering */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-6 py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
              activeSection === 'all' 
                ? "bg-white text-black" 
                : "bg-zinc-800/70 text-gray-300 hover:bg-zinc-700/70"
            }`}
          >
            All Events
          </button>
          
          <button
            onClick={() => setActiveSection('upcoming')}
            className={`px-6 py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
              activeSection === 'upcoming' 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                : "bg-zinc-800/70 text-gray-300 hover:bg-zinc-700/70"
            }`}
          >
            Upcoming Events
          </button>
          
          <button
            onClick={() => setActiveSection('past')}
            className={`px-6 py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
              activeSection === 'past' 
                ? "bg-gradient-to-r from-zinc-700 to-zinc-500 text-white" 
                : "bg-zinc-800/70 text-gray-300 hover:bg-zinc-700/70"
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Tag filtering */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
              activeTag === null 
                ? "bg-white text-black font-medium" 
                : "bg-zinc-800/50 text-gray-300 hover:bg-zinc-700/50"
            }`}
          >
            All
          </button>
          
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                activeTag === tag 
                  ? "bg-white text-black font-medium" 
                  : "bg-zinc-800/50 text-gray-300 hover:bg-zinc-700/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Show title for the current section - only animate once mounted, not on every filter change */}
        {activeSection === 'upcoming' && (
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
            Upcoming <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Events</span>
          </h2>
        )}
        
        {activeSection === 'past' && (
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
            Past <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-white">Events</span>
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 mb-32">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </AnimatePresence>
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
                className="bg-zinc-900 rounded-xl overflow-hidden max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative bg-zinc-800">
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
                    <h2 className="text-3xl md:text-4xl font-bold">{selectedProject.title}</h2>
                    {selectedProject.date && (
                      <div className="text-md font-medium text-gray-400">
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
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
                        className="px-4 py-2 bg-zinc-800 rounded-full text-sm text-gray-300 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <motion.button 
                      onClick={closeProjectDetails}
                      className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
      </motion.div>
    </div>
  );
};

export default OurWork; 