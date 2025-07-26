import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SocialBubbles from "@/components/social/SocialBubbles";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/UpNext";
import MusicPlayer from "@/components/music/MusicPlayer";
import ThreeMusicPlayer from "../components/music/ThreeMusicPlayer";
import Navigation from "@/components/Navigation";
import { Wand2, Play, Calendar, Users } from "lucide-react";
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

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Event Recording Section */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">Live Event Recording</h2>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">December 31, 2024</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-3">🎉 3 Years of Origins Radio</h3>
              <p className="text-gray-300 leading-relaxed">
                Relive the incredible celebration of our 3rd anniversary! Watch the full recording 
                of our live event featuring amazing performances, community highlights, and special moments 
                that made this milestone unforgettable.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>10,000+ viewers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span>4 hours of content</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-red-900/20 to-black/50 rounded-xl border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/60 mx-auto mb-4" />
                  <p className="text-white/80 font-medium">Event Recording</p>
                  <p className="text-gray-400 text-sm mt-2">Click to watch the full event</p>
                </div>
                <button className="absolute inset-0 w-full h-full bg-transparent hover:bg-white/5 transition-colors rounded-xl">
                  <span className="sr-only">Play event recording</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full border border-red-500/30">
                Live Recording
              </span>
              <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full border border-white/20">
                Anniversary Event
              </span>
              <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full border border-white/20">
                Community Celebration
              </span>
            </div>
          </div>
        </div>
      </div>

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
