"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { LEVELS } from "@/lib/game/LEVELS.1";

type LevelLoaderProps = {
  levelId: string;
};

const PlaceholderLevel = () => (
  <group>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <boxGeometry args={[40, 1, 40]} />
        <meshStandardMaterial color="#18212b" />
      </mesh>
    </RigidBody>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[0, 2, -8]} receiveShadow>
        <boxGeometry args={[10, 1, 10]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </RigidBody>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[8, 4, 4]} receiveShadow>
        <boxGeometry args={[6, 1, 6]} />
        <meshStandardMaterial color="#283341" />
      </mesh>
    </RigidBody>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[-10, 3, 6]} receiveShadow>
        <boxGeometry args={[5, 1, 5]} />
        <meshStandardMaterial color="#243040" />
      </mesh>
    </RigidBody>
  </group>
);

const GltfLevel = ({ assetPath }: { assetPath: string }) => {
  const gltf = useGLTF(assetPath);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={gltf.scene} />
    </RigidBody>
  );
};

export default function LevelLoader({ levelId }: LevelLoaderProps) {
  const level = useMemo(
    () => LEVELS.find((item) => item.id === levelId),
    [levelId]
  );

  if (!level || !level.useGltf) {
    return <PlaceholderLevel />;
  }

  return <GltfLevel assetPath={level.assetPath} />;
}
