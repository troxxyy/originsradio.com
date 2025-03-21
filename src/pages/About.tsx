import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import Navigation from "@/components/Navigation";
import SocialBubbles from "@/components/social/SocialBubbles";
import TeamSection from "@/components/home/TeamSection";
import { Rocket, Users, Radio, Globe, Music, Star, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const About = () => {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout backgroundImage="/about-background.jpg">
      {/* Simplified static background gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30"></div>
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-blue-600/10 to-cyan-600/10 blur-3xl transform-gpu"></div>
        <div className="absolute left-0 top-0 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-indigo-600/10 to-purple-600/10 blur-3xl transform-gpu"></div>
      </div>
      
      <SocialBubbles />
      <Navigation />
      
      <motion.div 
        className="container mx-auto px-6 py-32 max-w-6xl relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ willChange: "opacity" }}
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-16 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ willChange: "transform, opacity" }}
        >
          About Origins Radio
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ willChange: "transform, opacity" }}
        >
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-10 hover:border-white/20 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] group relative transform-gpu">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent relative">Our Mission</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed relative">
              Origins Radio is Ankara's premier interactive radio station, dedicated to showcasing the rich diversity of music and culture in our city and beyond.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed relative">
              We believe in the power of music to connect people, transcend boundaries, and create meaningful experiences. Our mission is to provide a platform for emerging artists, celebrate local talent, and bring innovative sounds to our listeners.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-10 hover:border-white/20 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] group relative transform-gpu">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent relative">Our Story</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed relative">
              Founded in 2023, Origins Radio began as a passion project by a group of music enthusiasts who saw the need for a more diverse and interactive radio experience in Ankara.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed relative">
              What started as small streaming sessions from a makeshift studio has grown into a community-driven platform that hosts events, supports local artists, and pushes the boundaries of traditional radio.
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-12 mb-24 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-500 relative transform-gpu"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ willChange: "transform, opacity" }}
        >
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-6 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors duration-300 border border-transparent hover:border-white/10 hover:shadow-[0_10px_25px_-5px_rgba(139,92,246,0.2)]">
              <h3 className="text-2xl font-semibold mb-4">Interactive Experience</h3>
              <p className="text-gray-300 leading-relaxed">Our listeners don't just tune in—they participate. With our interactive 3D visuals , chat with other participants, and be part of the action with AI technologies.</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors duration-300 border border-transparent hover:border-white/10 hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.2)]">
              <h3 className="text-2xl font-semibold mb-4">Local Focus</h3>
              <p className="text-gray-300 leading-relaxed">We're deeply committed to Ankara's music scene, providing a platform for local artists to reach new audiences.</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors duration-300 border border-transparent hover:border-white/10 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.2)]">
              <h3 className="text-2xl font-semibold mb-4">Genre Diversity</h3>
              <p className="text-gray-300 leading-relaxed">From EDM to DNB, House to Hardstyle, we celebrate the full spectrum of musical expression.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

        {/* Roadmap Section */}
        <motion.div 
          className="mb-24 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ willChange: "transform, opacity" }}
        >
          <motion.button
            onClick={() => setIsRoadmapOpen(!isRoadmapOpen)}
            className="w-full flex flex-col items-center gap-4 mb-8 group"
          >
            <h2 className="text-6xl font-bold text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Our Journey <br />
              <span className="text-gray-400 text-xl">
                Press here to see our roadmap
              </span>
            </h2>
            <motion.div
              animate={{ rotate: isRoadmapOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {isRoadmapOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="relative pt-8">
                  {/* Vertical line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-400/30 via-blue-400/20 to-cyan-400/10" />
                  
                  {/* Timeline items - using transform-gpu for better performance */}
                  <div className="space-y-16">
                    <motion.div 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true, amount: 0.3 }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <div className="w-[45%] pr-8 text-right">
                        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transform-gpu">
                          <h3 className="text-2xl font-bold mb-2"> April 2025 - Launch</h3>
                          <p className="text-gray-300">Origins Radio begins broadcasting from the new website.</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                          <Rocket className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="w-[45%] pl-8" />
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true, amount: 0.3 }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <div className="w-[45%] pr-8" />
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="w-[45%] pl-8">
                        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transform-gpu">
                          <h3 className="text-2xl font-bold mb-2">July 2025 - Community Growth</h3>
                          <p className="text-gray-300">Reaching our first 10000 participants with community events</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true, amount: 0.3 }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <div className="w-[45%] pr-8 text-right">
                        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transform-gpu">
                          <h3 className="text-2xl font-bold mb-2">October 2025 - Digital Evolution🚀 </h3>
                          <p className="text-gray-300">Launching our interactive web platform with Ticket System and Mobile apps</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="w-[45%] pl-8" />
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true, amount: 0.3 }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <div className="w-[45%] pr-8" />
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.5)]">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="w-[45%] pl-8">
                        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transform-gpu">
                          <h3 className="text-2xl font-bold mb-2">January 2026 - Artist Platform</h3>
                          <p className="text-gray-300">Introducing our artist collaboration platform for all users.</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true, amount: 0.3 }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <div className="w-[45%] pr-8 text-right">
                        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transform-gpu">
                          <h3 className="text-2xl font-bold mb-2">June 2026 - Future Vision</h3>
                          <p className="text-gray-300">Expanding to multiple cities and launching our biggest music festival</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="w-[45%] pl-8" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

         {/* Team Section */}
         <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ willChange: "transform, opacity" }}
          className="container mx-auto px-6 max-w-7xl relative z-10"
        >
          <TeamSection />
        </motion.div>

        <motion.div 
          className="container mx-auto px-6 text-center mb-12 max-w-7xl mt-36 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ willChange: "transform, opacity" }}
        >
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Join Our Community</h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Origins Radio is more than just a radio station—it's a community of music lovers, creators, and innovators. We invite you to be part of our journey.
          </p>
          <motion.button 
            className="px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ willChange: "transform" }}
          >
            Get Involved
          </motion.button>
        </motion.div>
    </PageLayout>
  );
};

export default About;
