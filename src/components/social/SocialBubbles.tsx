import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaYoutube, FaInstagram, FaSoundcloud } from "react-icons/fa";

const SocialBubbles = () => {
  // State for random positions
  const [positions, setPositions] = useState({
    youtube: { top: "15%", left: "8%" },
    instagram: { top: "65%", right: "12%" },
    soundcloud: { top: "30%", right: "20%" }
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

  return (
    <div className="fixed z-20 flex hidden md:block">
      <motion.a 
        href="https://youtube.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-28 h-28 rounded-full glass-social flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow fixed"
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
      >
        <FaYoutube size={56} className="text-white" />
      </motion.a>
      <motion.a 
        href="https://instagram.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-28 h-28 rounded-full glass-social flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow fixed"
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
      >
        <FaInstagram size={56} className="text-white" />
      </motion.a>
      <motion.a 
        href="https://soundcloud.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-28 h-28 rounded-full glass-social flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow fixed"
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
      >
        <FaSoundcloud size={56} className="text-white" />
      </motion.a>
    </div>
  );
};

export default SocialBubbles; 