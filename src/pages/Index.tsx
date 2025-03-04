import PageLayout from "@/components/layout/PageLayout";
import SocialBubbles from "@/components/social/SocialBubbles";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/UpNext";
import MusicPlayer from "@/components/music/MusicPlayer";
import ThreeMusicPlayer from "../components/music/ThreeMusicPlayer";
import Navigation from "@/components/Navigation";

const Index = () => {
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
      {/*  <ThreeMusicPlayer /> */}
      {/* Music Player */}
      <MusicPlayer />
      {/* About section */}
      <AboutSection />
      
      {/* Team section preview */}
      
    </PageLayout>
  );
};

export default Index;
