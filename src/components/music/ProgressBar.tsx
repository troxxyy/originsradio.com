import { useRef, useState, useEffect, useCallback } from 'react';
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
  const lastSeekTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const calculatePercentage = useCallback((clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  }, []);

  const calculatePercentageFromTouch = useCallback((touch: React.Touch) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  }, []);

  // Throttled seek function to prevent excessive calls
  const throttledSeek = useCallback((percentage: number) => {
    const now = Date.now();
    if (now - lastSeekTimeRef.current >= 16) { // ~60fps throttling
      onSeek(percentage);
      lastSeekTimeRef.current = now;
    }
  }, [onSeek]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const percentage = calculatePercentage(e.clientX);
    onSeek(percentage); // Immediate response on click
  }, [calculatePercentage, onSeek]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    const percentage = calculatePercentageFromTouch(touch);
    onSeek(percentage); // Immediate response on touch
  }, [calculatePercentageFromTouch, onSeek]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        const percentage = calculatePercentage(e.clientX);
        throttledSeek(percentage);
      });
    }
  }, [isDragging, calculatePercentage, throttledSeek]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        const percentage = calculatePercentage(touch.clientX);
        throttledSeek(percentage);
      });
    }
  }, [isDragging, calculatePercentage, throttledSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

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
      
      // Cleanup animation frame on unmount or when dragging stops
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, isMobile, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const mobileThumbSize = isMobile ? "w-3 h-3" : "w-2.5 h-2.5";
  const mobileBarHeight = isMobile ? "h-1.5" : "h-1";

  return (
    <div 
      ref={progressBarRef}
      className={`${mobileBarHeight} w-full mx-auto mt-4 bg-white/20 relative overflow-visible rounded-full cursor-pointer select-none touch-none hover:bg-white/25 transition-colors duration-200 ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="absolute top-0 left-0 h-full bg-white/60 transition-all duration-100 rounded-full"
        style={{ width: `${progress}%` }}
      />
      <div 
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm border border-white/20 transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${mobileThumbSize}`}
        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};

export default ProgressBar; 
