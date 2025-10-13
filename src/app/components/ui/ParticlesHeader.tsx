import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const ParticlesHeader = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: 0
        },
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        particles: {
          color: {
            value: ["#60a5fa", "#38bdf8", "#22d3ee"], // blue-400, sky-400, cyan-400
          },
          move: {
            direction: "bottom-right",
            enable: true,
            outModes: {
              default: "out",
            },
            random: false,
            speed: isMobile 
              ? { min: 15, max: 30 } 
              : { min: 20, max: 40 },
            straight: true,
            trail: {
              enable: true,
              length: isMobile ? 10 : 15,
              fillColor: "#020617" // slate-950 - much darker
            },
          },
          number: {
            density: {
              enable: true,
              area: isMobile ? 1200 : 1800,
            },
            value: isMobile ? 6 : 12,
            limit: isMobile ? 8 : 15,
          },
          opacity: {
            value: { min: 0.1, max: 0.6 }, // reduced opacity
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.1,
              sync: false
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: isMobile 
              ? { min: 0.8, max: 2 }
              : { min: 1, max: 2.5 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
              sync: false
            },
          },
          life: {
            duration: {
              sync: false,
              value: isMobile ? 3 : 4
            },
            count: 1,
            delay: {
              random: {
                enable: true,
                minimumValue: isMobile ? 0.3 : 0.2
              },
              value: isMobile ? 1.5 : 1,
              sync: false
            }
          },
          twinkle: {
            particles: {
              enable: true,
              frequency: 0.1,
              opacity: 1,
            },
          },
        },
        detectRetina: true,
        responsive: [
          {
            maxWidth: 768,
            options: {
              particles: {
                move: {
                  speed: { min: 15, max: 30 },
                  trail: {
                    length: 10
                  }
                },
                number: {
                  density: {
                    area: 1200
                  },
                  value: 6,
                  limit: 8
                },
                size: {
                  value: { min: 0.8, max: 2 }
                }
              }
            }
          }
        ]
      }}
    />
  );
};

export default ParticlesHeader; 