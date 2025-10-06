import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AudioAnalyserStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "error";

export interface AudioAnalyserOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
  loop?: boolean;
  initialVolume?: number;
}

interface AudioAnalyserState {
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  source: MediaElementAudioSourceNode | null;
  element: HTMLAudioElement | null;
  status: AudioAnalyserStatus;
  error: string | null;
  currentTime: number;
  duration: number;
}

const createInitialState = (): AudioAnalyserState => ({
  analyser: null,
  audioContext: null,
  source: null,
  element: null,
  status: "idle",
  error: null,
  currentTime: 0,
  duration: 0,
});

const resumeContext = (context: AudioContext | null | undefined) => {
  if (!context) {
    return Promise.resolve();
  }

  if (context.state === "suspended") {
    return context.resume().catch(() => undefined);
  }
  return Promise.resolve();
};

export const useAudioAnalyser = (src: string, options: AudioAnalyserOptions = {}) => {
  const [state, setState] = useState<AudioAnalyserState>(() => createInitialState());
  const progressRaf = useRef<number>();
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  const analyserOptions = useMemo(
    () => ({
      fftSize: options.fftSize ?? 1024,
      smoothingTimeConstant: options.smoothingTimeConstant ?? 0.85,
      minDecibels: options.minDecibels ?? -80,
      maxDecibels: options.maxDecibels ?? -10,
      loop: options.loop ?? true,
      initialVolume: options.initialVolume ?? 1,
    }),
    [options.fftSize, options.smoothingTimeConstant, options.minDecibels, options.maxDecibels, options.loop, options.initialVolume]
  );

  const cleanup = useCallback(() => {
    cancelAnimationFrame(progressRaf.current ?? 0);

    setState((previous) => {
      previous.element?.pause();
      previous.element?.removeAttribute("src");
      previous.element?.load();
      previous.source?.disconnect();
      previous.analyser?.disconnect();

      if (previous.audioContext && previous.audioContext.state !== "closed") {
        previous.audioContext.close().catch(() => undefined);
      }

      return createInitialState();
    });
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const updateProgress = useCallback(() => {
    setState((prev) => {
      if (!prev.element) {
        return prev;
      }

      const { currentTime, duration } = prev.element;
      if (prev.currentTime !== currentTime || prev.duration !== duration) {
        return { ...prev, currentTime, duration };
      }
      return prev;
    });

    progressRaf.current = requestAnimationFrame(updateProgress);
  }, []);

  const load = useCallback(async () => {
    if (!src) {
      setState((prev) => ({ ...prev, status: "error", error: "Audio source is empty." }));
      return Promise.resolve();
    }

    if (state.status !== "idle" && state.status !== "error") {
      return Promise.resolve();
    }

    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    const promise = (async () => {
      try {
        setState((prev) => ({ ...prev, status: "loading", error: null }));

        const AudioCtx = (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as
          | typeof AudioContext
          | undefined;

        if (!AudioCtx) {
          throw new Error("Web Audio API is not supported in this browser.");
        }

        const audioContext = new AudioCtx();
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = analyserOptions.fftSize;
        analyser.smoothingTimeConstant = analyserOptions.smoothingTimeConstant;
        analyser.minDecibels = analyserOptions.minDecibels;
        analyser.maxDecibels = analyserOptions.maxDecibels;

        const element = new Audio();
        element.src = src;
        element.crossOrigin = "anonymous";
        element.loop = analyserOptions.loop;
        element.preload = "auto";
        element.volume = analyserOptions.initialVolume;

        await new Promise<void>((resolve, reject) => {
          const handleCanPlay = () => {
            element.removeEventListener("canplay", handleCanPlay);
            element.removeEventListener("error", handleError);
            resolve();
          };

          const handleError = () => {
            element.removeEventListener("canplay", handleCanPlay);
            element.removeEventListener("error", handleError);
            reject(new Error("Failed to load audio source."));
          };

          element.addEventListener("canplay", handleCanPlay, { once: true });
          element.addEventListener("error", handleError, { once: true });
          element.load();
        });

        const source = audioContext.createMediaElementSource(element);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        setState({
          analyser,
          audioContext,
          source,
          element,
          status: "ready",
          error: null,
          currentTime: element.currentTime,
          duration: element.duration,
        });

        progressRaf.current = requestAnimationFrame(updateProgress);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[useAudioAnalyser]", message, error);
        setState((prev) => ({ ...prev, status: "error", error: message }));
      } finally {
        loadPromiseRef.current = null;
      }
    })();

    loadPromiseRef.current = promise;
    return promise;
  }, [src, state.status, analyserOptions, updateProgress]);

  const play = useCallback(async () => {
    await load();

    let element: HTMLAudioElement | null = null;
    let audioContext: AudioContext | null = null;

    setState((prev) => {
      element = prev.element;
      audioContext = prev.audioContext;
      if (!element || !audioContext) {
        return prev;
      }
      return { ...prev, status: "playing" };
    });

    await resumeContext(audioContext);

    try {
      await element?.play();
    } catch (error) {
      console.error("[useAudioAnalyser] play error", error);
      setState((prev) => ({ ...prev, status: "error", error: "Playback failed" }));
    }
  }, [load]);

  const pause = useCallback(() => {
    setState((prev) => {
      prev.element?.pause();
      if (prev.status === "playing") {
        return { ...prev, status: "paused" };
      }
      return prev;
    });
  }, []);

  const togglePlayback = useCallback(() => {
    setState((prev) => {
      if (!prev.element) {
        return prev;
      }

      if (prev.status === "playing") {
        prev.element.pause();
        return { ...prev, status: "paused" };
      }

      void resumeContext(prev.audioContext);
      prev.element.play().catch((error) => {
        console.error("[useAudioAnalyser] toggle play error", error);
      });
      return { ...prev, status: "playing" };
    });
  }, []);

  const seek = useCallback((time: number) => {
    setState((prev) => {
      if (!prev.element) {
        return prev;
      }

      const clamped = Math.max(0, Math.min(time, prev.element.duration || 0));
      prev.element.currentTime = clamped;
      return { ...prev, currentTime: clamped };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => {
      if (!prev.element) {
        return prev;
      }

      const clamped = Math.min(1, Math.max(0, volume));
      prev.element.volume = clamped;
      return prev;
    });
  }, []);

  const isPlaying = state.status === "playing";
  const isReady = state.status === "ready" || state.status === "playing" || state.status === "paused";

  return {
    analyser: state.analyser,
    status: state.status,
    error: state.error,
    currentTime: state.currentTime,
    duration: state.duration,
    element: state.element,
    isReady,
    isPlaying,
    load,
    play,
    pause,
    togglePlayback,
    seek,
    setVolume,
    cleanup,
  };
};

export type UseAudioAnalyserReturn = ReturnType<typeof useAudioAnalyser>;
