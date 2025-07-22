import { useEffect, useRef, useState, lazy, Suspense } from 'react';

// Lazy load heavy dependencies to reduce initial bundle size
const ThreeCore = lazy(() => import('./ThreeCore'));

// Dynamic import for Three.js to reduce initial bundle
const loadThreeJS = async () => {
  const { Clock, Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color } = await import('three');
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
  const { createSculptureWithGeometry } = await import('shader-park-core');
  const { spCode } = await import('../sp-code');
  
  return {
    Clock,
    Scene,
    SphereGeometry,
    Vector3,
    PerspectiveCamera,
    WebGLRenderer,
    Color,
    OrbitControls,
    createSculptureWithGeometry,
    spCode
  };
};
//it is the shader i made for the music player

// Add keyframes for pulsing animation
const pulseAnimation = `
  @keyframes pulse {
    0% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.1); }
    100% { transform: translateX(-50%) scale(1); }
  }
`;

const ThreeMusicPlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [audioStatus, setAudioStatus] = useState("Connect to Audio");
  const [statusColor, setStatusColor] = useState("#333");
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [threeLoaded, setThreeLoaded] = useState(false);
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    // Detect if the device is mobile
    const checkIfMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    setIsMobile(checkIfMobile());
  }, []);

  // Load Three.js components dynamically
  useEffect(() => {
    if (!isMobile && !threeLoaded) {
      loadThreeJS().then(() => {
        setThreeLoaded(true);
      }).catch(console.error);
    }
  }, [isMobile, threeLoaded]);

  // Setup audio context and connections
  const setupAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const audioElements = document.querySelectorAll('audio, video');
      if (audioElements.length === 0) return;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      
      for (let i = 0; i < audioElements.length; i++) {
        const audioElement = audioElements[i] as HTMLMediaElement;
        if (!audioElement.paused && !audioElement.muted) {
          const source = audioContext.createMediaElementSource(audioElement);
          sourceRef.current = source;
          source.connect(analyser);
          source.connect(audioContext.destination);
          
          audioElement.addEventListener('play', () => setIsPlaying(true));
          audioElement.addEventListener('pause', () => setIsPlaying(false));
          audioElement.addEventListener('ended', () => setIsPlaying(false));
          
          setIsPlaying(true);
          break;
        }
      }
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setIsConnected(true);
      setAudioStatus("Connected to Audio");
      setStatusColor("#4CAF50");
    } catch (err) {
      console.error('Error setting up audio:', err);
      setAudioStatus(`Error: ${err.message}`);
      setStatusColor("#f44336");
    }
  };

  return (
    <>
      <style>{pulseAnimation}</style>
      <div 
        ref={containerRef} 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none'
        }} 
      />
      
      {/* Only render ThreeCore when Three.js is loaded and not on mobile */}
      {threeLoaded && !isMobile && (
        <Suspense fallback={null}>
          <ThreeCore
            containerRef={containerRef}
            analyserRef={analyserRef}
            dataArrayRef={dataArrayRef}
            isMobile={isMobile}
            isPlaying={isPlaying}
          />
        </Suspense>
      )}
      
      <button 
        className="button"
        onClick={setupAudio}
        disabled={isConnected}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          backgroundColor: statusColor,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isConnected ? 'default' : 'pointer',
          zIndex: 10,
          animation: !isConnected ? 'pulse 1.5s infinite' : 'none'
        }}
      >
        {audioStatus}
      </button>
    </>
  );
};

export default ThreeMusicPlayer;