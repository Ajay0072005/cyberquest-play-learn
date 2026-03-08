import React, { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BUILDING_POSITIONS, MissionId } from "./GameTypes";

interface Props {
  isLocked: boolean;
}

const SPEED = 14;
const MOUSE_SENSITIVITY = 0.002;

// Build collision boxes for all buildings
const getCollisionBoxes = () => {
  const boxes: { min: THREE.Vector2; max: THREE.Vector2 }[] = [];

  // Mission buildings
  for (const [id, pos] of Object.entries(BUILDING_POSITIONS)) {
    const w = id === "final" ? 10 : 7;
    const d = id === "final" ? 10 : 7;
    const pad = 0.5;
    boxes.push({
      min: new THREE.Vector2(pos[0] - w / 2 - pad, pos[2] - d / 2 - pad),
      max: new THREE.Vector2(pos[0] + w / 2 + pad, pos[2] + d / 2 + pad),
    });
  }

  return boxes;
};

const collisionBoxes = getCollisionBoxes();

const checkCollision = (x: number, z: number): boolean => {
  for (const box of collisionBoxes) {
    if (x > box.min.x && x < box.max.x && z > box.min.y && z < box.max.y) {
      return true;
    }
  }
  return false;
};

export const PlayerController: React.FC<Props> = ({ isLocked }) => {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const velocity = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(0, 2, 10);
      euler.current.setFromQuaternion(camera.quaternion);
      initialized.current = true;
    }
  }, [camera]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = true;
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = false;
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isLocked) return;
      euler.current.y -= e.movementX * MOUSE_SENSITIVITY;
      euler.current.x -= e.movementY * MOUSE_SENSITIVITY;
      euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    },
    [isLocked, camera]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onKeyDown, onKeyUp, onMouseMove]);

  useFrame((_, delta) => {
    if (!isLocked) return;

    const clampedDelta = Math.min(delta, 0.05); // prevent huge jumps on lag

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (keys.current["KeyW"] || keys.current["ArrowUp"]) direction.add(forward);
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) direction.sub(forward);
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) direction.add(right);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) direction.sub(right);

    if (direction.lengthSq() > 0) {
      direction.normalize();
      velocity.current.lerp(direction.multiplyScalar(SPEED), 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.25);
    }

    const movement = velocity.current.clone().multiplyScalar(clampedDelta);
    const newX = camera.position.x + movement.x;
    const newZ = camera.position.z + movement.z;

    // Boundary collision
    const clampedX = Math.max(-45, Math.min(45, newX));
    const clampedZ = Math.max(-50, Math.min(50, newZ));

    // Building collision — try X and Z separately for sliding
    if (!checkCollision(clampedX, camera.position.z)) {
      camera.position.x = clampedX;
    }
    if (!checkCollision(camera.position.x, clampedZ)) {
      camera.position.z = clampedZ;
    }

    camera.position.y = 2;
  });

  return null;
};
