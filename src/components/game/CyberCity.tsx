import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { BUILDING_POSITIONS, BUILDING_COLORS, MissionId } from "./GameTypes";

interface Props {
  completedMissions: MissionId[];
  onApproachBuilding: (id: MissionId | null) => void;
}

const INTERACTION_DISTANCE = 8;

const NeonBuilding: React.FC<{
  id: MissionId;
  position: [number, number, number];
  color: string;
  completed: boolean;
  label: string;
}> = ({ id, position, color, completed, label }) => {
  const meshRef = useRef<THREE.Mesh>(null);
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
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
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

      {/* Glow light */}
      <pointLight ref={glowRef} position={[0, height + 2, 0]} color={color} intensity={2} distance={15} />

      {/* Door */}
      <mesh position={[0, 1.5, depth / 2 + 0.01]}>
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

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

  useFrame(() => {
    const playerPos = camera.position;
    let nearestBuilding: MissionId | null = null;
    let nearestDist = INTERACTION_DISTANCE;

    for (const [id, pos] of Object.entries(BUILDING_POSITIONS)) {
      const dist = playerPos.distanceTo(new THREE.Vector3(pos[0], pos[1], pos[2]));
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestBuilding = id as MissionId;
      }
    }

    onApproachBuilding(nearestBuilding);
  });

  // Generate decorative buildings
  const decorativeBuildings = useMemo(() => {
    const buildings: { pos: [number, number, number]; h: number; w: number; color: string }[] = [];
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 30; i++) {
      const x = (rng(i * 13) - 0.5) * 90;
      const z = (rng(i * 17) - 0.5) * 90;
      // Skip if too close to mission buildings
      let tooClose = false;
      for (const pos of Object.values(BUILDING_POSITIONS)) {
        if (Math.abs(x - pos[0]) < 12 && Math.abs(z - pos[2]) < 12) {
          tooClose = true;
          break;
        }
      }
      if (tooClose || (Math.abs(x) < 5 && Math.abs(z) < 12)) continue;

      const h = 3 + rng(i * 7) * 15;
      buildings.push({
        pos: [x, h / 2, z],
        h,
        w: 3 + rng(i * 11) * 4,
        color: ["#003355", "#002244", "#001133", "#002255"][Math.floor(rng(i * 19) * 4)],
      });
    }
    return buildings;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Grid on ground */}
      <gridHelper args={[100, 50, "#003322", "#001a11"]} position={[0, 0.01, 0]} />

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
            <meshBasicMaterial color="#002244" wireframe transparent opacity={0.15} />
          </mesh>
        </group>
      ))}

      {/* Ambient lighting */}
      <ambientLight intensity={0.15} color="#112233" />
      <directionalLight position={[20, 30, 10]} intensity={0.3} color="#334466" />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={["#050510", 20, 80]} />

      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[60, 32, 32]} />
        <meshBasicMaterial color="#050510" side={THREE.BackSide} />
      </mesh>

      {/* Spawn point marker */}
      <pointLight position={[0, 3, 10]} color="#00ff88" intensity={1} distance={10} />
    </group>
  );
};
