import { Suspense, useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";
import { useAudioVisualizer } from "@/contexts/AudioVisualizerContext";

interface OrbProps {
  className?: string;
  rotationSpeed?: number; // radians per frame (negative = clockwise)
}

const Orb = ({ className = "", rotationSpeed = -0.08 }: OrbProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const watermarkObserverRef = useRef<MutationObserver | null>(null);
  const splineRef = useRef<Application | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);
  const rotationSpeedRef = useRef<number>(rotationSpeed);

  // Use context for audio visualization
  const { analyser, audioContext } = useAudioVisualizer();
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const mouseCleanupRef = useRef<(() => void) | null>(null);
  // Smoothed mouse position for follower (interpolates toward real cursor)
  const mouseSmoothRef = useRef<{ x: number; y: number }>({ x: 0.8, y: 0.8 });
  // Higher lerp factor -> follower responds faster (0..1)
  const CURSOR_LERP_FACTOR = 1.2;
  const DEFAULT_Y_FOR_BASS = 120;
  const DEFAULT_TOP_FOR_HIGH = 55;

  // Render throttling limits
  const lastTickTimeRef = useRef<number>(0);
  const TARGET_FPS = 30; // Reduced framerate for heavy 3D Spline performance
  const FRAME_MIN_TIME = 1000 / TARGET_FPS;

  // Visibility tracking
  const isVisibleRef = useRef<boolean>(true);

  // Initialize freqData buffer when analyser is available
  useEffect(() => {
    if (analyser && !freqDataRef.current) {
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }
  }, [analyser]);

  const handleLoad = (splineApp: Application) => {
    splineRef.current = splineApp;

    // Initialize defaults immediately
    try {
      splineRef.current?.setVariable("yforbass", DEFAULT_Y_FOR_BASS);
      splineRef.current?.setVariable("topforhigh", DEFAULT_TOP_FOR_HIGH);
    } catch { }

    // Cleanup previous observer if any
    if (watermarkObserverRef.current) {
      watermarkObserverRef.current.disconnect();
    }

    // Setup mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mousePositionRef.current = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
      }
    };

    // Add mouse event listener
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup function for mouse listener
    const cleanupMouseListener = () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
    mouseCleanupRef.current = cleanupMouseListener;

    // Start infinite z-rotation animation at constant speed and feed audio variables
    const tick = (timestamp: number) => {
      animationFrameRef.current = requestAnimationFrame(tick);

      // Stop logic rendering if completely out of view to save battery and GPU
      if (!isVisibleRef.current) return;

      // Throttle ticking to target FPS
      const delta = timestamp - lastTickTimeRef.current;
      if (delta < FRAME_MIN_TIME) return;

      lastTickTimeRef.current = timestamp;

      rotationAngleRef.current += rotationSpeedRef.current;
      try {
        splineRef.current?.setVariable("zrotation", rotationAngleRef.current);
      } catch {
        // Ignore if variable not present; prevents runtime noise
      }

      // Update Spline variables from audio spectrum if available
      const freqData = freqDataRef.current;
      if (analyser && freqData && audioContext && audioContext.state === 'running') {
        analyser.getByteFrequencyData(freqData);

        const nyquist = audioContext.sampleRate / 2;
        const binHz = nyquist / analyser.frequencyBinCount;

        // Bass: ~20-160 Hz
        const bassStart = Math.max(0, Math.floor(20 / binHz));
        const bassEnd = Math.min(freqData.length - 1, Math.floor(160 / binHz));
        let bassSum = 0;
        for (let i = bassStart; i <= bassEnd; i++) bassSum += freqData[i];
        const bassAvg = bassSum / Math.max(1, bassEnd - bassStart + 1);

        // Highs: ~4000-12000 Hz
        const highStart = Math.min(freqData.length - 1, Math.floor(4000 / binHz));
        const highEnd = Math.min(freqData.length - 1, Math.floor(12000 / binHz));
        let highSum = 0;
        for (let i = highStart; i <= highEnd; i++) highSum += freqData[i];
        const highAvg = highSum / Math.max(1, highEnd - highStart + 1);

        const bassNorm = bassAvg / 255; // 0..1
        const highNorm = highAvg / 255; // 0..1

        try {
          // Map to defaults plus a visible variation
          splineRef.current?.setVariable("yforbass", DEFAULT_Y_FOR_BASS + bassNorm * 80);
          splineRef.current?.setVariable("topforhigh", highNorm * 25);
        } catch { }
      } else {
        // Fallback to defaults if analyser not available
        try {
          splineRef.current?.setVariable("yforbass", DEFAULT_Y_FOR_BASS);
          splineRef.current?.setVariable("topforhigh", DEFAULT_TOP_FOR_HIGH);
        } catch { }
      }

      // Smoothly interpolate a follower position toward the real mouse to control responsiveness
      try {
        const target = mousePositionRef.current;
        const smooth = mouseSmoothRef.current;
        smooth.x += (target.x - smooth.x) * CURSOR_LERP_FACTOR * (delta / 16.66) * 0.1; // normalize delta
        smooth.y += (target.y - smooth.y) * CURSOR_LERP_FACTOR * (delta / 16.66) * 0.1;
        splineRef.current?.setVariable("ymousefollow", smooth.y);
        splineRef.current?.setVariable("zmousefollow", smooth.x);
      } catch { }
    };

    // Kick it off
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  // IntersectionObserver to pause rendering when completely out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisibleRef.current = entry.isIntersecting;
      });
    }, { rootMargin: '200px' }); // Load ahead

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Disconnect observer when unmounting to avoid leaks
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (watermarkObserverRef.current) watermarkObserverRef.current.disconnect();
      if (mouseCleanupRef.current) mouseCleanupRef.current();
      splineRef.current = null;
    };
  }, []);
  return (
    <div className={`absolute inset-0 orb-container ${className}`} ref={containerRef}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-white" />
          </div>
        }
      >
        <Spline
          scene="/orbvol2/public/scene.splinecode"
          wasmPath="/orbvol2/public/"
          className="!w-full !h-full block absolute inset-0"
          onLoad={handleLoad}
        />
      </Suspense>
    </div>
  );
};

export default Orb;
