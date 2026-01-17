"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
  useRapier,
} from "@react-three/rapier";
import { Vector3 } from "three";
import { PLAYER_SETTINGS, type ControlName } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/state";

export type PlayerRef = MutableRefObject<RapierRigidBody | null>;

type ControlState = Record<ControlName, boolean>;

type ThirdPersonControllerProps = {
  playerRef: PlayerRef;
};

const lerpAngle = (start: number, end: number, factor: number) => {
  const delta = ((end - start + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return start + delta * factor;
};

export default function ThirdPersonController({
  playerRef,
}: ThirdPersonControllerProps) {
  const isPaused = useGameStore((state) => state.isPaused);
  const updatePlayerState = useGameStore((state) => state.updatePlayerState);
  const { rapier, world } = useRapier();
  const [subscribeKeys, getKeys] = useKeyboardControls<ControlState>();
  const cameraOffset = useMemo(
    () => new Vector3(...PLAYER_SETTINGS.cameraOffset),
    []
  );

  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const cameraYaw = useRef(0);
  const jumpQueued = useRef(false);
  const lastGroundedAt = useRef(0);

  useEffect(
    () =>
      subscribeKeys(
        (state) => state.jump,
        (pressed) => {
          if (pressed) {
            jumpQueued.current = true;
          }
        }
      ),
    [subscribeKeys]
  );

  useFrame((state, delta) => {
    const body = playerRef.current;
    if (!body) {
      return;
    }

    const translation = body.translation();
    const linearVelocity = body.linvel();
    updatePlayerState(
      [translation.x, translation.y, translation.z],
      [linearVelocity.x, linearVelocity.y, linearVelocity.z]
    );

    if (isPaused) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const now = state.clock.getElapsedTime() * 1000;
    const ray = new rapier.Ray(translation, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 0.9, true);
    const grounded = Boolean(hit && hit.toi < 0.7);
    if (grounded) {
      lastGroundedAt.current = now;
    }

    const keys = getKeys();
    const inputX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const inputZ = (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0);

    direction.current.set(inputX, 0, inputZ);
    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();
    }

    const speed = keys.sprint
      ? PLAYER_SETTINGS.sprintSpeed
      : PLAYER_SETTINGS.walkSpeed;

    const desiredVelocity = direction.current
      .clone()
      .multiplyScalar(speed)
      .applyAxisAngle(new Vector3(0, 1, 0), cameraYaw.current);

    const control = grounded ? 1 : PLAYER_SETTINGS.airControl;
    const blendedTarget = new Vector3(
      desiredVelocity.x * control + linearVelocity.x * (1 - control),
      0,
      desiredVelocity.z * control + linearVelocity.z * (1 - control)
    );

    velocity.current.lerp(
      blendedTarget,
      1 - Math.exp(-PLAYER_SETTINGS.acceleration * delta)
    );

    body.setLinvel(
      {
        x: velocity.current.x,
        y: linearVelocity.y,
        z: velocity.current.z,
      },
      true
    );

    if (
      jumpQueued.current &&
      now - lastGroundedAt.current < PLAYER_SETTINGS.coyoteTimeMs
    ) {
      body.applyImpulse({ x: 0, y: PLAYER_SETTINGS.jumpStrength, z: 0 }, true);
      jumpQueued.current = false;
    }

    if (jumpQueued.current && now - lastGroundedAt.current > 220) {
      jumpQueued.current = false;
    }

    if (velocity.current.lengthSq() > 0.1) {
      const heading = Math.atan2(velocity.current.x, velocity.current.z);
      cameraYaw.current = lerpAngle(
        cameraYaw.current,
        heading,
        1 - Math.exp(-6 * delta)
      );
    }

    const target = new Vector3(
      translation.x,
      translation.y + 1.3,
      translation.z
    );

    const desiredCamera = target.clone().add(
      cameraOffset.clone().applyAxisAngle(new Vector3(0, 1, 0), cameraYaw.current)
    );

    const cameraRayDir = desiredCamera.clone().sub(target);
    const cameraDistance = cameraRayDir.length();
    if (cameraDistance > 0.001) {
      cameraRayDir.normalize();
      const cameraRay = new rapier.Ray(target, {
        x: cameraRayDir.x,
        y: cameraRayDir.y,
        z: cameraRayDir.z,
      });
      const cameraHit = world.castRay(cameraRay, cameraDistance, true);
      if (cameraHit && cameraHit.toi < cameraDistance) {
        const clamped = Math.max(
          0.5,
          cameraHit.toi - PLAYER_SETTINGS.cameraCollisionPadding
        );
        desiredCamera.copy(target).add(cameraRayDir.multiplyScalar(clamped));
      }
    }

    state.camera.position.lerp(
      desiredCamera,
      1 - Math.exp(-PLAYER_SETTINGS.cameraSmooth * delta)
    );
    state.camera.lookAt(target);
  });

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={[0, 1, 0]}
      mass={1}
      linearDamping={0.9}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.55, 0.35]} />
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 0.9, 6, 12]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </RigidBody>
  );
}
