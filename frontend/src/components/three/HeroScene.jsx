import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";

function RotatingBlob() {
  const mesh = useRef();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.1;
    mesh.current.rotation.y += delta * 0.14;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={mesh} position={[0.4, 0.6, -1.5]} scale={1.1}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#818cf8"
          distort={0.32}
          speed={1.6}
          roughness={0.25}
          metalness={0.1}
          transparent
          opacity={0.55}
        />
      </mesh>
    </Float>
  );
}

function RingAccent() {
  const mesh = useRef();
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.z += delta * 0.1;
  });
  return (
    <mesh ref={mesh} position={[-0.3, -1, -1.8]} rotation={[1.1, 0.4, 0]}>
      <torusGeometry args={[0.7, 0.045, 16, 100]} />
      <meshStandardMaterial color="#c084fc" roughness={0.3} metalness={0.3} transparent opacity={0.6} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 3, 4]} intensity={1} />
        <pointLight position={[-3, -2, 2]} color="#0ea5e9" intensity={0.5} />

        <RotatingBlob />
        <RingAccent />
        <Sparkles count={45} scale={[4, 4, 3]} size={2} speed={0.25} color="#9333ea" opacity={0.45} />
      </Suspense>
    </Canvas>
  );
}
