import { useEffect, useRef } from 'react';
import { Clock, Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSculptureWithGeometry } from 'shader-park-core';
import { spCode } from '../sp-code';

interface ThreeCoreProps {
  containerRef: React.RefObject<HTMLDivElement>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  dataArrayRef: React.RefObject<Uint8Array | null>;
  isMobile: boolean;
  isPlaying: boolean;
}

const ThreeCore = ({ containerRef, analyserRef, dataArrayRef, isMobile, isPlaying }: ThreeCoreProps) => {
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
    
    let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    let renderer = new WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new Color(0x000000), 0);
    containerRef.current.appendChild(renderer.domElement);

    // Controls setup
    let controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = !isMobile;

    // Create shader sculpture
    let sculptureSettings = {
      time: 0,
      mouse: new Vector3(0, 0, 0),
      audio: 0
    };

    let mesh = createSculptureWithGeometry(
      new SphereGeometry(1, 32, 32),
      spCode(),
      () => sculptureSettings
    );
    meshRef.current = mesh;
    scene.add(mesh);

    // Animation loop
    const clock = new Clock();
    
    const animate = () => {
      if (!renderer || !scene || !camera || !controls || !mesh) return;
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Update time
      sculptureSettings.time = clock.getElapsedTime();
      
      // Update audio data
      if (analyserRef.current && dataArrayRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const average = Array.from(dataArrayRef.current).reduce((a, b) => a + b) / dataArrayRef.current.length;
        sculptureSettings.audio = average / 255;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      if (meshRef.current) {
        sceneRef.current?.remove(meshRef.current);
      }
    };
  }, [containerRef, analyserRef, dataArrayRef, isMobile, isPlaying]);

  return null; // This component doesn't render anything directly
};

export default ThreeCore;