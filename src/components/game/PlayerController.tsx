import React, { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  isLocked: boolean;
}

const SPEED = 12;
const MOUSE_SENSITIVITY = 0.002;

export const PlayerController: React.FC<Props> = ({ isLocked }) => {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(0, 2, 10);
    euler.current.setFromQuaternion(camera.quaternion);
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

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (keys.current["KeyW"]) direction.add(forward);
    if (keys.current["KeyS"]) direction.sub(forward);
    if (keys.current["KeyD"]) direction.add(right);
    if (keys.current["KeyA"]) direction.sub(right);

    if (direction.lengthSq() > 0) {
      direction.normalize();
      velocity.current.lerp(direction.multiplyScalar(SPEED), 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.2);
    }

    const newPos = camera.position.clone().add(velocity.current.clone().multiplyScalar(delta));
    // Simple boundary collision
    newPos.x = Math.max(-45, Math.min(45, newPos.x));
    newPos.z = Math.max(-50, Math.min(50, newPos.z));
    newPos.y = 2;
    camera.position.copy(newPos);
  });

  return null;
};
