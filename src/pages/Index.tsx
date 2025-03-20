import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SocialBubbles from "@/components/social/SocialBubbles";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/UpNext";
import MusicPlayer from "@/components/music/MusicPlayer";
import ThreeMusicPlayer from "../components/music/ThreeMusicPlayer";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [showThreePlayer, setShowThreePlayer] = useState(false);

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
      
      
       {showThreePlayer && <ThreeMusicPlayer />} 
      {/* Music Player */}
      <MusicPlayer />
      {/* About section */}
      <AboutSection />
      
      {/* Team section preview */}
      
    </PageLayout>
  );
};

export default Index;
