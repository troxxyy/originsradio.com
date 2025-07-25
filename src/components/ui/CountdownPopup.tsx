import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import { useIsMobile } from "@/hooks/use-mobile";

interface CountdownPopupProps {
  targetDate: Date;
  message?: string;
  open: boolean;
  onClose: () => void;
}

const getTimeRemaining = (target: Date) => {
  const total = target.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
};

const triggerCelebration = (isMobile: boolean) => {
  // Shorter duration and fewer particles for mobile
  const duration = isMobile ? 1500 : 3000;
  const particleCount = isMobile ? 35 : 100;
  const end = Date.now() + duration;

  const colors = ['#ff0000', '#ffffff', '#000000']; // Origins Radio colors

  // Create a more efficient animation frame loop
  let frame: number;
  const animate = () => {
    confetti({
      particleCount,
      angle: 60,
      spread: isMobile ? 45 : 55,
      origin: { x: 0, y: 0.8 },
      colors: colors,
      disableForReducedMotion: true, // Respect user's reduced motion settings
      gravity: isMobile ? 2 : 1, // Higher gravity on mobile for shorter particle lifetime
    });
    confetti({
      particleCount,
      angle: 120,
      spread: isMobile ? 45 : 55,
      origin: { x: 1, y: 0.8 },
      colors: colors,
      disableForReducedMotion: true,
      gravity: isMobile ? 2 : 1,
    });

    if (Date.now() < end) {
      frame = requestAnimationFrame(animate);
    }
  };

  animate();
  return () => frame && cancelAnimationFrame(frame);
};

const CountdownPopup: React.FC<CountdownPopupProps> = ({ targetDate, message, open, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));
  const [isEnding, setIsEnding] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(targetDate);
      setTimeLeft(remaining);
      
      // Start celebration effect 3 seconds before end
      if (remaining.total <= 3000 && !isEnding) {
        setIsEnding(true);
        const cleanup = triggerCelebration(isMobile);
        return () => cleanup();
      }
      
      if (remaining.total <= 0) {
        clearInterval(timer);
        // Short delay before redirect to allow celebration effects to play
        setTimeout(() => {
          navigate('/anniversary');
          onClose();
        }, isMobile ? 1000 : 2000); // Shorter delay on mobile
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, open, onClose, navigate, isEnding, isMobile]);

  const handleGoLive = () => {
    const cleanup = triggerCelebration(isMobile);
    setTimeout(() => {
      navigate('/anniversary');
      onClose();
      cleanup();
    }, isMobile ? 800 : 1000); // Shorter delay on mobile
  };

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className={`flex flex-col items-center mx-4 transition-all duration-300 ${isEnding ? 'animate-pulse scale-110' : ''}`}>
      <div className={`text-4xl md:text-5xl font-bold mb-2 ${isEnding ? 'text-red-500' : 'text-white'}`}>
        {String(value).padStart(2, '0')}
      </div>
      <div className={`text-sm font-medium uppercase tracking-wide ${isEnding ? 'text-red-400' : 'text-gray-400'}`}>
        {label}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className={`max-w-xl border border-gray-700 bg-black/90 backdrop-blur-sm transition-all duration-500 ${isEnding ? 'border-red-500/50 shadow-lg shadow-red-500/20' : ''}`}>
        <div className="flex flex-col items-center text-center p-6">
          <DialogTitle className={`text-2xl md:text-3xl font-bold mb-2 transition-colors ${isEnding ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            🎉 3 Years of Origins 🎉
          </DialogTitle>
          <div className={`font-medium mb-6 transition-colors ${isEnding ? 'text-red-400' : 'text-gray-300'}`}>
            Origins Radio
          </div>
          
          {message && (
            <DialogDescription className={`mb-8 transition-colors ${isEnding ? 'text-red-400' : 'text-gray-300'}`}>
              {message}
            </DialogDescription>
          )}
          
          <div className="flex items-center justify-center space-x-6 mb-6">
            {timeLeft.days > 0 && (
              <>
                <TimeUnit value={timeLeft.days} label="Days" />
                <div className={`text-2xl transition-colors ${isEnding ? 'text-red-400' : 'text-gray-400'}`}>:</div>
              </>
            )}
            {(timeLeft.hours > 0 || timeLeft.days > 0) && (
              <>
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <div className={`text-2xl transition-colors ${isEnding ? 'text-red-400' : 'text-gray-400'}`}>:</div>
              </>
            )}
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <div className={`text-2xl transition-colors ${isEnding ? 'text-red-400' : 'text-gray-400'}`}>:</div>
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden mb-6">
            <div 
              className={`h-full transition-all duration-1000 ${isEnding ? 'bg-red-500' : 'bg-white'}`}
              style={{
                width: `${Math.max(0, Math.min(100, ((86400000 - timeLeft.total) / 86400000) * 100))}%`
              }}
            ></div>
          </div>
          
          <Button 
            onClick={handleGoLive}
            className={`w-full font-bold py-3 mb-4 transition-all duration-300 ${
              isEnding 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            🔴 Join Live Event Now
          </Button>
          
          <div className={`text-sm transition-colors ${isEnding ? 'text-red-400' : 'text-gray-500'}`}>
            {isEnding ? "It's Starting!" : "Until Midnight"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CountdownPopup; 