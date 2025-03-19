import { useEffect, useRef, useState } from 'react';
import { Clock } from 'three';
import { Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSculptureWithGeometry } from 'shader-park-core';
import { spCode } from '../sp-code';
//it is the shader i made for the music player
const ThreeMusicPlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [audioStatus, setAudioStatus] = useState("Connect to Audio");
  const [statusColor, setStatusColor] = useState("#333");
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  // Add refs for cleanup
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const meshRef = useRef<any | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // THREE.JS SETUP
    let scene = new Scene();
    sceneRef.current = scene;
    
    let camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 0.1;

    let renderer = new WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    rendererRef.current = renderer;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(new Color(1, 1, 1), 0);
    containerRef.current.appendChild(renderer.domElement);

    let clock = new Clock();

    // STATE MANAGEMENT
    let state = {
      mouse: new Vector3(),
      currMouse: new Vector3(),
      pointerDown: 0.0,
      currPointerDown: 0.0,
      audio: 0.0,
      currAudio: 0.0,
      time: 0.0
    };

    // EVENT LISTENERS
    const handlePointerMove = (event: PointerEvent) => {
      state.currMouse.x = ((event.clientX / window.innerWidth) * 2 - 1) * 0.5;
      state.currMouse.y = (-(event.clientY / window.innerHeight) * 2 + 1) * 0.5;
    };

    const handlePointerDown = () => state.currPointerDown = 1.0;
    const handlePointerUp = () => state.currPointerDown = 0.0;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // GEOMETRY AND MESH SETUP
    let geometry = new SphereGeometry(2, 32, 32);

    let mesh = createSculptureWithGeometry(geometry, spCode(), () => ({
      time: state.time,
      pointerDown: state.pointerDown,
      audio: state.audio,
      mouse: state.mouse,
      _scale: .5
    }));
    meshRef.current = mesh;

    scene.add(mesh);

    // CONTROLS
    let controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.zoomSpeed = 0.5;
    controls.rotateSpeed = 0.5;

    // RESIZE HANDLER
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // RENDER LOOP
    const render = () => {
      // Only request animation frame if component is still mounted
      if (!rendererRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(render);
      state.time += clock.getDelta();
      controls.update();
      
      // Get audio data if available
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Use bass frequencies for better visualization
        const bassValue = dataArrayRef.current[2] / 255; // Bass frequency
        
        state.currAudio += Math.pow(bassValue * 0.81, 9) + clock.getDelta() * 0.3;
        state.audio = 0.2 * state.currAudio + 0.8 * state.audio;
      }
      
      state.pointerDown = 0.1 * state.currPointerDown + 0.9 * state.pointerDown;
      state.mouse.lerp(state.currMouse, 0.02);
      
      // Only render if component is still mounted
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    // CLEANUP
    return () => {
      console.log("Cleaning up ThreeMusicPlayer");
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      
      // Cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Dispose of Three.js objects
      if (meshRef.current) {
        if (sceneRef.current) {
          sceneRef.current.remove(meshRef.current);
        }
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose();
        }
        if (meshRef.current.material) {
          if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach((material: any) => material.dispose());
          } else {
            meshRef.current.material.dispose();
          }
        }
        meshRef.current = null;
      }
      
      // Dispose of controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      
      // Dispose of renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
      
      // Clean up audio connections
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      
      // Clear scene
      if (sceneRef.current) {
        while(sceneRef.current.children.length > 0) { 
          const object = sceneRef.current.children[0];
          sceneRef.current.remove(object);
        }
        sceneRef.current = null;
      }
    };
  }, []);

  // CONNECT TO AUDIO
  const connectToAudio = async () => {
    try {
      setAudioStatus("Connecting...");
      setStatusColor("#FFA500"); // Orange for in-progress
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Find all audio and video elements on the page
      const audioElements = document.querySelectorAll('audio, video');
      
      if (audioElements.length === 0) {
        throw new Error('No audio or video elements found on the page');
      }
      
      // Log found elements for debugging
      console.log(`Found ${audioElements.length} audio/video elements`);
      
      // Create analyzer
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32; // Must be a power of 2
      
      // Variable to track if we successfully connected to any element
      let connectedToAudio = false;
      
      // Try to connect to each audio element
      for (let i = 0; i < audioElements.length; i++) {
        try {
          const audioElement = audioElements[i] as HTMLMediaElement;
          
          // Try to connect only if the element is not paused
          if (!audioElement.paused && !audioElement.muted) {
            console.log(`Connecting to playing audio element #${i}:`, audioElement);
            
            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            connectedToAudio = true;
            console.log(`Successfully connected to element #${i}`);
            break; // Once connected to one element, we're done
          } else {
            console.log(`Audio element #${i} is paused or muted, skipping`);
          }
        } catch (err) {
          console.warn(`Failed to connect to element #${i}:`, err);
        }
      }
      
      if (!connectedToAudio) {
        // Try to find any embedded players
        const embeddedPlayers = document.querySelectorAll('iframe');
        if (embeddedPlayers.length > 0) {
          console.log(`Found ${embeddedPlayers.length} iframes that might contain audio`);
          throw new Error('Audio appears to be in an iframe (YouTube/Spotify?) which cannot be accessed directly');
        } else {
          throw new Error('No playing audio elements found');
        }
      }
      
      // Create data array for frequency data
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Store references for the render loop to access
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      
      setIsConnected(true);
      setAudioStatus("Connected to Audio");
      setStatusColor("#4CAF50");
      
      console.log("Successfully connected to web audio!");
    } catch (err) {
      console.error('Error connecting to audio:', err);
      setAudioStatus(`Error: ${err.message}`);
      setStatusColor("#f44336");
      
      // Allow retry
      setTimeout(() => {
        setAudioStatus("Connect to Audio");
        setStatusColor("#333");
        setIsConnected(false);
      }, 5000);
    }
  };

  return (
    <>
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
      
      <button 
        className="button"
        onClick={connectToAudio}
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
          zIndex: 10
        }}
      >
        {audioStatus}
      </button>
    </>
  );
};

export default ThreeMusicPlayer;