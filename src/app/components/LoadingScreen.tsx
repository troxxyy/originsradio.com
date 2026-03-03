import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWebHaptics } from "web-haptics/react";
import { preloadCriticalAssets, type PreloaderProgress } from "@/lib/resource-preloader";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minLoadTime?: number;
}

const LoadingScreen = ({
  onLoadingComplete,
  minLoadTime = 1000
}: LoadingScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { trigger } = useWebHaptics();
  const [opacity, setOpacity] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    preloadCriticalAssets((progress: PreloaderProgress) => {
      setLoadingProgress(Math.round(progress.totalProgress));
    }).then(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);

      setTimeout(() => {
        trigger('success');
        setOpacity(0);

        setTimeout(() => {
          setIsLoading(false);
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 1000);
      }, remainingTime);
    }).catch(() => {
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
      className="loading-screen flex flex-col items-center justify-center transition-opacity duration-1000"
      style={{
        opacity,
        pointerEvents: opacity > 0 ? 'auto' : 'none'
      }}
    >
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 mb-8">
        <img
          src="/origins2026logo.png"
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
        Loading... {loadingProgress}%
      </div>


    </div>
  );
};

export default LoadingScreen;
