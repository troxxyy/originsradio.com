
import Navigation from "@/components/Navigation";
import MusicPlayer from "@/components/MusicPlayer";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Logo section */}
      <div className="relative z-10 text-center">
        <div className="animate-pulse w-32 h-32 rounded-full bg-primary/20 mx-auto mb-8" />
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient animate-fade-in">
          SONIC WAVE
        </h1>
        <p className="text-lg text-white/70 max-w-md mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
          Experience the future of electronic music
        </p>
      </div>
      
      {/* About section */}
      <section className="mt-32 w-full max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-8 text-center text-gradient">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-lg animate-scale-in">
            <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
            <p className="text-white/70">
              Pushing the boundaries of electronic music through innovation and creativity.
            </p>
          </div>
          <div className="glass p-6 rounded-lg animate-scale-in" style={{ animationDelay: "100ms" }}>
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-white/70">
              Creating immersive audio experiences that transport listeners to new dimensions.
            </p>
          </div>
        </div>
      </section>
      
      {/* Team section preview */}
      <section className="mt-32 w-full max-w-4xl mx-auto px-6 mb-32">
        <h2 className="text-2xl font-bold mb-8 text-center text-gradient">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, i) => (
            <div 
              key={i}
              className="glass p-6 rounded-lg text-center animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Team Member {i + 1}</h3>
              <p className="text-sm text-white/70">Role Description</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Music player */}
      <MusicPlayer />
    </div>
  );
};

export default Index;
