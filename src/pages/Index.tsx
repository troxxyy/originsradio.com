import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SocialBubbles from "@/components/social/SocialBubbles";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/UpNext";
import MusicPlayer from "@/components/music/MusicPlayer";
import ThreeMusicPlayer from "../components/music/ThreeMusicPlayer";
import Navigation from "@/components/Navigation";
import { Wand2, Calendar, Play, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
    }, 5);

    return () => {
      clearTimeout(timer);
      setShowThreePlayer(false);
    };
  }, []);

  const toggleVisualization = () => {
    setIsVisualizationEnabled(!isVisualizationEnabled);
  };

  const handleWatchRecording = () => {
    window.location.href = '/anniversary';
  };

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Social Media Floating Bubbles */}
      <SocialBubbles />
      <Navigation />
      
      {/* Anniversary Event Banner */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-8 relative z-10">
        <div className="bg-gradient-to-r from-blue-950/50 via-cyan-900/30 to-blue-950/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 mb-8">
          <div className="text-center">
            {/* Event Status */}
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 mb-4">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-semibold text-sm uppercase tracking-wide">Event Ended</span>
            </div>
            
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              🎉 3 Years of Origins Anniversary 🎉
            </h2>
            
            {/* Description */}
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              Our 24-hour anniversary celebration has ended, but you can still experience the magic! 
              Watch recordings of all the incredible sets from our amazing artists.
            </p>
            
            {/* CTA Button */}
            <button
              onClick={handleWatchRecording}
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Watch Event Recordings
            </button>
            
            {/* Event Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>24-Hour Event</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>20+ Artists</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>Multiple Genres</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
