import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TicketPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastPopupTime = localStorage.getItem('lastPopupTime');
    const currentTime = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    // Only show popup if it hasn't been shown in the last hour
    if (!lastPopupTime || currentTime - parseInt(lastPopupTime) > oneHour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Save current timestamp when popup is shown
        localStorage.setItem('lastPopupTime', currentTime.toString());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleImageClick = () => {
    window.open('https://biletino.com/tr/e-126q/eczodia-originsradio-presents-pixel-ankara/', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative max-w-2xl w-full mx-4">
        <button
          onClick={handleClose}
          className="absolute -top-8 right-0 text-white hover:text-gray-300"
          aria-label="Close ticket popup"
        >
          <X size={24} />
        </button>
        
        <img 
          src="/popup.jpg" 
          alt="Eczodia Event at Pixel Ankara"
          className="w-full h-auto cursor-pointer rounded-lg shadow-xl"
          onClick={handleImageClick}
        />
      </div>
    </div>
  );
};

export default TicketPopup; 