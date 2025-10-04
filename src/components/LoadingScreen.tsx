import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { cn } from "@/lib/utils";
import OrbitingLogo from "@/components/three/OrbitingLogo";
import VibrantLights from "@/components/three/VibrantLights";

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
  const [isLogoReady, setIsLogoReady] = useState(false);

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
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 mb-8">
        <div className="absolute -inset-10 bg-vibrant-animated blur-2xl opacity-60" />
        <Canvas
          camera={{ position: [0, 0.1, 3], fov: 90 }}
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-700",
            isLogoReady ? "opacity-100" : "opacity-0"
          )}
          shadows
        >
          <ambientLight intensity={0.45} />
          <VibrantLights intensity={1.15} />
          <Suspense fallback={null}>
            <OrbitingLogo 
              onLoaded={() => setIsLogoReady(true)}
              scale={3}
              rotation={[0, 0, Math.PI / 2]}
            />
          </Suspense>
        </Canvas>
        <img 
          src="/originslogo.png" 
          alt="Origins Radio" 
          className={cn(
            "absolute inset-0 w-full h-full object-contain transition-opacity duration-500",
            isLogoReady ? "opacity-0 scale-95" : "opacity-100 animate-float"
          )}
          style={{ pointerEvents: "none" }}
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
        <h1 className="text-3xl font-bold bg-clip-text text-white">
          origins<span className="text-white">radio</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">Ankara's interactive radio station</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
