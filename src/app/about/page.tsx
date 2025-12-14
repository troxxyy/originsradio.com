'use client'

import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import Navigation from "@/components/Navigation";
import SocialBubbles from "@/components/social/SocialBubbles";
import TeamSection from "@/components/home/TeamSection";
import { Rocket, Users, Radio, Globe, Music, Star, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import NaturalBackground from '@/components/ui/NaturalBackground';

// About page event photos
const aboutImages = [
  '/origins-aboutimage/567949539_18408359101190686_3706084319895230549_n.jpg',
  '/origins-aboutimage/568018821_18408359083190686_6401480919082689231_n.jpg',
  '/origins-aboutimage/568281291_18408359002190686_1332424567133244148_n.jpg',
  '/origins-aboutimage/568406581_18408359056190686_2980302082904075963_n.jpg',
  '/origins-aboutimage/568638018_18408359146190686_1706852911949315753_n.jpg',
  '/origins-aboutimage/568673904_18408359137190686_223340303331738417_n.jpg',
  '/origins-aboutimage/568696680_18408358981190686_6910519163900839445_n.jpg',
  '/origins-aboutimage/568747590_18408359047190686_3590576891216392853_n.jpg',
  '/origins-aboutimage/568906143_18408359011190686_8799830714360297345_n.jpg',
  '/origins-aboutimage/569029709_18408359029190686_2025088144231072466_n.jpg',
  '/origins-aboutimage/569066725_18408359128190686_2614623633597991346_n.jpg',
];

// Floating photo positions - distributed across the page
const photoPositions = [
  { top: '5%', left: '3%', rotate: -12, size: 'w-40 h-56 md:w-52 md:h-72' },
  { top: '8%', right: '5%', rotate: 8, size: 'w-36 h-48 md:w-44 md:h-60' },
  { top: '25%', left: '2%', rotate: 6, size: 'w-32 h-44 md:w-40 md:h-56' },
  { top: '20%', right: '3%', rotate: -15, size: 'w-44 h-60 md:w-56 md:h-76' },
  { top: '45%', left: '4%', rotate: -8, size: 'w-36 h-52 md:w-48 md:h-64' },
  { top: '50%', right: '2%', rotate: 10, size: 'w-40 h-52 md:w-52 md:h-68' },
  { top: '70%', left: '3%', rotate: 14, size: 'w-32 h-44 md:w-44 md:h-60' },
  { top: '68%', right: '4%', rotate: -6, size: 'w-38 h-50 md:w-48 md:h-64' },
  { top: '88%', left: '5%', rotate: -10, size: 'w-36 h-48 md:w-44 md:h-58' },
  { top: '85%', right: '6%', rotate: 12, size: 'w-40 h-56 md:w-52 md:h-72' },
  { top: '110%', left: '4%', rotate: 5, size: 'w-36 h-48 md:w-46 md:h-62' },
];

export default function AboutPage() {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Memoize shuffled images to prevent re-shuffling on re-renders
  const shuffledImages = useMemo(() => {
    return [...aboutImages].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <PageLayout backgroundImage="/about-background.jpg">
      {/* Natural, warm atmospheric background */}
      <NaturalBackground />

      {/* Floating Photos Gallery Background */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden hidden lg:block">
        {shuffledImages.map((src, index) => {
          const pos = photoPositions[index % photoPositions.length];
          return (
            <motion.div
              key={src}
              className={`absolute ${pos.size} rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_40px_rgba(180,140,100,0.1)] border-2 border-white/10 hover:border-amber-400/20`}
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                rotate: pos.rotate,
              }}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ 
                opacity: 0.6,
                scale: 1,
                y: 0,
              }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.15,
                ease: "easeOut"
              }}
              whileHover={{ 
                opacity: 1, 
                scale: 1.08,
                zIndex: 50,
                transition: { duration: 0.3 }
              }}
            >
              {/* Warm gradient overlay for natural cohesive look */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-amber-950/15 to-black/20 z-10" />
              <Image
                src={src}
                alt={`Origins Radio event photo ${index + 1}`}
                fill
                className="object-cover pointer-events-auto cursor-pointer hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 150px, 250px"
                loading="lazy"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Photo Strip - horizontal scrolling gallery */}
      <div className="lg:hidden fixed top-20 left-0 right-0 z-[1] overflow-hidden pointer-events-none">
        <motion.div 
          className="flex gap-4 px-4"
          initial={{ x: 0 }}
          animate={{ x: [0, -1000, 0] }}
          transition={{ 
            duration: 60, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {[...shuffledImages, ...shuffledImages].map((src, index) => (
            <div
              key={`mobile-${index}`}
              className="relative flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10 opacity-40"
              style={{ rotate: `${(index % 2 === 0 ? -1 : 1) * (5 + (index % 3) * 2)}deg` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent z-10" />
              <Image
                src={src}
                alt={`Origins Radio event ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
      
      <SocialBubbles />
      <Navigation />
      
      <motion.div 
        className="container mx-auto px-6 py-32 max-w-6xl relative z-10 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ willChange: "opacity" }}
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-16 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent "
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ willChange: "transform, opacity" }}
        >
          About Origins Radio
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ willChange: "transform, opacity" }}
        >
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-10 hover:border-white/20 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] group relative transform-gpu">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent relative">Our Mission</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed relative">
              Origins Radio is a premier interactive radio station, dedicated to showcasing the rich diversity of music and culture.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed relative">
              We believe in the power of music to connect people, transcend boundaries, and create meaningful experiences. Our mission is to provide a platform for emerging artists, celebrate local talent, and bring innovative sounds to our listeners.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-10 hover:border-white/20 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] group relative transform-gpu">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent relative">Our Story</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed relative">
              Founded in 2023, Origins Radio began as a passion project by a group of music enthusiasts who saw the need for a more diverse and interactive radio experience.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed relative">
              What started as small streaming sessions from a makeshift studio has grown into a communitydriven platform that hosts events, supports local artists, and pushes the boundaries of traditional radio.
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
              <p className="text-gray-300 leading-relaxed">Our listeners don't just tune in they participate. With our interactive 3D visuals , chat with other participants, and be part of the action with AI technologies.</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors duration-300 border border-transparent hover:border-white/10 hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.2)]">
              <h3 className="text-2xl font-semibold mb-4">Local Focus</h3>
              <p className="text-gray-300 leading-relaxed">We're deeply committed to the music scene, providing a platform for local artists to reach new audiences.</p>
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
              className="p-2 rounded-xl glass backdrop-blur-sm text-white/90 font-medium border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <ChevronDown className="w-6 h-6 text-white opacity-80" />
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
            Origins Radio is more than just a radio station, it's a community of music lovers, creators, and innovators. We invite you to be part of our journey.
          </p>
          <a href="mailto:ben@sinacetinkaya.com">
            <motion.button 
              className="px-12 py-5 glass backdrop-blur-sm text-white/90 font-medium border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ willChange: "transform" }}
            >
              Get Involved
            </motion.button>
          </a>
        </motion.div>
    </PageLayout>
  );
} 