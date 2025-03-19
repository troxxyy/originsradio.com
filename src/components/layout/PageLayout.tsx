import { ReactNode, useContext } from "react";
import Navigation from "@/components/Navigation";


interface PageLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
}

const PageLayout = ({ children, backgroundImage = "/backgr.jpg" }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center relative overflow-hidden">
  
      
      {/* Background image with effects */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/30 z-30"></div>
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover animate-fast-pulse z-10"
        />
      </div>
      
      {/* Navigation */}
      <div className="relative z-40 w-full">
        <Navigation />
      </div>
      
      {/* Page content - Highest layer */}
      <div className="relative z-40 w-full flex-1 flex flex-col items-center justify-start sm:justify-center py-8 sm:py-0">
        {children}
      </div>
    </div>
  );
};

export default PageLayout; 