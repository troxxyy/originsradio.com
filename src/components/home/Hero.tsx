import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  logoSrc: string;
}

const Hero = ({ title, subtitle, logoSrc }: HeroProps) => {
  return (
    <div className="relative z-20 text-center text-white">
      <div className="w-96 h-96 mx-auto mb-0 animate-fade-in">
        <img 
          src={logoSrc} 
          alt={`${title} Logo`} 
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold mb-1 text-gradient animate-fade-in -mt-20">
        {title}
      </h1>
      <p className="text-lg text-white/120 max-w-md mx-auto animate-fade-in -mt-1" style={{ animationDelay: "200ms" }}>
        {subtitle}
      </p>
    </div>
  );
};

export default Hero;