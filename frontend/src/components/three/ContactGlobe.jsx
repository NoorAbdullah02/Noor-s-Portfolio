import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RADIUS = 1.5;
const HOME = { lat: 24.42, lon: 88.98 };
const CITIES = [
  { lat: 51.5, lon: -0.1 },
  { lat: 40.7, lon: -74 },
  { lat: 35.7, lon: 139.7 },
  { lat: -33.9, lon: 151.2 },
  { lat: 25.2, lon: 55.3 },
  { lat: 1.35, lon: 103.8 },
  { lat: 52.5, lon: 13.4 },
];

function toVec(lat, lon, r = RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function Dots({ count = 1400 }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = golden * i;
      positions.set([Math.cos(theta) * radius * RADIUS, y * RADIUS, Math.sin(theta) * radius * RADIUS], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.022} color="#6366f1" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Arc({ to, delay }) {
  const line = useMemo(() => {
    const start = toVec(HOME.lat, HOME.lon);
    const end = toVec(to.lat, to.lon);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.setLength(RADIUS + start.distanceTo(end) * 0.45);
    const points = new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#9333ea", transparent: true, opacity: 0.75 });
    return new THREE.Line(geometry, material);
  }, [to]);

  useEffect(() => () => {
    line.geometry.dispose();
    line.material.dispose();
  }, [line]);

  useFrame(({ clock }) => {
    const t = ((clock.elapsedTime - delay) % 4.5) / 4.5;
    if (t < 0) {
      line.geometry.setDrawRange(0, 0);
      return;
    }
    const head = Math.min(1, t * 2);
    const tail = Math.max(0, t * 2 - 1);
    const start = Math.floor(tail * 65);
    line.geometry.setDrawRange(start, Math.max(0, Math.floor(head * 65) - start));
  });

  return <primitive object={line} />;
}

function Marker() {
  const ring = useRef();
  const position = useMemo(() => toVec(HOME.lat, HOME.lon, RADIUS + 0.01), []);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()),
    [position]
  );

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime % 1.8) / 1.8;
    ring.current.scale.setScalar(1 + t * 2.2);
    ring.current.material.opacity = 0.8 * (1 - t);
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[0.045, 24]} />
        <meshBasicMaterial color="#4f46e5" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.05, 0.065, 32]} />
        <meshBasicMaterial color="#9333ea" transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Globe() {
  const group = useRef();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.25) * 0.55;
    const targetY = Math.PI + sway + pointer.current.x * 0.3;
    const targetX = 0.35 + pointer.current.y * 0.15;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04);
  });

  return (
    <group ref={group} rotation={[0.35, Math.PI, 0]}>
      <mesh>
        <sphereGeometry args={[RADIUS * 0.985, 48, 48]} />
        <meshBasicMaterial color="#f1f0ff" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[RADIUS * 1.002, 24, 16]} />
        <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.12} />
      </mesh>
      <Dots />
      <Marker />
      {CITIES.map((c, i) => <Arc key={i} to={c} delay={i * 0.6} />)}
    </group>
  );
}

export default function ContactGlobe() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 4.4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <Globe />
    </Canvas>
  );
}
