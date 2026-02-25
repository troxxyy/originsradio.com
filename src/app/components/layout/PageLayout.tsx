'use client'
 
import { ReactNode, CSSProperties } from "react";
import Image from "next/image";
import EventFooter from "@/components/events/EventFooter";
import { usePathname } from "next/navigation";


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
  const pathname = usePathname();
  const isHome = pathname === "/";
  const showMainPlayer = false; // main player disabled, only floating player

  return (
    <div className={`min-h-screen flex flex-col items-stretch justify-start relative pt-[env(safe-area-inset-top)]`}>
  
      
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
            <Image
              src={backgroundImage}
              alt="Background"
              fill
              priority
              sizes="100vw"
              className="object-cover animate-fast-pulse z-10"
            />
          </>
        )}
      </div>
      
      {/* Navigation handled at App level */}
      
      {/* Page content - Highest layer */}
      <div className={`relative z-40 w-full flex-1 flex flex-col items-stretch justify-start ${isHome ? 'pt-0' : 'pt-16 sm:pt-20'} pb-[env(safe-area-inset-bottom)]`}>
        {children}
      </div>

      {/* Floating music player is rendered at App level */}

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