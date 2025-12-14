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
  
  // Track the source node and connected element to manage connections
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedElementRef = useRef<HTMLAudioElement | null>(null);

  // 1. Initialize AudioContext and Analyser (Once)
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const node = ctx.createAnalyser();
    node.fftSize = 2048;
    node.smoothingTimeConstant = 0.85;
    node.minDecibels = -80;
    node.maxDecibels = -10;

    setAudioContext(ctx);
    setAnalyser(node);

    return () => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    };
  }, []);

  // 2. Connect Audio Element
  useEffect(() => {
    if (!audioContext || !analyser || !audioElement) return;
    
    // Avoid reconnecting the same element
    if (connectedElementRef.current === audioElement) return;

    try {
        // If we have a previous source, disconnect it from the graph
        if (sourceRef.current) {
            try {
                sourceRef.current.disconnect();
            } catch (e) {
                // ignore disconnect errors
            }
        }

        // Ensure CORS is set (crucial for Web Audio with external sources)
        if (!audioElement.crossOrigin) {
          audioElement.crossOrigin = "anonymous";
        }

        // Create new source
        const source = audioContext.createMediaElementSource(audioElement);
        
        // Connect: Source -> Analyser -> Destination (Speakers)
        source.connect(analyser);
        source.connect(audioContext.destination);
        
        sourceRef.current = source;
        connectedElementRef.current = audioElement;
        
        // Ensure context is running when this element plays
        const ensureRunning = () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(err => console.warn('Audio resume failed', err));
            }
        };
        
        audioElement.addEventListener('play', ensureRunning);
        
        // Cleanup listener only when element changes
        return () => {
            audioElement.removeEventListener('play', ensureRunning);
        };

    } catch (e) {
        console.error("AudioVisualizer connection error:", e);
    }
  }, [audioContext, analyser, audioElement]);

  // 3. Global Resume Handlers to unlock AudioContext
  useEffect(() => {
      if (!audioContext) return;

      const resume = () => {
          if (audioContext.state === 'suspended') {
              audioContext.resume().catch(() => {});
          }
      };

      // Add listeners to common interaction events
      const events = ['click', 'touchstart', 'keydown', 'mousedown'];
      events.forEach(event => document.addEventListener(event, resume));

      return () => {
          events.forEach(event => document.removeEventListener(event, resume));
      };
  }, [audioContext]);

  return (
    <AudioVisualizerContext.Provider value={{
      audioContext,
      analyser,
      registerAudioElement: setAudioElement,
      isReady: !!(audioContext && analyser && audioElement)
    }}>
      {children}
    </AudioVisualizerContext.Provider>
  );
}
