"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { RigidBodyApi } from "@react-three/rapier";
import { useGameStore } from "@/lib/game/state";
import { CONTROL_MAP, CREATURES, LEVELS } from "@/lib/game/constants";
import HUD from "@/components/game/HUD";
import PauseMenu from "@/components/game/PauseMenu";
import LevelLoader from "@/components/game/LevelLoader";
import ThirdPersonController from "@/components/game/ThirdPersonController";
import Creature from "@/components/game/Creature";
import GadgetSystem from "@/components/game/GadgetSystem";

type GameCanvasProps = {
  levelId: string;
};

const Scene = ({ levelId }: { levelId: string }) => {
  const playerRef = useRef<RigidBodyApi | null>(null);
  const creatureSpawns = useMemo(
    () => [
      { id: "skitterling-01", position: [-4, 1, -2], type: CREATURES[0] },
      { id: "bark-bouncer-01", position: [3, 1, -4], type: CREATURES[1] },
      { id: "inkspawn-01", position: [5, 1, 3], type: CREATURES[2] },
    ],
    []
  );

  return (
    <>
      <color attach="background" args={["#0b0f14"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[12, 16, 8]}
        intensity={1.2}
        castShadow
      />
      <Physics gravity={[0, -20, 0]}>
        <Suspense fallback={null}>
          <LevelLoader levelId={levelId} />
        </Suspense>
        <ThirdPersonController playerRef={playerRef} />
        {creatureSpawns.map((spawn) => (
          <Creature
            key={spawn.id}
            id={spawn.id}
            position={spawn.position}
          />
        ))}
        <GadgetSystem playerRef={playerRef} />
      </Physics>
    </>
  );
};

export default function GameCanvas({ levelId }: GameCanvasProps) {
  const setLevel = useGameStore((state) => state.setLevel);

  useEffect(() => {
    const found = LEVELS.find((level) => level.id === levelId);
    if (found) {
      setLevel(found.id);
    }
  }, [levelId, setLevel]);

  return (
    <KeyboardControls map={CONTROL_MAP}>
      <div className="relative h-[70vh] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-[0_0_60px_rgba(15,23,42,0.6)]">
        <Canvas
          shadows
          camera={{ position: [0, 4, 10], fov: 50 }}
          className="h-full w-full"
        >
          <Scene levelId={levelId} />
        </Canvas>
        <HUD />
        <PauseMenu />
      </div>
    </KeyboardControls>
  );
}
