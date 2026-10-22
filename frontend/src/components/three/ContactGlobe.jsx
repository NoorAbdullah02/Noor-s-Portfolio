import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAND_MASK, LAND_W, LAND_H } from "./landMask";

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
  { lat: 37.6, lon: -122.4 },
  { lat: 43.7, lon: -79.4 },
];

function toVec(lat, lon, r = RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

let landBits;
function isLand(lat, lon) {
  if (!landBits) landBits = Uint8Array.from(atob(LAND_MASK), (c) => c.charCodeAt(0));
  const row = Math.min(LAND_H - 1, Math.max(0, Math.floor(90 - lat)));
  const col = Math.min(LAND_W - 1, Math.max(0, Math.floor(lon + 180)));
  const idx = row * LAND_W + col;
  return (landBits[idx >> 3] >> (idx & 7)) & 1;
}

const dotVertex = `
  attribute float aShade;
  varying float vShade;
  varying float vFacing;
  uniform float uSize;
  uniform float uPixelRatio;
  void main() {
    vShade = aShade;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);
    gl_PointSize = uSize * uPixelRatio * (4.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const dotFragment = `
  varying float vShade;
  varying float vFacing;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * (0.35 + 0.65 * vFacing);
    vec3 col = mix(uColorA, uColorB, vShade);
    gl_FragColor = vec4(col, alpha);
  }
`;

function LandDots({ samples = 22000 }) {
  const { geometry, material } = useMemo(() => {
    const positions = [];
    const shades = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < samples; i++) {
      const y = 1 - (i / (samples - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const lat = THREE.MathUtils.radToDeg(Math.asin(y));
      const lon = ((THREE.MathUtils.radToDeg(Math.atan2(z, -x)) + 540) % 360) - 180;
      if (!isLand(lat, lon)) continue;
      const p = toVec(lat, lon, RADIUS * 1.003);
      positions.push(p.x, p.y, p.z);
      shades.push((lat + 60) / 140);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("aShade", new THREE.Float32BufferAttribute(shades, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: dotVertex,
      fragmentShader: dotFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: 3.2 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
        uColorA: { value: new THREE.Color("#0ea5e9") },
        uColorB: { value: new THREE.Color("#7c3aed") },
      },
    });
    return { geometry: g, material: m };
  }, [samples]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <points geometry={geometry} material={material} />;
}

const atmosphereVertex = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragment = `
  varying vec3 vNormal;
  uniform vec3 uColor;
  void main() {
    float facing = clamp(-dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    gl_FragColor = vec4(uColor, clamp(pow(facing, 1.4) * 1.35, 0.0, 0.75));
  }
`;

function Atmosphere() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color("#8b5cf6") } },
  }), []);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh scale={1.18} material={material}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
    </mesh>
  );
}

const baseFragment = `
  varying vec3 vNormal;
  void main() {
    float facing = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float highlight = pow(clamp(dot(vNormal, normalize(vec3(-0.4, 0.5, 0.75))), 0.0, 1.0), 6.0);
    vec3 col = mix(vec3(0.78, 0.80, 0.99), vec3(0.98, 0.98, 1.0), pow(facing, 0.7));
    col += highlight * 0.08;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function BaseSphere() {
  const material = useMemo(() => new THREE.ShaderMaterial({ vertexShader: atmosphereVertex, fragmentShader: baseFragment }), []);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
    </mesh>
  );
}

function Arc({ to, delay }) {
  const head = useRef();
  const { line, curve } = useMemo(() => {
    const start = toVec(HOME.lat, HOME.lon);
    const end = toVec(to.lat, to.lon);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.setLength(RADIUS + start.distanceTo(end) * 0.42);
    const c = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = c.getPoints(80);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const colors = new Float32Array(points.length * 3);
    const a = new THREE.Color("#6366f1");
    const b = new THREE.Color("#ec4899");
    points.forEach((_, i) => {
      const col = a.clone().lerp(b, i / (points.length - 1));
      colors.set([col.r, col.g, col.b], i * 3);
    });
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 });
    return { line: new THREE.Line(geometry, material), curve: c };
  }, [to]);

  useEffect(() => () => {
    line.geometry.dispose();
    line.material.dispose();
  }, [line]);

  useFrame(({ clock }) => {
    const raw = (clock.elapsedTime - delay) % 5;
    if (raw < 0) {
      line.geometry.setDrawRange(0, 0);
      if (head.current) head.current.visible = false;
      return;
    }
    const t = raw / 5;
    const grow = Math.min(1, t * 2.2);
    const fade = Math.max(0, t * 2.2 - 1.2);
    const startIdx = Math.floor(fade * 81);
    line.geometry.setDrawRange(startIdx, Math.max(0, Math.floor(grow * 81) - startIdx));
    if (head.current) {
      head.current.visible = grow < 1;
      head.current.position.copy(curve.getPoint(grow));
    }
  });

  return (
    <group>
      <primitive object={line} />
      <mesh ref={head}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#f472b6" />
      </mesh>
    </group>
  );
}

function Pulse({ lat, lon, color = "#7c3aed", size = 0.04, speed = 1.8 }) {
  const ring = useRef();
  const position = useMemo(() => toVec(lat, lon, RADIUS + 0.012), [lat, lon]);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()),
    [position]
  );
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime % speed) / speed;
    ring.current.scale.setScalar(1 + t * 2.6);
    ring.current.material.opacity = 0.9 * (1 - t);
  });
  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[size, 24]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[size * 1.1, size * 1.45, 32]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} depthWrite={false} />
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

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.18) * 0.4;
    const targetY = Math.PI + sway + pointer.current.x * 0.2;
    const targetX = 0.32 + pointer.current.y * 0.12;
    const k = 1 - Math.pow(0.001, delta);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, k * 0.5);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, k * 0.5);
  });

  return (
    <group ref={group} rotation={[0.32, Math.PI, 0]}>
      <BaseSphere />
      <mesh>
        <sphereGeometry args={[RADIUS * 1.001, 36, 18]} />
        <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.07} />
      </mesh>
      <LandDots />
      <Pulse lat={HOME.lat} lon={HOME.lon} color="#4f46e5" size={0.045} />
      {CITIES.map((c, i) => <Pulse key={i} lat={c.lat} lon={c.lon} color="#db2777" size={0.022} speed={2.4 + i * 0.15} />)}
      {CITIES.map((c, i) => <Arc key={i} to={c} delay={i * 0.55} />)}
    </group>
  );
}

export default function ContactGlobe({ active = true }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[-3, 3, 5]} intensity={0.8} />
      <Atmosphere />
      <Globe />
    </Canvas>
  );
}
