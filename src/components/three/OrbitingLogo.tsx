import { useEffect, useMemo, useRef } from "react";
import { Center } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Group, Mesh } from "three";

interface OrbitingLogoProps {
  onLoaded?: () => void;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
}

const OrbitingLogo = ({ onLoaded, scale = 2.1, position = [0, -0.05, 0], rotation = [0, 0, 0], autoRotate = true }: OrbitingLogoProps) => {
  const materials = useLoader(MTLLoader, 
    "/3DAssets/tripo_convert_672a37e7-00e5-44a2-8c06-8a91832d63d9.mtl"
  );
  const original = useLoader(
    OBJLoader,
    "/3DAssets/tripo_convert_672a37e7-00e5-44a2-8c06-8a91832d63d9.obj",
    (loader) => {
      materials.preload();
      loader.setMaterials(materials);
    }
  );
  const logoGroupRef = useRef<Group>(null);

  const model = useMemo(() => {
    const clone = original.clone();
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [original]);

  useEffect(() => {
    onLoaded?.();
  }, [model, onLoaded]);

  useFrame(({ clock }) => {
    if (!logoGroupRef.current) return;
    const baseX = rotation?.[0] ?? 0;
    const baseY = rotation?.[1] ?? 0;
    const baseZ = rotation?.[2] ?? 0;
    if (autoRotate) {
      const t = clock.getElapsedTime();
      // Spin in place around Y, preserving base rotation (including Z=90deg when passed)
      logoGroupRef.current.rotation.set(baseX, baseY + t * 0.35, baseZ);
    } else {
      // Maintain base rotation only
      logoGroupRef.current.rotation.set(baseX, baseY, baseZ);
    }
  });

  return (
    <group ref={logoGroupRef} scale={scale} position={position} rotation={rotation}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
};

export default OrbitingLogo;
