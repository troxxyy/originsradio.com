import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Instagram, Cloud, Heart } from "lucide-react";

const SocialBubbles = () => {
  // State to track popping animations
  const [poppingState, setPoppingState] = useState({
    youtube: false,
    instagram: false,
    soundcloud: false,
    coffee: false
  });

  // Handle bubble pop and navigation
  const handleBubblePop = (platform, url) => {
    setPoppingState(prev => ({ ...prev, [platform]: true }));
    
    // Navigate after animation completes
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      // Reset popping state after redirection
      setPoppingState(prev => ({ ...prev, [platform]: false }));
    }, 600);
  };

  // Create radiating lines
  const RadiatingLines = ({ color }) => {
    const lines = Array(12).fill(null);
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {lines.map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-8 bg-white bg-opacity-90"
            style={{
              height: '3px',
              transformOrigin: 'center',
              rotate: `${index * 30}deg`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 6, 0],
              transition: { duration: 0.6, delay: 0.1 }
            }}
          />
        ))}
      </div>
    );
  };

  const socialBubbles = [
    {
      key: 'youtube',
      icon: Youtube,
      url: 'https://www.youtube.com/@originsradiotr',
      color: 'red'
    },
    {
      key: 'instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/origins.radio/',
      color: 'purple'
    },
    {
      key: 'soundcloud',
      icon: Cloud,
      url: 'https://on.soundcloud.com/RAQQfrZ27sD539NXA',
      color: 'orange'
    },
    {
      key: 'coffee',
      icon: Heart,
      url: 'https://nowpayments.io/payment/?iid=5015396769&source=button',
      color: 'red'
    }
  ];

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[50] pointer-events-none">
      <div className="flex items-center gap-4">
        {socialBubbles.map((bubble) => {
          const IconComponent = bubble.icon;
          const isPopping = poppingState[bubble.key];
          
          return (
            <div key={bubble.key} className="relative w-16 h-16 flex items-center justify-center">
              <AnimatePresence>
                {!isPopping && (
                  <motion.div 
                    className="w-16 h-16 rounded-full glass-social flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow cursor-pointer overflow-hidden pointer-events-auto absolute"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ 
                      y: [0, -5, 0, 5, 0],
                      opacity: 1,
                      transition: { 
                        y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                        opacity: { duration: 0.5 }
                      }
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    onClick={() => handleBubblePop(bubble.key, bubble.url)}
                  >
                    <IconComponent size={32} className="text-white" />
                  </motion.div>
                )}
                {isPopping && (
                  <motion.div
                    className="w-16 h-16 rounded-full absolute top-0 left-0"
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: [1, 1.3, 0], 
                      transition: { duration: 0.5, times: [0, 0.2, 1] }
                    }}
                  >
                    <RadiatingLines color={bubble.color} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialBubbles; 