import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';

export interface ProgressBarProps {
  progress: number;
  onSeek: (percentage: number) => void;
  className?: string;
  thumbSize?: string;
}

const ProgressBar = ({ progress, onSeek, className = "", thumbSize = "w-2 h-2" }: ProgressBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const calculatePercentage = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const calculatePercentageFromTouch = (touch: React.Touch) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    const percentage = calculatePercentage(e.clientX);
    onSeek(percentage);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    const percentage = calculatePercentageFromTouch(touch);
    onSeek(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const percentage = calculatePercentage(e.clientX);
      onSeek(percentage);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const percentage = calculatePercentage(touch.clientX);
      onSeek(percentage);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      if (isMobile) {
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
      } else {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    }
    return () => {
      if (isMobile) {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isDragging, isMobile]);

  const mobileThumbSize = isMobile ? "w-4 h-4" : thumbSize;
  const mobileBarHeight = isMobile ? "h-1" : "h-0.5";

  return (
    <div 
      ref={progressBarRef}
      className={`${mobileBarHeight} w-full mx-auto mt-4 bg-[#383838] relative overflow-visible rounded-full cursor-pointer select-none touch-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#383838] to-[#d1d1d1] transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
      <div 
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)] ${mobileThumbSize}`}
        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};

export default ProgressBar; 
