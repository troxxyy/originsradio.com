import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  logoSrc: string;
}

const Hero = ({ title, subtitle, logoSrc }: HeroProps) => {
  return (
    <div className="relative z-20 text-center text-white px-4">
      <div className="w-64 h-64 sm:w-96 sm:h-96 mx-auto mb-0 animate-fade-in">
        <img 
          src={logoSrc} 
          alt={`${title} Logo`} 
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-1 animate-fade-in -mt-10 sm:-mt-20">
        {title}
      </h1>
      <p className="text-base sm:text-lg text-white/120 max-w-md mx-auto animate-fade-in -mt-1 px-4" style={{ animationDelay: "200ms" }}>
        {subtitle}
      </p>
    </div>
  );
};

export default Hero;