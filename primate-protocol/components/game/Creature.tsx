"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { useGameStore, type CreatureStatus } from "@/lib/game/state";
import { GADGET_SETTINGS } from "@/lib/game/constants";
import {
  CREATURE_SFX,
  resolveCreatureAudioKey,
} from "@/lib/game/audio";
import { useSoundEffects } from "@/lib/game/useAudio";

type CreatureProps = {
  id: string;
  position: [number, number, number];
  patrolRadius?: number;
  speed?: number;
};

export default function Creature({
  id,
  position,
  patrolRadius = 3,
  speed = 2.2,
}: CreatureProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const registerCreature = useGameStore((state) => state.registerCreature);
  const stunCreature = useGameStore((state) => state.stunCreature);
  const captureCreature = useGameStore((state) => state.captureCreature);
  const clearCreatureStun = useGameStore((state) => state.clearCreatureStun);
  const creatureState = useGameStore((state) => state.creatures[id]);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const gadgetEvent = useGameStore((state) => state.gadgetEvent);
  const isPaused = useGameStore((state) => state.isPaused);

  const patrolCenter = useMemo(() => new Vector3(...position), [position]);
  const wanderAngle = useRef(0);
  const lureTarget = useRef<Vector3 | null>(null);
  const lastEventId = useRef<number | null>(null);
  const lastStatus = useRef<CreatureStatus | null>(null);
  const idlePlayed = useRef(false);
  const { playSfx } = useSoundEffects();

  const creatureAudioKey = useMemo(
    () => resolveCreatureAudioKey(id),
    [id]
  );

  useEffect(() => {
    registerCreature(id);
  }, [id, registerCreature]);

  useEffect(() => {
    if (!creatureState || isPaused) {
      return;
    }
    if (!idlePlayed.current && creatureState.status === "idle") {
      playSfx(CREATURE_SFX[creatureAudioKey].idle);
      idlePlayed.current = true;
    }
  }, [creatureAudioKey, creatureState, isPaused, playSfx]);

  useEffect(() => {
    if (!creatureState || isPaused) {
      return;
    }
    const status = creatureState.status;
    if (lastStatus.current && status !== lastStatus.current) {
      if (status === "stunned") {
        playSfx(CREATURE_SFX[creatureAudioKey].stunned);
      }
      if (status === "captured") {
        playSfx(CREATURE_SFX[creatureAudioKey].captured);
      }
    }
    lastStatus.current = status;
  }, [creatureAudioKey, creatureState, isPaused, playSfx]);

  useEffect(() => {
    wanderAngle.current = Math.random() * Math.PI * 2;
  }, []);

  useEffect(() => {
    if (!gadgetEvent || gadgetEvent.id === lastEventId.current) {
      return;
    }
    lastEventId.current = gadgetEvent.id;

    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const creaturePos = body.translation();
    const eventOrigin = new Vector3(
      gadgetEvent.origin[0],
      gadgetEvent.origin[1],
      gadgetEvent.origin[2]
    );
    const distance = eventOrigin.distanceTo(
      new Vector3(creaturePos.x, creaturePos.y, creaturePos.z)
    );

    if (
      gadgetEvent.type === "pulse-baton" &&
      distance < GADGET_SETTINGS.stunRadius
    ) {
      stunCreature(id, GADGET_SETTINGS.stunDurationMs);
    }

    if (
      gadgetEvent.type === "capture-lasso" &&
      distance < GADGET_SETTINGS.captureRadius &&
      creatureState?.status === "stunned"
    ) {
      captureCreature(id);
    }

    if (gadgetEvent.type === "sonic-beacon") {
      if (distance < GADGET_SETTINGS.lureRadius) {
        lureTarget.current = eventOrigin;
      }
    }
  }, [captureCreature, creatureState?.status, gadgetEvent, id, stunCreature]);

  useFrame((_state, delta) => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    if (creatureState?.status === "captured") {
      return;
    }

    if (isPaused) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const now = Date.now();
    if (creatureState?.status === "stunned") {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      if (now > creatureState.stunUntil) {
        clearCreatureStun(id);
      }
      return;
    }

    const positionNow = body.translation();
    const current = new Vector3(positionNow.x, positionNow.y, positionNow.z);
    const player = new Vector3(
      playerPosition[0],
      playerPosition[1],
      playerPosition[2]
    );

    const toPlayer = player.clone().sub(current);
    const distanceToPlayer = toPlayer.length();
    const fleeRadius = 4;

    let target: Vector3;
    if (lureTarget.current) {
      target = lureTarget.current;
      if (target.distanceTo(current) < 0.6) {
        lureTarget.current = null;
      }
    } else if (distanceToPlayer < fleeRadius) {
      target = current.clone().sub(toPlayer);
    } else {
      wanderAngle.current += delta * 0.4;
      target = new Vector3(
        patrolCenter.x + Math.cos(wanderAngle.current) * patrolRadius,
        patrolCenter.y,
        patrolCenter.z + Math.sin(wanderAngle.current) * patrolRadius
      );
    }

    const desired = target.clone().sub(current);
    if (desired.lengthSq() > 0.01) {
      desired.normalize();
    }
    const velocity = desired.multiplyScalar(speed);
    const currentVelocity = body.linvel();
    body.setLinvel(
      { x: velocity.x, y: currentVelocity.y, z: velocity.z },
      true
    );
  });

  if (creatureState?.status === "captured") {
    return null;
  }

  const tint =
    creatureState?.status === "stunned" ? "#60a5fa" : "#22c55e";

  return (
    <RigidBody ref={bodyRef} position={position} colliders="ball">
      <mesh castShadow>
        <sphereGeometry args={[0.5, 20, 20]} />
        <meshStandardMaterial color={tint} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </RigidBody>
  );
}
