import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  logoSrc: string;
  compact?: boolean;
}

const Hero = ({ title, subtitle, logoSrc, compact = false }: HeroProps) => {
  return (
    <div className={`relative z-10 text-center text-white px-4 ${compact ? 'py-4' : 'py-6 sm:py-8'}`}>
      <div className={`${compact ? 'w-40 h-40 sm:w-48 sm:h-48' : 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96'} mx-auto mb-2 sm:mb-0 mt-2 animate-fade-in`}>
        <img 
          src={logoSrc} 
          alt={`${title} Logo`} 
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className={`${compact ? 'text-3xl sm:text-4xl md:text-5xl -mt-6 sm:-mt-8 md:-mt-10' : 'text-5xl sm:text-6xl md:text-7xl -mt-12 sm:-mt-16 md:-mt-20'} font-extrabold tracking-tight mb-3 sm:mb-1 animate-fade-in text-shadow-lg`}>
        {title}
      </h1>
      <p className={`${compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl md:text-2xl'} font-medium text-white/120 max-w-md mx-auto animate-fade-in mt-1 sm:mt-0 px-4 leading-relaxed`}>
        {subtitle}
      </p>
      {!compact && (
        <div className="mt-6 sm:mt-8 hidden sm:block animate-fade-in">
          <div className="w-32 h-1.5 bg-white/40 mx-auto rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Hero;