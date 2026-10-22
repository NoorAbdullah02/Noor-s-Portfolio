import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const pointer = { x: 0, y: 0 };

function usePointer() {
  useEffect(() => {
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}

function Core() {
  const shell = useRef();
  const inner = useRef();

  useFrame((state, delta) => {
    if (shell.current) {
      shell.current.rotation.x += delta * 0.08;
      shell.current.rotation.y -= delta * 0.12;
    }
    if (inner.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <group>
        <mesh ref={inner}>
          <icosahedronGeometry args={[1, 24]} />
          <MeshDistortMaterial
            color="#6d5dfc"
            emissive="#3b1d8f"
            emissiveIntensity={0.35}
            distort={0.38}
            speed={1.8}
            roughness={0.15}
            metalness={0.35}
          />
        </mesh>
        <mesh ref={shell} scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.28} />
        </mesh>
      </group>
    </Float>
  );
}

function Orbit({ radius, tilt, speed, color, size = 0.09, shape = "octa" }) {
  const group = useRef();
  const body = useRef();

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * speed;
    if (body.current) {
      body.current.rotation.x += delta * 1.2;
      body.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.006, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <group ref={group}>
        <mesh ref={body} position={[radius, 0, 0]}>
          {shape === "octa" && <octahedronGeometry args={[size, 0]} />}
          {shape === "box" && <boxGeometry args={[size * 1.4, size * 1.4, size * 1.4]} />}
          {shape === "torus" && <torusGeometry args={[size, size * 0.35, 12, 32]} />}
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ParticleShell({ count = 900 }) {
  const ref = useRef();
  const geometry = useMemo(() => {
    const random = seededRandom(42);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color("#4f46e5"), new THREE.Color("#9333ea"), new THREE.Color("#0ea5e9")];
    for (let i = 0; i < count; i++) {
      const r = 2.6 + random() * 1.6;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[i % palette.length];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;
    ref.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Rig({ children }) {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.35, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.25, 0.05);
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ active = true }) {
  usePointer();

  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.5]} camera={{ position: [0, 0, 6.2], fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 4, 5]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-4, -2, 3]} color="#0ea5e9" intensity={3} distance={12} />
        <pointLight position={[3, -3, 2]} color="#c026d3" intensity={2.5} distance={12} />

        <Rig>
          <group position={[0.3, 0.2, 0]}>
            <Core />
            <Orbit radius={2.1} tilt={[0.35, 0, 0.25]} speed={0.45} color="#818cf8" shape="octa" />
            <Orbit radius={2.55} tilt={[-0.5, 0.2, -0.3]} speed={-0.3} color="#c084fc" shape="torus" size={0.08} />
            <Orbit radius={1.75} tilt={[1.1, 0.4, 0]} speed={0.6} color="#38bdf8" shape="box" size={0.07} />
          </group>
          <ParticleShell />
        </Rig>
        <Sparkles count={40} scale={[6, 6, 4]} size={2.2} speed={0.3} color="#a78bfa" opacity={0.5} />
      </Suspense>
    </Canvas>
  );
}
