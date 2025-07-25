import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

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

const triggerCelebration = () => {
  // Fire multiple confetti bursts
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const colors = ['#ff0000', '#ffffff', '#000000']; // Origins Radio colors

  (function frame() {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: colors
    });
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

const CountdownPopup: React.FC<CountdownPopupProps> = ({ targetDate, message, open, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));
  const [isEnding, setIsEnding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(targetDate);
      setTimeLeft(remaining);
      
      // Start celebration effect 3 seconds before end
      if (remaining.total <= 3000 && !isEnding) {
        setIsEnding(true);
        triggerCelebration();
      }
      
      if (remaining.total <= 0) {
        clearInterval(timer);
        // Short delay before redirect to allow celebration effects to play
        setTimeout(() => {
          navigate('/anniversary');
          onClose();
        }, 2000);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, open, onClose, navigate, isEnding]);

  const handleGoLive = () => {
    triggerCelebration();
    setTimeout(() => {
      navigate('/anniversary');
      onClose();
    }, 1000);
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