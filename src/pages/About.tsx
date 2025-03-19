import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import Navigation from "@/components/Navigation";
import SocialBubbles from "@/components/social/SocialBubbles";
import TeamSection from "@/components/home/TeamSection";

const About = () => {
  return (
    <PageLayout>
      <SocialBubbles />
      <Navigation />
      
      <motion.div 
        className="container mx-auto px-6 py-32 max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-16 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          About Origins Radio
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-10 hover:border-white/20 transition-colors duration-300">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Our Mission</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Origins Radio is Ankara's premier interactive radio station, dedicated to showcasing the rich diversity of music and culture in our city and beyond.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              We believe in the power of music to connect people, transcend boundaries, and create meaningful experiences. Our mission is to provide a platform for emerging artists, celebrate local talent, and bring innovative sounds to our listeners.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-10 hover:border-white/20 transition-colors duration-300">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Our Story</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Founded in 2023, Origins Radio began as a passion project by a group of music enthusiasts who saw the need for a more diverse and interactive radio experience in Ankara.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              What started as small streaming sessions from a makeshift studio has grown into a community-driven platform that hosts events, supports local artists, and pushes the boundaries of traditional radio.
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-12 mb-24"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-6 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors duration-300">
              <h3 className="text-2xl font-semibold mb-4">Interactive Experience</h3>
              <p className="text-gray-300 leading-relaxed">Our listeners don't just tune in—they participate. From song requests to live chats with DJs, we create a two-way conversation.</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors duration-300">
              <h3 className="text-2xl font-semibold mb-4">Local Focus</h3>
              <p className="text-gray-300 leading-relaxed">We're deeply committed to Ankara's music scene, providing a platform for local artists to reach new audiences.</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors duration-300">
              <h3 className="text-2xl font-semibold mb-4">Genre Diversity</h3>
              <p className="text-gray-300 leading-relaxed">From electronic to jazz, hip-hop to classical, we celebrate the full spectrum of musical expression.</p>
            </div>
          </div>
        </motion.div>
           {/* Team Section */}
           <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <TeamSection />
        </motion.div>
      </motion.div>
        
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Join Our Community</h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Origins Radio is more than just a radio station—it's a community of music lovers, creators, and innovators. We invite you to be part of our journey.
          </p>
          <motion.button 
            className="px-12 py-5 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-xl hover:from-gray-200 hover:to-white transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Involved
          </motion.button>
        </motion.div>

     
    </PageLayout>
  );
};

export default About;
