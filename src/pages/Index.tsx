import { useState, useEffect, Suspense, lazy } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SocialBubbles from "@/components/social/SocialBubbles";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/UpNext";
import MusicPlayer from "@/components/music/MusicPlayer";
import Navigation from "@/components/Navigation";
import { Wand2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy load the heavy ThreeMusicPlayer component
const ThreeMusicPlayer = lazy(() => import("../components/music/ThreeMusicPlayer"));


const Index = () => {
  const isMobile = useIsMobile();
  const [showThreePlayer, setShowThreePlayer] = useState(false);
  const [isVisualizationEnabled, setIsVisualizationEnabled] = useState(true);

  // Update visualization state when mobile detection is complete
  useEffect(() => {
    if (isMobile !== undefined) {
      setIsVisualizationEnabled(!isMobile);
    }
  }, [isMobile]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Delay loading the ThreeMusicPlayer to improve initial page load performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowThreePlayer(true);
    }, 1000); // Increased delay to improve initial load performance

    return () => {
      clearTimeout(timer);
      setShowThreePlayer(false);
    };
  }, []);

  const toggleVisualization = () => {
    setIsVisualizationEnabled(!isVisualizationEnabled);
  };

    return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
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
      {showThreePlayer && isVisualizationEnabled && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-96 bg-black/20 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        }>
          <ThreeMusicPlayer />
        </Suspense>
      )}
      
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
