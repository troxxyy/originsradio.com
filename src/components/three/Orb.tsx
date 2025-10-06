import { Suspense, useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";

interface OrbProps {
  className?: string;
  rotationSpeed?: number; // radians per frame (negative = clockwise)
  setId?: string; // optional: force a specific Supabase set for SSE
}

const Orb = ({ className = "", rotationSpeed = -0.02, setId }: OrbProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const watermarkObserverRef = useRef<MutationObserver | null>(null);
  const splineRef = useRef<Application | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);
  const rotationSpeedRef = useRef<number>(rotationSpeed);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const teardownAudioRef = useRef<(() => void) | null>(null);
  const boundAudioElRef = useRef<HTMLAudioElement | null>(null);
  const DEFAULT_Y_FOR_BASS = 120;
  const DEFAULT_TOP_FOR_HIGH = 68;

  const handleLoad = (splineApp: Application) => {
    splineRef.current = splineApp;

    // Initialize defaults immediately
    try {
      splineRef.current?.setVariable("yforbass", DEFAULT_Y_FOR_BASS);
      splineRef.current?.setVariable("topforhigh", DEFAULT_TOP_FOR_HIGH);
    } catch {}

    // Cleanup previous observer if any
    if (watermarkObserverRef.current) {
      watermarkObserverRef.current.disconnect();
    }

    // Attach analyser to the provided audio element (rebinding if target changes)
    const setupAnalyserForElement = (audioEl: HTMLAudioElement) => {
      if (boundAudioElRef.current === audioEl) return; // already bound to this element
      if (teardownAudioRef.current) {
        try { teardownAudioRef.current(); } catch {}
        teardownAudioRef.current = null;
      }
      try {
        const AudioCtx =
          (window.AudioContext ||
            (window as typeof window & { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext) as typeof AudioContext | undefined;
        if (!AudioCtx) return;

        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048; // frequencyBinCount = 1024
        analyser.smoothingTimeConstant = 0.85;
        analyser.minDecibels = -80;
        analyser.maxDecibels = -10;

        // Ensure CORS-safe when needed
        try { audioEl.crossOrigin = audioEl.crossOrigin || "anonymous"; } catch {}

        const source = audioCtx.createMediaElementSource(audioEl);
        // Split: one branch to analyser, one to speakers
        source.connect(analyser);
        source.connect(audioCtx.destination);

        const freqData = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        freqDataRef.current = freqData;
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        boundAudioElRef.current = audioEl;

        const ensureRunning = () => {
          if (audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => undefined);
          }
        };
        audioEl.addEventListener("play", ensureRunning);
        // Also try to resume immediately in case audio already playing
        audioCtx.resume().catch(() => undefined);

        teardownAudioRef.current = () => {
          audioEl.removeEventListener("play", ensureRunning);
          try {
            source.disconnect();
            analyser.disconnect();
          } catch {}
          if (audioCtx.state !== "closed") {
            audioCtx.close().catch(() => undefined);
          }
          freqDataRef.current = null;
          analyserRef.current = null;
          audioContextRef.current = null;
          boundAudioElRef.current = null;
        };
      } catch {
        // ignore setup errors
      }
    };

    const pickActiveAudio = (): HTMLAudioElement | null => {
      const all = Array.from(document.querySelectorAll("audio"));
      const active = all.find(a => a instanceof HTMLAudioElement && (!a.paused || a.currentTime > 0));
      if (active instanceof HTMLAudioElement) return active;
      const first = all.find(a => a instanceof HTMLAudioElement) as HTMLAudioElement | undefined;
      return first ?? null;
    };

    const setupAudioAnalyser = () => {
      const candidate = pickActiveAudio();
      if (candidate) {
        setupAnalyserForElement(candidate);
      }
      // Observe DOM for audio element appearance/changes
      const observer = new MutationObserver(() => {
        const current = pickActiveAudio();
        if (current && current !== boundAudioElRef.current) {
          setupAnalyserForElement(current);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      watermarkObserverRef.current = observer;

      // Rebind when any audio starts playing (capture phase to catch early)
      const onGlobalPlay = (e: Event) => {
        const target = e.target as EventTarget | null;
        if (target && (target as HTMLElement).tagName === 'AUDIO') {
          setupAnalyserForElement(target as HTMLAudioElement);
        }
      };
      document.addEventListener('play', onGlobalPlay, true);

      // Extend teardown to also remove the listener
      const prevTeardown = teardownAudioRef.current;
      teardownAudioRef.current = () => {
        try { document.removeEventListener('play', onGlobalPlay, true); } catch {}
        if (prevTeardown) prevTeardown();
      };
    };

    setupAudioAnalyser();

    // Start infinite z-rotation animation at constant speed and feed audio variables
    const tick = () => {
      rotationAngleRef.current += rotationSpeedRef.current;
      try {
        splineRef.current?.setVariable("zrotation", rotationAngleRef.current);
      } catch {
        // Ignore if variable not present; prevents runtime noise
      }

      // Update Spline variables from audio spectrum if available
      const analyser = analyserRef.current;
      const freqData = freqDataRef.current;
      const audioCtx = audioContextRef.current;
      if (analyser && freqData && audioCtx) {
        analyser.getByteFrequencyData(freqData);

        const nyquist = audioCtx.sampleRate / 2;
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
          splineRef.current?.setVariable("topforhigh", DEFAULT_TOP_FOR_HIGH - highNorm * 300);
        } catch {}
      } else {
        // Fallback to defaults if analyser not available
        try {
          splineRef.current?.setVariable("yforbass", DEFAULT_Y_FOR_BASS);
          splineRef.current?.setVariable("topforhigh", DEFAULT_TOP_FOR_HIGH);
        } catch {}
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    // Kick it off
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  // Disconnect observer when unmounting to avoid leaks
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (watermarkObserverRef.current) watermarkObserverRef.current.disconnect();
      splineRef.current = null;
    };
  }, []);
  return (
    <div className={`relative w-full h-full orb-container ${className}`}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-white" />
          </div>
        }
      >
        <div className="absolute inset-0" ref={containerRef}>
          <Spline
            scene="/orbvol2/public/scene.splinecode"
            wasmPath="/orbvol2/public/"
            className="w-full h-full"
            onLoad={handleLoad}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default Orb;
