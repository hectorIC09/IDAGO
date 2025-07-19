import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          number: { value: 50 },
          color: { value: "#555" },
          shape: { type: "circle" },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          move: { speed: 2, direction: "none", outMode: "out" },
          line_linked: { enable: true, distance: 150, color: "#ffffff" },
        },
        background: { color: "#0d3f74" },
      }}
    />
  );
};

export default ParticlesBackground;
