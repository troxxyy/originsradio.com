import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minLoadTime?: number;
}



const LoadingScreen = ({ 
  onLoadingComplete, 
  minLoadTime = 3500 
}: LoadingScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading resources...");

  useEffect(() => {
    console.log("Loading screen mounted");
    
    // Force a simulated progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = Math.min(prev + 20, 100);
        setLoadingText(`Loading resources... ${newProgress}%`);
        return newProgress;
      });
    }, 150);

    // Set a fixed timeout to guarantee completion
    const timer = setTimeout(() => {
      console.log("Loading timeout reached");
      clearInterval(interval);
      setLoadingProgress(100);
      setLoadingText("Ready!");
      
      // Start fade out animation after a small delay
      setTimeout(() => {
        console.log("Starting fade out");
        setOpacity(0);
        
        // After fade animation, set loading to false and call the completion handler
        setTimeout(() => {
          console.log("Fade complete, calling onLoadingComplete");
          setIsLoading(false);
          if (onLoadingComplete) {
            onLoadingComplete();
            console.log("onLoadingComplete called");
          }
        }, 100); // 1 second for fade-out
      }, 50);
    }, minLoadTime);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [minLoadTime, onLoadingComplete]);

  if (!isLoading) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col items-center justify-center transition-opacity duration-1000",
      )}
      style={{ opacity }}
    >
      <div className="relative w-64 h-64 mb-8">
        <img 
          src="/originslogo.png" 
          alt="Origins Radio" 
          className="w-full h-full object-contain animate-float"
        />
      </div>
      
      <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out" 
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      
      <div className="text-muted-foreground text-sm">
        {loadingText}
      </div>
      
      <div className="mt-8 text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
          origins<span className="text-white">radio</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">Ankara's interactive radio station</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 