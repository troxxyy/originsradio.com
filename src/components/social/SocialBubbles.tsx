import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaYoutube, FaInstagram, FaSoundcloud } from "react-icons/fa";

const SocialBubbles = () => {
  // State for random positions
  const [positions, setPositions] = useState({
    youtube: { top: "15%", left: "8%" },
    instagram: { top: "65%", right: "12%" },
    soundcloud: { top: "30%", right: "20%" }
  });

  // State to track popping animations
  const [poppingState, setPoppingState] = useState({
    youtube: false,
    instagram: false,
    soundcloud: false
  });

  // Generate random positions on component mount
  useEffect(() => {
    const generateRandomPositions = () => {
      // Define safe zones for each bubble to avoid overlapping with content
      // YouTube - left side of the screen
      const youtubeTopOptions = ["15%", "25%", "35%"];
      const youtubeLeftOptions = ["5%", "8%", "12%"];
      const youtubeTop = youtubeTopOptions[Math.floor(Math.random() * youtubeTopOptions.length)];
      const youtubeLeft = youtubeLeftOptions[Math.floor(Math.random() * youtubeLeftOptions.length)];
      
      // Instagram - right side of the screen
      const instagramTopOptions = ["60%", "65%", "70%"];
      const instagramRightOptions = ["8%", "12%", "15%"];
      const instagramTop = instagramTopOptions[Math.floor(Math.random() * instagramTopOptions.length)];
      const instagramRight = instagramRightOptions[Math.floor(Math.random() * instagramRightOptions.length)];
      
      // SoundCloud - top right area
      const soundcloudTopOptions = ["20%", "25%", "30%"];
      const soundcloudRightOptions = ["15%", "20%", "25%"];
      const soundcloudTop = soundcloudTopOptions[Math.floor(Math.random() * soundcloudTopOptions.length)];
      const soundcloudRight = soundcloudRightOptions[Math.floor(Math.random() * soundcloudRightOptions.length)];
      
      setPositions({
        youtube: { top: youtubeTop, left: youtubeLeft },
        instagram: { top: instagramTop, right: instagramRight },
        soundcloud: { top: soundcloudTop, right: soundcloudRight }
      });
    };
    
    generateRandomPositions();
  }, []);

  // Handle bubble pop and navigation
  const handleBubblePop = (platform, url) => {
    setPoppingState(prev => ({ ...prev, [platform]: true }));
    
    // Navigate after animation completes
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      // Reset popping state after redirection
      setPoppingState(prev => ({ ...prev, [platform]: false }));
    }, 800);
  };

  // Create radiating lines
  const RadiatingLines = ({ color }) => {
    const lines = Array(12).fill(null);
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {lines.map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-12 bg-white bg-opacity-90"
            style={{
              height: '4px',
              transformOrigin: 'center',
              rotate: `${index * 30}deg`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 8,
              transition: { duration: 0.4, delay: 0.2 }
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed z-20 flex hidden md:block">
      <AnimatePresence>
        {!poppingState.youtube && (
          <motion.div 
            className="w-28 h-28 rounded-full glass-social flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow fixed cursor-pointer overflow-hidden"
            style={{ top: positions.youtube.top, left: positions.youtube.left }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              x: [0, 30, 0, -30, 0],
              rotate: [0, 5, 0, -5, 0],
              transition: { 
                y: { duration: 0.5 },
                opacity: { duration: 0.5 },
                x: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" }
              }
            }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            onClick={() => handleBubblePop('youtube', 'https://www.youtube.com/@originsradiotr')}
          >
            <FaYoutube size={56} className="text-white" />
          </motion.div>
        )}
        {poppingState.youtube && (
          <motion.div
            className="w-28 h-28 rounded-full fixed"
            style={{ top: positions.youtube.top, left: positions.youtube.left }}
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.2, 0], 
              transition: { duration: 0.5, times: [0, 0.2, 1] }
            }}
          >
            <RadiatingLines color="red" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!poppingState.instagram && (
          <motion.div
            className="w-28 h-28 rounded-full glass-social flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow fixed cursor-pointer overflow-hidden"
            style={{ top: positions.instagram.top, right: positions.instagram.right }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              y: [0, 40, 0, -40, 0],
              rotate: [0, -5, 0, 5, 0],
              transition: { 
                x: { duration: 0.5 },
                opacity: { duration: 0.5 },
                y: { repeat: Infinity, duration: 8, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" }
              }
            }}
            whileHover={{ rotate: -10, scale: 1.1 }}
            onClick={() => handleBubblePop('instagram', 'https://www.instagram.com/origins.radio/')}
          >
            <FaInstagram size={56} className="text-white" />
          </motion.div>
        )}
        {poppingState.instagram && (
          <motion.div
            className="w-28 h-28 rounded-full fixed"
            style={{ top: positions.instagram.top, right: positions.instagram.right }}
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.2, 0], 
              transition: { duration: 0.5, times: [0, 0.2, 1] }
            }}
          >
            <RadiatingLines color="purple" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!poppingState.soundcloud && (
          <motion.div 
            className="w-28 h-28 rounded-full glass-social flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow fixed cursor-pointer overflow-hidden"
            style={{ top: positions.soundcloud.top, right: positions.soundcloud.right }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              x: [0, -40, 0, 40, 0],
              rotate: [0, 7, 0, -7, 0],
              transition: { 
                y: { duration: 0.5 },
                opacity: { duration: 0.5 },
                x: { repeat: Infinity, duration: 10, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 10, ease: "easeInOut" }
              }
            }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            onClick={() => handleBubblePop('soundcloud', 'https://on.soundcloud.com/RAQQfrZ27sD539NXA')}
          >
            <FaSoundcloud size={56} className="text-white" />
          </motion.div>
        )}
        {poppingState.soundcloud && (
          <motion.div
            className="w-28 h-28 rounded-full fixed"
            style={{ top: positions.soundcloud.top, right: positions.soundcloud.right }}
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.2, 0], 
              transition: { duration: 0.5, times: [0, 0.2, 1] }
            }}
          >
            <RadiatingLines color="orange" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialBubbles; 