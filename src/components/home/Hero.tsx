import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  logoSrc: string;
}

const Hero = ({ title, subtitle, logoSrc }: HeroProps) => {
  return (
    <div className="relative z-10 text-center text-white px-4 py-6 sm:py-8">
      <div className="w-64 h-64 sm:w-80 md:w-96 sm:h-80 md:h-96 mx-auto mb-2 sm:mb-0 mt-2 animate-fade-in">
        <img 
          src={logoSrc} 
          alt={`${title} Logo`} 
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-3 sm:mb-1 animate-fade-in -mt-12 sm:-mt-16 md:-mt-20 text-shadow-lg">
        {title}
      </h1>
      <p className="text-xl sm:text-2xl md:text-2xl font-medium text-white/120 max-w-md mx-auto animate-fade-in mt-1 sm:mt-0 px-4 leading-relaxed" style={{ animationDelay: "200ms" }}>
        {subtitle}
      </p>
      <div className="mt-6 sm:mt-8 hidden sm:block animate-fade-in" style={{ animationDelay: "300ms" }}>
        <div className="w-32 h-1.5 bg-white/40 mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

export default Hero;