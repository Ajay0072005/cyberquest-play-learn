import React, { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { BUILDING_POSITIONS, BUILDING_COLORS, MissionId } from "./GameTypes";

interface Props {
  completedMissions: MissionId[];
  onApproachBuilding: (id: MissionId | null) => void;
}

const INTERACTION_DISTANCE = 10;

const NeonBuilding: React.FC<{
  id: MissionId;
  position: [number, number, number];
  color: string;
  completed: boolean;
  label: string;
}> = ({ id, position, color, completed, label }) => {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.5;
    }
  });

  const height = id === "final" ? 14 : 8 + Math.abs(position[0] % 5);
  const width = id === "final" ? 10 : 7;
  const depth = id === "final" ? 10 : 7;

  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={completed ? "#225533" : "#111122"}
          emissive={color}
          emissiveIntensity={completed ? 0.1 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Neon edge lines */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>

      {/* Window strips */}
      {Array.from({ length: Math.floor(height / 2.5) }).map((_, i) => (
        <mesh key={`window-${i}`} position={[0, 1.5 + i * 2.5, depth / 2 + 0.02]}>
          <planeGeometry args={[width * 0.7, 0.4]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Glow light */}
      <pointLight ref={glowRef} position={[0, height + 2, 0]} color={color} intensity={2} distance={18} />

      {/* Door - glowing entrance */}
      <mesh position={[0, 1.5, depth / 2 + 0.02]}>
        <planeGeometry args={[2.5, 3]} />
        <meshBasicMaterial color={color} transparent opacity={completed ? 0.2 : 0.7} />
      </mesh>

      {/* Door frame light */}
      {!completed && (
        <pointLight position={[0, 1.5, depth / 2 + 1]} color={color} intensity={1.5} distance={6} />
      )}

      {/* Label */}
      <Text
        position={[0, height + 1.5, 0]}
        fontSize={0.8}
        color={completed ? "#66ff88" : color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {completed ? `✓ ${label}` : label}
      </Text>

      {/* Completed checkmark glow */}
      {completed && (
        <pointLight position={[0, height + 2, 0]} color="#00ff88" intensity={3} distance={8} />
      )}

      {/* Ground marker ring */}
      {!completed && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, depth / 2 + 2]}>
          <ringGeometry args={[1, 1.3, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const BUILDING_LABELS: Record<MissionId, string> = {
  phishing: "Office Building",
  network: "Server Room",
  password: "Digital Vault",
  malware: "Malware Lab",
  final: "Hacker Hideout",
};

export const CyberCity: React.FC<Props> = ({ completedMissions, onApproachBuilding }) => {
  const { camera } = useThree();
  const lastNear = useRef<MissionId | null>(null);

  // Use a stable callback to avoid re-render cascades
  const checkProximity = useCallback(() => {
    const px = camera.position.x;
    const pz = camera.position.z;
    let nearestBuilding: MissionId | null = null;
    let nearestDist = INTERACTION_DISTANCE;

    for (const [id, pos] of Object.entries(BUILDING_POSITIONS)) {
      const dx = px - pos[0];
      const dz = pz - pos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestBuilding = id as MissionId;
      }
    }

    if (nearestBuilding !== lastNear.current) {
      lastNear.current = nearestBuilding;
      onApproachBuilding(nearestBuilding);
    }
  }, [camera, onApproachBuilding]);

  useFrame(() => {
    checkProximity();
  });

  // Generate decorative buildings
  const decorativeBuildings = useMemo(() => {
    const buildings: { pos: [number, number, number]; h: number; w: number; color: string }[] = [];
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 40; i++) {
      const x = (rng(i * 13) - 0.5) * 90;
      const z = (rng(i * 17) - 0.5) * 100;
      let tooClose = false;
      for (const pos of Object.values(BUILDING_POSITIONS)) {
        if (Math.abs(x - pos[0]) < 14 && Math.abs(z - pos[2]) < 14) {
          tooClose = true;
          break;
        }
      }
      // Also keep spawn area clear
      if (tooClose || (Math.abs(x) < 8 && Math.abs(z - 10) < 8)) continue;

      const h = 3 + rng(i * 7) * 18;
      const w = 3 + rng(i * 11) * 5;
      buildings.push({
        pos: [x, h / 2, z],
        h,
        w,
        color: ["#003355", "#002244", "#001133", "#002255", "#001a33"][Math.floor(rng(i * 19) * 5)],
      });
    }
    return buildings;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Grid on ground */}
      <gridHelper args={[120, 60, "#003322", "#001a11"]} position={[0, 0.01, 0]} />

      {/* Mission buildings */}
      {(Object.keys(BUILDING_POSITIONS) as MissionId[]).map((id) => (
        <NeonBuilding
          key={id}
          id={id}
          position={BUILDING_POSITIONS[id]}
          color={BUILDING_COLORS[id]}
          completed={completedMissions.includes(id)}
          label={BUILDING_LABELS[id]}
        />
      ))}

      {/* Decorative buildings */}
      {decorativeBuildings.map((b, i) => (
        <group key={i}>
          <mesh position={b.pos}>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color={b.color} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={b.pos}>
            <boxGeometry args={[b.w + 0.05, b.h + 0.05, b.w + 0.05]} />
            <meshBasicMaterial color="#002244" wireframe transparent opacity={0.12} />
          </mesh>
        </group>
      ))}

      {/* Street lights along paths */}
      {[-15, -5, 5, 15].map((x) =>
        [-20, -5, 10, 25].map((z) => (
          <pointLight key={`sl-${x}-${z}`} position={[x, 4, z]} color="#114433" intensity={0.4} distance={12} />
        ))
      )}

      {/* Ambient lighting */}
      <ambientLight intensity={0.2} color="#112233" />
      <directionalLight position={[20, 40, 10]} intensity={0.3} color="#334466" />
      <hemisphereLight args={["#112244", "#0a0a15", 0.15]} />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={["#050510", 25, 90]} />

      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[70, 32, 32]} />
        <meshBasicMaterial color="#050510" side={THREE.BackSide} />
      </mesh>

      {/* Spawn point marker */}
      <pointLight position={[0, 3, 10]} color="#00ff88" intensity={1.5} distance={12} />
    </group>
  );
};
