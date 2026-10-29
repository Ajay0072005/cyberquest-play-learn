import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Attack, ATTACK_INFO, CITIES } from './threatData';

const R = 2;
const ARC_LIFE = 3.2; // seconds per attack arc

function toVec(lat: number, lon: number, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Dotted-sphere "landmass" look generated procedurally (fibonacci distribution).
function DotSphere() {
  const geo = useMemo(() => {
    const n = 2600, pts: number[] = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), t = i * 2.39996;
      pts.push(Math.cos(t) * rad * R * 1.001, y * R * 1.001, Math.sin(t) * rad * R * 1.001);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return <points geometry={geo}><pointsMaterial color="#5b6b85" size={0.018} transparent opacity={0.7} /></points>;
}

function ArcLine({ attack, onSelect }: { attack: Attack; onSelect: (a: Attack) => void }) {
  const { curve, geom } = useMemo(() => {
    const a = toVec(attack.from.lat, attack.from.lon), b = toVec(attack.to.lat, attack.to.lon);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(R + a.distanceTo(b) * 0.45);
    const c = new THREE.QuadraticBezierCurve3(a, mid, b);
    return { curve: c, geom: new THREE.TubeGeometry(c, 48, 0.008, 6, false) };
  }, [attack]);
  const head = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const born = useRef<number | null>(null);
  const color = ATTACK_INFO[attack.type].color;
  const target = useMemo(() => toVec(attack.to.lat, attack.to.lon, R * 1.002), [attack]);

  useFrame(({ clock }) => {
    if (born.current === null) born.current = clock.elapsedTime;
    const t = (clock.elapsedTime - born.current) / ARC_LIFE;
    const travel = Math.min(t / 0.6, 1);
    if (head.current) { head.current.position.copy(curve.getPoint(travel)); head.current.visible = travel < 1; }
    if (mat.current) mat.current.opacity = t < 0.7 ? 0.85 : Math.max(0, 0.85 * (1 - (t - 0.7) / 0.3));
    if (ring.current) {
      const s = travel < 1 ? 0 : 0.02 + (t - 0.6) * 0.5;
      ring.current.scale.setScalar(Math.max(s, 0.0001));
      (ring.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (t - 0.6) / 0.4);
    }
  });

  return (
    <group>
      <mesh geometry={geom} onClick={(e) => { e.stopPropagation(); onSelect(attack); }}>
        <meshBasicMaterial ref={mat} color={color} transparent opacity={0.85} />
      </mesh>
      <mesh ref={head}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color={color} /></mesh>
      <mesh ref={ring} position={target} onUpdate={(m) => m.lookAt(0, 0, 0)}>
        <ringGeometry args={[0.6, 1, 32]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CityNodes() {
  return (
    <>
      {CITIES.map((c) => (
        <mesh key={c.name} position={toVec(c.lat, c.lon, R * 1.004)}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#a3e635" />
        </mesh>
      ))}
    </>
  );
}

export function ThreatGlobe({ attacks, autoRotate, onSelect, compact }: {
  attacks: Attack[]; autoRotate: boolean; onSelect: (a: Attack) => void; compact?: boolean;
}) {
  return (
    <Canvas camera={{ position: [0, 1.2, compact ? 6.2 : 5.4], fov: 45 }} dpr={[1, 1.75]}>
      <color attach="background" args={['#0f1522']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <Stars radius={60} depth={30} count={1200} factor={2.5} fade />
      <group rotation={[0.35, 0, 0]}>
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial color="#16213a" roughness={0.9} metalness={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[R * 1.06, 48, 48]} />
          <meshBasicMaterial color="#3b5bdb" transparent opacity={0.06} side={THREE.BackSide} />
        </mesh>
        <DotSphere />
        <CityNodes />
        {attacks.map((a) => <ArcLine key={a.id} attack={a} onSelect={onSelect} />)}
      </group>
      <OrbitControls enablePan={false} minDistance={3.4} maxDistance={9} autoRotate={autoRotate} autoRotateSpeed={0.6} enableZoom={!compact} />
    </Canvas>
  );
}

export default ThreatGlobe;
