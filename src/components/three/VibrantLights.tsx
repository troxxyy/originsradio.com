import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Color } from "three";

interface VibrantLightsProps {
  intensity?: number;
}

const VibrantLights = ({ intensity = 1.2 }: VibrantLightsProps) => {
  const groupRef = useRef<Group>(null);
  const lastUpdateRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;

    // Throttle updates to ~15fps to reduce CPU/GPU load
    const now = t;
    const dt = now - lastUpdateRef.current;
    if (dt < 1 / 15) return;
    lastUpdateRef.current = now;

    const colors = [
      new Color().setHSL(((t * 0.06) % 1 + 0.0), 0.9, 0.55),
      new Color().setHSL(((t * 0.08) % 1 + 0.33) % 1, 0.85, 0.5),
      new Color().setHSL(((t * 0.07) % 1 + 0.66) % 1, 0.9, 0.6)
    ];

    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const light: any = children[i];
      if (light && light.color && light.intensity != null) {
        light.color.copy(colors[i % colors.length]);
        light.intensity = intensity * (0.85 + 0.1 * Math.sin(t * (0.8 + i * 0.2)));
      }
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight position={[3, 3, 4]} intensity={intensity} distance={8} decay={2} />
      <pointLight position={[-3, 2, -3]} intensity={intensity * 0.85} distance={8} decay={2} />
      <pointLight position={[0, -1.5, 2]} intensity={intensity * 0.75} distance={6} decay={2} />
    </group>
  );
};

export default VibrantLights;


