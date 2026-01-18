import { ReactNode } from "react";
import { GadgetId } from "./constants";
import { LevelId } from "./LevelId";

export type LevelDefinition = {
  id: LevelId;
  name: string;
  description: string;
  objectives: string[];
  unlocks?: GadgetId;
  unlocksLabel?: string;
  assetPath: string;
  useGltf: boolean;
  title?: ReactNode;
};
