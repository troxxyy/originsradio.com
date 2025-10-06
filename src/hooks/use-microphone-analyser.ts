import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MicrophoneAnalyserStatus = "idle" | "starting" | "ready" | "error";

export interface MicrophoneAnalyserOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

interface MicrophoneAnalyserState {
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  source: MediaStreamAudioSourceNode | null;
  stream: MediaStream | null;
  status: MicrophoneAnalyserStatus;
  error: string | null;
}

const createInitialState = (): MicrophoneAnalyserState => ({
  analyser: null,
  audioContext: null,
  source: null,
  stream: null,
  status: "idle",
  error: null,
});

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Microphone access failed";
};

const closeContext = (context: AudioContext | null) => {
  if (!context) {
    return;
  }

  if (context.state === "closed") {
    return;
  }

  // Calling close can throw if the context is already closing; best effort clean-up.
  context.close().catch(() => undefined);
};

export const useMicrophoneAnalyser = (options: MicrophoneAnalyserOptions = {}) => {
  const [state, setState] = useState<MicrophoneAnalyserState>(() => createInitialState());
  const startInFlightRef = useRef(false);

  const normalizedOptions = useMemo(
    () => ({
      fftSize: options.fftSize ?? 1024,
      smoothingTimeConstant: options.smoothingTimeConstant ?? 0.85,
      minDecibels: options.minDecibels ?? -80,
      maxDecibels: options.maxDecibels ?? -10,
    }),
    [options.fftSize, options.smoothingTimeConstant, options.minDecibels, options.maxDecibels]
  );

  const isBrowser = typeof window !== "undefined";
  const hasAudioContext = isBrowser && Boolean(window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  const canRequestMicrophone =
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const isSupported = hasAudioContext && canRequestMicrophone;

  const stop = useCallback(() => {
    setState((previous) => {
      previous.source?.disconnect();
      previous.stream?.getTracks().forEach((track) => track.stop());
      closeContext(previous.audioContext);

      return createInitialState();
    });
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (!isSupported) {
      const message = "Microphone capture is not supported in this environment.";
      setState((prev) => ({ ...prev, status: "error", error: message }));
      throw new Error(message);
    }

    if (startInFlightRef.current || state.status === "ready") {
      return;
    }

    startInFlightRef.current = true;
    setState((prev) => ({ ...prev, status: "starting", error: null }));

    try {
      const AudioCtx = (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as
        | typeof AudioContext
        | undefined;

      if (!AudioCtx) {
        throw new Error("Web Audio API is not available.");
      }

      const audioContext = new AudioCtx();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = normalizedOptions.fftSize;
      analyser.smoothingTimeConstant = normalizedOptions.smoothingTimeConstant;
      analyser.minDecibels = normalizedOptions.minDecibels;
      analyser.maxDecibels = normalizedOptions.maxDecibels;

      source.connect(analyser);

      if (audioContext.state === "suspended") {
        const resume = () => {
          audioContext.resume().catch(() => undefined);
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
        };

        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      }

      setState({ analyser, audioContext, source, stream, status: "ready", error: null });
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("[useMicrophoneAnalyser]", message, error);
      setState((prev) => ({ ...prev, status: "error", error: message }));
      throw error;
    } finally {
      startInFlightRef.current = false;
    }
  }, [isSupported, normalizedOptions, state.status]);

  return {
    analyser: state.analyser,
    start,
    stop,
    status: state.status,
    error: state.error,
    isSupported,
  };
};

export type UseMicrophoneAnalyserReturn = ReturnType<typeof useMicrophoneAnalyser>;

