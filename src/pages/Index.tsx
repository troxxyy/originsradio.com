import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SocialBubbles from "@/components/social/SocialBubbles";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/UpNext";
import MusicPlayer from "@/components/music/MusicPlayer";
import ThreeMusicPlayer from "../components/music/ThreeMusicPlayer";
import Navigation from "@/components/Navigation";
import { Wand2 } from "lucide-react";

const Index = () => {
  const [showThreePlayer, setShowThreePlayer] = useState(false);
  const [isVisualizationEnabled, setIsVisualizationEnabled] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Delay loading the ThreeMusicPlayer to improve initial page load performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowThreePlayer(true);
    }, 5);

    return () => {
      clearTimeout(timer);
      setShowThreePlayer(false);
    };
  }, []);

  const toggleVisualization = () => {
    setIsVisualizationEnabled(!isVisualizationEnabled);
  };

  return (
    <PageLayout>
      {/* Social Media Floating Bubbles */}
      <SocialBubbles />
      <Navigation />
      {/* Logo section */}
      <Hero 
        title="originsradio"
        subtitle="Ankara's interactive radio station."
        logoSrc="/originslogo.png"
      />
      
      {/* Music Player with Three.js Visualization */}
      {showThreePlayer && isVisualizationEnabled && <ThreeMusicPlayer />}
      
      {/* Music Player */}
      <MusicPlayer />

      {/* Visualization Toggle Button */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-8">
        <button
          onClick={toggleVisualization}
          className="w-full glass backdrop-blur-sm flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white/90 font-medium border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Wand2 className="w-5 h-5 opacity-80" />
          {isVisualizationEnabled ? "Disable Visualization" : "Enable Visualization"}
        </button>
      </div>
      
      {/* About section */}
      <AboutSection />
    </PageLayout>
  );
};

export default Index;
