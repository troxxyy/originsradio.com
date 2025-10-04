import { ReactNode, CSSProperties } from "react";
import MusicPlayer from "@/components/music/MusicPlayer";
import EventFooter from "@/components/events/EventFooter";
import { useLocation } from "react-router-dom";


interface PageLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
  customBackground?: string;
  customBackgroundStyle?: CSSProperties;
  showFooter?: boolean;
}

const PageLayout = ({
  children,
  backgroundImage = "/backgr.jpg",
  customBackground,
  customBackgroundStyle,
  showFooter = true,
}: PageLayoutProps) => {
  const location = useLocation();
  const showMainPlayer = false; // main player disabled, only floating player

  return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center relative overflow-hidden">
  
      
      {/* Background image with effects */}
      <div className="absolute inset-0 z-10">
        {customBackground || customBackgroundStyle ? (
          <div
            className={`absolute inset-0 ${customBackground ?? ""}`}
            style={customBackgroundStyle}
          ></div>
        ) : (
          <>
            <div className="absolute inset-0 bg-[#040406]/60 backdrop-blur-sm z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(4,4,6,0.85)] to-[rgba(17,23,38,0.4)] z-30"></div>
            <img 
              src={backgroundImage} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover animate-fast-pulse z-10"
            />
          </>
        )}
      </div>
      
      {/* Navigation handled at App level */}
      
      {/* Page content - Highest layer */}
      <div className="relative z-40 w-full flex-1 flex flex-col items-center justify-start sm:justify-center py-8 sm:py-0">
        {children}
      </div>

      {/* Global music player (floating bar always, full card only on home) */}
      <div className="relative z-40 w-full">
        <MusicPlayer showMain={showMainPlayer} />
      </div>

      {/* Global Footer */}
      {showFooter && (
        <div className="relative z-40 w-full">
          <EventFooter />
        </div>
      )}
    </div>
  );
};

export default PageLayout; 