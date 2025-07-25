import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

const CountdownPopup: React.FC<CountdownPopupProps> = ({ targetDate, message, open, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(targetDate);
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(timer);
        // Redirect to anniversary page when countdown ends
        navigate('/anniversary');
        onClose();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, open, onClose, navigate]);

  const handleGoLive = () => {
    navigate('/anniversary');
    onClose();
  };

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-4">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl border border-gray-700 bg-black/90 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center p-6">
          <DialogTitle className="text-2xl md:text-3xl font-bold text-white mb-2">
            🎉 3 Years of Origins 🎉
          </DialogTitle>
          <div className="text-gray-300 font-medium mb-6">Origins Radio</div>
          
          {message && (
            <DialogDescription className="text-gray-300 mb-8">
              {message}
            </DialogDescription>
          )}
          
          <div className="flex items-center justify-center space-x-6 mb-6">
            {timeLeft.days > 0 && (
              <>
                <TimeUnit value={timeLeft.days} label="Days" />
                <div className="text-2xl text-gray-400">:</div>
              </>
            )}
            {(timeLeft.hours > 0 || timeLeft.days > 0) && (
              <>
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <div className="text-2xl text-gray-400">:</div>
              </>
            )}
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <div className="text-2xl text-gray-400">:</div>
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-white transition-all duration-1000"
              style={{
                width: `${Math.max(0, Math.min(100, ((86400000 - timeLeft.total) / 86400000) * 100))}%`
              }}
            ></div>
          </div>
          
          <Button 
            onClick={handleGoLive}
            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 mb-4"
          >
            🔴 Join Live Event Now
          </Button>
          
          <div className="text-sm text-gray-500">
            Until Midnight
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CountdownPopup; 