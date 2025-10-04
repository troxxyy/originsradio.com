import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";

import OrbitingLogo from "./OrbitingLogo";

type Bounds = {
  x: [number, number];
  y: [number, number];
  z: [number, number];
};

interface BouncingLogoProps {
  scale?: number;
  bounds?: Bounds;
  minSpeed?: number;
  maxSpeed?: number;
  flexibility?: number;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const randomSign = () => (Math.random() > 0.5 ? 1 : -1);

const defaultBounds: Bounds = {
  x: [-2.25, 2.25],
  y: [-1.4, 1.4],
  z: [-0.9, 0.9],
};

const BouncingLogo = ({
  scale = 3,
  bounds = defaultBounds,
  minSpeed = 0.75,
  maxSpeed = 1.35,
  flexibility = 0.1,
}: BouncingLogoProps) => {
  const groupRef = useRef<Group>(null);

  const scaleStateRef = useRef({
    current: new Vector3(1, 1, 1),
    velocity: new Vector3(),
  });
  const restScale = useMemo(() => new Vector3(1, 1, 1), []);
  const tempVec = useMemo(() => new Vector3(), []);

  const startPosition = useMemo(
    () =>
      new Vector3(
        randomBetween(bounds.x[0] * 0.6, bounds.x[1] * 0.6),
        randomBetween(bounds.y[0] * 0.6, bounds.y[1] * 0.6),
        randomBetween(bounds.z[0] * 0.4, bounds.z[1] * 0.4)
      ),
    [bounds]
  );

  const velocityRef = useRef(
    new Vector3(
      randomSign() * randomBetween(minSpeed, maxSpeed),
      randomSign() * randomBetween(minSpeed, maxSpeed),
      randomSign() * randomBetween(minSpeed * 0.35, maxSpeed * 0.35)
    )
  );

  const spinRef = useRef(
    new Vector3(
      MathUtils.degToRad(randomBetween(10, 25)) * randomSign(),
      MathUtils.degToRad(randomBetween(15, 35)) * randomSign(),
      MathUtils.degToRad(randomBetween(10, 25)) * randomSign()
    )
  );

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(startPosition);
  }, [startPosition]);

  const triggerSquish = (axis: "x" | "y" | "z", impact: number) => {
    const { current, velocity } = scaleStateRef.current;
    const normalizedImpact = MathUtils.clamp(impact / Math.max(maxSpeed, 0.0001), 0, 1);
    const intensity = MathUtils.clamp((0.35 + normalizedImpact * 0.65) * flexibility, 0, 0.9);

    const compress = MathUtils.clamp(1 - intensity, 0.55, 1);
    const stretchPrimary = MathUtils.clamp(1 + intensity * 0.8, 1, 1.55);
    const stretchSecondary = MathUtils.clamp(1 + intensity * 0.4, 0.85, 1.35);

    velocity.setScalar(0);

    if (axis === "x") {
      current.set(compress, stretchPrimary, stretchSecondary);
    } else if (axis === "y") {
      current.set(stretchSecondary, compress, stretchPrimary);
    } else {
      current.set(stretchPrimary, stretchSecondary, compress);
    }
  };

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const velocity = velocityRef.current;
    const spin = spinRef.current;
    const scaleState = scaleStateRef.current;

    group.position.addScaledVector(velocity, delta);

    if (group.position.x < bounds.x[0] || group.position.x > bounds.x[1]) {
      const impact = Math.abs(velocity.x);
      group.position.x = MathUtils.clamp(group.position.x, bounds.x[0], bounds.x[1]);
      triggerSquish("x", impact);
      velocity.x *= -1;
    }
    if (group.position.y < bounds.y[0] || group.position.y > bounds.y[1]) {
      const impact = Math.abs(velocity.y);
      group.position.y = MathUtils.clamp(group.position.y, bounds.y[0], bounds.y[1]);
      triggerSquish("y", impact);
      velocity.y *= -1;
    }
    if (group.position.z < bounds.z[0] || group.position.z > bounds.z[1]) {
      const impact = Math.abs(velocity.z);
      group.position.z = MathUtils.clamp(group.position.z, bounds.z[0], bounds.z[1]);
      triggerSquish("z", impact);
      velocity.z *= -1;
    }

    group.rotation.x += spin.x * delta;
    group.rotation.y += spin.y * delta;
    group.rotation.z += spin.z * delta;

    group.scale.copy(scaleState.current);

    tempVec.copy(restScale).sub(scaleState.current);
    scaleState.velocity.addScaledVector(tempVec, 16 * delta);
    scaleState.velocity.multiplyScalar(Math.exp(-7 * delta));
    scaleState.current.addScaledVector(scaleState.velocity, delta);
  });

  return (
    <group ref={groupRef}>
      <OrbitingLogo scale={scale} autoRotate={false} position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </group>
  );
};

export default BouncingLogo;
