import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { preloadCriticalAssets, type PreloaderProgress, type LoadingAsset } from "@/lib/resource-preloader";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minLoadTime?: number;
}

const LoadingScreen = ({ 
  onLoadingComplete, 
  minLoadTime = 1000 
}: LoadingScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentAsset, setCurrentAsset] = useState<string>("Initializing...");
  const [assets, setAssets] = useState<LoadingAsset[]>([]);

  useEffect(() => {
    console.log("Loading screen mounted - starting asset preload");
    
    const startTime = Date.now();
    
    // Start preloading critical assets
    preloadCriticalAssets((progress: PreloaderProgress) => {
      setLoadingProgress(Math.round(progress.totalProgress));
      setCurrentAsset(progress.currentAsset || "Loading complete");
      setAssets(progress.assets);
    }).then(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);
      
      console.log(`Assets loaded in ${elapsedTime}ms, waiting ${remainingTime}ms for min load time`);
      
      // Ensure minimum load time is met
      setTimeout(() => {
        console.log("Loading complete, starting fade out");
        setOpacity(0);
        
        // After fade animation, set loading to false and call the completion handler
        setTimeout(() => {
          console.log("Fade complete, calling onLoadingComplete");
          setIsLoading(false);
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 1000); // 1 second for fade-out
      }, remainingTime);
    }).catch((error) => {
      console.error("Error loading assets:", error);
      // Still complete loading even if there's an error
      setOpacity(0);
      setTimeout(() => {
        setIsLoading(false);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 1000);
    });
  }, [minLoadTime, onLoadingComplete]);

  if (!isLoading) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center transition-opacity duration-1000",
      )}
      style={{ 
        opacity,
        pointerEvents: opacity > 0 ? 'auto' : 'none'
      }}
    >
      {/* Logo */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-8">
        <img 
          src="/originslogo.png" 
          alt="Origins Radio" 
          className="w-full h-full object-contain animate-float"
          style={{ pointerEvents: "none" }}
        />
      </div>
      
      {/* Progress Bar */}
      <div className="w-80 sm:w-96 max-w-[90vw] h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" 
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      
      {/* Overall Progress */}
      <div className="text-white text-lg font-semibold mb-4">
        {loadingProgress}% Complete
      </div>

      {/* Current Asset Loading */}
      <div className="text-muted-foreground text-sm mb-6 text-center px-4">
        {currentAsset}
      </div>
      
      {/* Asset List */}
      <div className="w-80 sm:w-96 max-w-[90vw] space-y-2 mb-8">
        {assets.map((asset, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-center justify-between text-xs transition-all duration-300",
              asset.loaded ? "text-green-400" : asset.progress > 0 ? "text-blue-400" : "text-muted-foreground/50"
            )}
          >
            <span className="flex items-center gap-2">
              {asset.loaded ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : asset.progress > 0 ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current opacity-30" />
              )}
              <span className="truncate max-w-[200px] sm:max-w-none">{asset.name}</span>
            </span>
            <span className="ml-2 tabular-nums">
              {asset.error ? "Error" : `${Math.round(asset.progress)}%`}
            </span>
          </div>
        ))}
      </div>
      
      {/* Branding */}
      <div className="mt-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-white">
          origins<span className="text-white">radio</span>
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-2">Ankara's interactive radio station</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
