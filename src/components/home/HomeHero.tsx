import { Suspense } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import OrbitingLogo from "@/components/three/OrbitingLogo";
import VibrantLights from "@/components/three/VibrantLights";

const HomeHero = () => {
  return (
    <section className="group relative isolate w-full h-screen -my-8 sm:my-0 overflow-hidden bg-transparent px-6 sm:px-10">

      <div className="relative mx-auto flex w-full flex-col items-center justify-center">
        <div className="relative aspect-square w-full max-w-[720px] sm:max-w-[820px] lg:max-w-[900px] transition-transform duration-300 group-hover:scale-[1.03]">
            <Canvas
              camera={{ position: [5, 0.25, 2], fov: 95 }}
              className="relative h-full w-full"
              dpr={[12, 1.5]}
              gl={{ antialias: true }} 
              shadows={false}
            >
              <ambientLight intensity={0.5} />
              <VibrantLights intensity={16.5} />
              <Suspense fallback={null}>
                <OrbitingLogo scale={4.5} rotation={[0, 1.529, Math.PI / 2]} autoRotate={true} />
              </Suspense>
            </Canvas>
        </div>
        
      </div>
    </section>
  );
};

export default HomeHero;
