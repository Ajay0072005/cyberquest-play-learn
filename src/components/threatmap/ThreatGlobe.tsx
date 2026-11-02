import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ThreatRow, SEVERITY_COLORS, Severity } from '@/services/threatIntel';
import earthDay from '@/assets/threatmap/earth_atmos_2048.jpg';
import earthLights from '@/assets/threatmap/earth_lights_2048.png';

const R = 2;
const ARC_LIFE = 3.2; // seconds per attack arc

function toVec(lat: number, lon: number, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Realistic Earth: NASA-style day texture, darkened to fit the navy theme,
// with faint city lights as an emissive layer. (unchanged visual foundation)
function EarthSurface() {
  const { day, lights } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const day = loader.load(earthDay);
    day.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;
    day.wrapS = THREE.RepeatWrapping;
    const lights = loader.load(earthLights);
    lights.colorSpace = THREE.SRGBColorSpace;
    lights.anisotropy = 8;
    lights.wrapS = THREE.RepeatWrapping;
    return { day, lights };
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[R, 128, 96]} />
      <meshStandardMaterial
        map={day}
        color="#9aa3b5"
        emissiveMap={lights}
        emissive="#ffc078"
        emissiveIntensity={0.55}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

/**
 * Attack arc — rendered ONLY when a record genuinely carries both a source and
 * a destination position (e.g. authorized network telemetry). Public
 * intelligence feeds report malicious sources, never victims, so most records
 * show as markers instead of arcs.
 */
function ArcLine({ threat, onSelect }: { threat: ThreatRow; onSelect: (t: ThreatRow) => void }) {
  const { curve, geom } = useMemo(() => {
    const a = toVec(threat.latitude!, threat.longitude!);
    const b = toVec(threat.dest_latitude!, threat.dest_longitude!);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(R + a.distanceTo(b) * 0.45);
    const c = new THREE.QuadraticBezierCurve3(a, mid, b);
    return { curve: c, geom: new THREE.TubeGeometry(c, 48, 0.008, 6, false) };
  }, [threat]);
  const head = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const born = useRef<number | null>(null);
  const color = SEVERITY_COLORS[(threat.severity as Severity) ?? 'Unknown'];
  const target = useMemo(() => toVec(threat.dest_latitude!, threat.dest_longitude!, R * 1.002), [threat]);

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
      <mesh geometry={geom} onClick={(e) => { e.stopPropagation(); onSelect(threat); }}>
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

const SEVERITY_SIZE: Record<string, number> = {
  Critical: 0.034,
  High: 0.028,
  Medium: 0.022,
  Low: 0.018,
  Informational: 0.016,
  Unknown: 0.016,
};

/** Persistent clickable marker for one real intelligence record. */
function ThreatMarker({ threat, selected, onSelect }: {
  threat: ThreatRow; selected: boolean; onSelect: (t: ThreatRow) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const color = SEVERITY_COLORS[(threat.severity as Severity) ?? 'Unknown'];
  const base = SEVERITY_SIZE[(threat.severity as Severity) ?? 'Unknown'] ?? 0.016;
  const position = useMemo(() => toVec(threat.latitude!, threat.longitude!, R * 1.006), [threat]);

  useFrame(({ clock }) => {
    const target = hovered || selected ? 1.9 : 1;
    if (mesh.current) mesh.current.scale.lerp(new THREE.Vector3(target, target, target), 0.2);
    if (halo.current) {
      const pulse = threat.is_flagged
        ? 1 + Math.sin(clock.elapsedTime * 3) * 0.25
        : 1;
      halo.current.scale.setScalar(pulse);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = hovered || selected || threat.is_flagged ? 0.4 : 0;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(threat); }}
        onUpdate={(m) => m.lookAt(0, 0, 0)}
      >
        <circleGeometry args={[base, 16]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      {/* highlight halo for flagged threats / active incidents / hover */}
      <mesh ref={halo} onUpdate={(m) => m.lookAt(0, 0, 0)}>
        <circleGeometry args={[base * 2.4, 24]} />
        <meshBasicMaterial color={threat.is_flagged ? '#a3e635' : color} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      {selected && (
        <mesh onUpdate={(m) => m.lookAt(0, 0, 0)}>
          <ringGeometry args={[base * 3, base * 3.6, 24]} />
          <meshBasicMaterial color="#a3e635" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function ThreatGlobe({ threats, autoRotate, onSelect, compact }: {
  /** Real threat records; only those with coordinates become markers. */
  threats: ThreatRow[];
  autoRotate: boolean;
  onSelect: (t: ThreatRow) => void;
  compact?: boolean;
}) {
  const markers = useMemo(
    () => threats.filter((t) => t.latitude != null && t.longitude != null),
    [threats],
  );
  const arcs = useMemo(
    () => markers.filter((t) => t.dest_latitude != null && t.dest_longitude != null),
    [markers],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (t: ThreatRow) => {
    setSelectedId(t.id);
    onSelect(t);
  };

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
          <meshBasicMaterial color="#3b5bdb" transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
        <EarthSurface />
        {markers.map((t) => (
          <ThreatMarker key={t.id} threat={t} selected={t.id === selectedId} onSelect={handleSelect} />
        ))}
        {arcs.map((t) => <ArcLine key={`arc-${t.id}`} threat={t} onSelect={handleSelect} />)}
      </group>
      <OrbitControls enablePan={false} minDistance={3.4} maxDistance={9} autoRotate={autoRotate} autoRotateSpeed={0.6} enableZoom={!compact} />
    </Canvas>
  );
}

export default ThreatGlobe;
