"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface AudioVisualizerContextType {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  registerAudioElement: (element: HTMLAudioElement) => void;
  isReady: boolean;
}

const AudioVisualizerContext = createContext<AudioVisualizerContextType | null>(null);

export function useAudioVisualizer() {
  const context = useContext(AudioVisualizerContext);
  if (!context) {
    throw new Error("useAudioVisualizer must be used within an AudioVisualizerProvider");
  }
  return context;
}

export function AudioVisualizerProvider({ children }: { children: React.ReactNode }) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    // Initialize Web Audio API
    let ctx = audioContext;
    if (!ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      ctx = new AudioCtx();
      setAudioContext(ctx);
    }

    if (!analyser && ctx) {
      const node = ctx.createAnalyser();
      node.fftSize = 2048;
      node.smoothingTimeConstant = 0.85;
      node.minDecibels = -80;
      node.maxDecibels = -10;
      setAnalyser(node);
    }

    // Connect Source -> Analyser -> Destination
    if (ctx && analyser && !sourceRef.current) {
      try {
        // Ensure CORS is set on element (though it should be by consumer)
        if (!audioElement.crossOrigin) {
          audioElement.crossOrigin = "anonymous";
        }
        
        const source = ctx.createMediaElementSource(audioElement);
        sourceRef.current = source;
        source.connect(analyser);
        source.connect(ctx.destination);
      } catch (e) {
        console.warn("AudioVisualizer: Failed to create MediaElementSource", e);
      }
    }

    // Handle User Interaction to Resume Context
    const resumeContext = () => {
      if (ctx?.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    };

    audioElement.addEventListener('play', resumeContext);
    const cleanupInteraction = () => {
        document.removeEventListener('click', resumeContext);
        document.removeEventListener('touchstart', resumeContext);
        document.removeEventListener('keydown', resumeContext);
    }
    document.addEventListener('click', resumeContext);
    document.addEventListener('touchstart', resumeContext);
    document.addEventListener('keydown', resumeContext);

    return () => {
      audioElement.removeEventListener('play', resumeContext);
      cleanupInteraction();
      // Note: We do NOT close the AudioContext or disconnect the source here.
      // This is because the audio element continues to exist and play even if
      // this provider re-renders (though it shouldn't if it's at root).
      // However, if the element changes, we might have an issue.
      // But in this app, the element is provided by MusicPlayer which is a singleton sibling.
    };
  }, [audioElement, audioContext, analyser]);

  return (
    <AudioVisualizerContext.Provider value={{
      audioContext,
      analyser,
      registerAudioElement: setAudioElement,
      isReady: !!(audioContext && analyser && sourceRef.current)
    }}>
      {children}
    </AudioVisualizerContext.Provider>
  );
}
