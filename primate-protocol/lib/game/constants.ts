// ============================
// Game Constants & Types
// ============================

import { ReactNode } from "react";
import { LevelId } from "./LevelId";

export type GadgetId = "capture-lasso" | "pulse-baton" | "sonic-beacon" | "grapple-line";
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

export type GadgetDefinition = {
  id: GadgetId;
  name: string;
  description: string;
  cooldownMs: number;
  input: string;
  rangeLabel: string;
};

export type CreatureDefinition = {
  id: string;
  name: string;
  behavior: string;
  tags: string[];
  assetPath?: string;
  useGltf?: boolean;
};

export type ControlDefinition = {
  action: string;
  keys: string[];
  label: string;
};

export const LEVELS = [
  {
    id: "hub",
    name: "The Relay Yard",
    description: "NPC briefings, gadget upgrades, and a training route for capture drills.",
    objectives: ["Speak with the yard coordinator.", "Complete the capture training.", "Unlock the hub fast travel pad."],
    unlocksLabel: "Capture Lasso",
    assetPath: "/assets/levels/hub-relay-yard.glb",
    useGltf: false,
  },
  {
    id: "level-01",
    name: "Canopy District",
    description: "Vertical traversal tutorial with spring platforms and canopy bridges.",
    objectives: ["Reach the upper relay spire.", "Capture 3 Skitterlings.", "Secure the baton cache."],
    unlocks: "pulse-baton",
    unlocksLabel: "Pulse Baton",
    assetPath: "/assets/levels/level-01.glb",
    useGltf: false,
  },
  {
    id: "level-02",
    name: "Flooded Archive",
    description: "Flooded stacks, moving platforms, and timed doors over deep water.",
    objectives: ["Drain the west conduit.", "Capture 4 Inkspawns.", "Activate the archive beacon."],
    unlocks: "sonic-beacon",
    unlocksLabel: "Sonic Beacon",
    assetPath: "/assets/levels/level-02.glb",
    useGltf: false,
  },
  {
    id: "level-03",
    name: "Solar Railworks",
    description: "Rail-grinding traversal with cranes and magnetic traps above the yard.",
    objectives: ["Ride the rail loop once.", "Capture 5 Bolt-Runners.", "Defeat the Foreman Drone."],
    unlocks: "grapple-line",
    unlocksLabel: "Grapple Line",
    assetPath: "/assets/levels/level-03.glb",
    useGltf: false,
  },
] as const satisfies readonly LevelDefinition[];

export const GADGETS: GadgetDefinition[] = [
  { id: "capture-lasso", name: "Capture Lasso", description: "Short-range cone capture for stunned creatures.", cooldownMs: 900, input: "E", rangeLabel: "Short range" },
  { id: "pulse-baton", name: "Pulse Baton", description: "Melee stun with a quick cooldown and wide sweep.", cooldownMs: 1400, input: "F", rangeLabel: "Close range" },
  { id: "sonic-beacon", name: "Sonic Beacon", description: "Lures creatures toward a target point for a short window.", cooldownMs: 4200, input: "Q", rangeLabel: "Medium range" },
  { id: "grapple-line", name: "Grapple Line", description: "Pulls the player toward traversal anchors.", cooldownMs: 1800, input: "G", rangeLabel: "Long range" },
];

export const CREATURES: CreatureDefinition[] = [
  { id: "skitterling", name: "Skitterling", behavior: "Fast patrol with quick bursts when startled.", tags: ["fast", "ground"], assetPath: "/assets/creatures/critter-01.glb", useGltf: false },
  { id: "bark-bouncer", name: "Bark-Bouncer", behavior: "Slow hop patrol that flees when approached.", tags: ["jumper", "ground"], assetPath: "/assets/creatures/critter-02.glb", useGltf: false },
  { id: "inkspawn", name: "Inkspawn", behavior: "Hides near edges and flees after sonar pings.", tags: ["stealth", "water"], assetPath: "/assets/creatures/critter-03.glb", useGltf: false },
  { id: "bolt-runner", name: "Bolt-Runner", behavior: "Fast chaser that zigzags across open platforms.", tags: ["speed", "rail"], assetPath: "/assets/creatures/critter-04.glb", useGltf: false },
];

export const CONTROLS: ControlDefinition[] = [
  { action: "Move", keys: ["W", "A", "S", "D"], label: "Movement" },
  { action: "Jump", keys: ["Space"], label: "Jump" },
  { action: "Capture", keys: ["E"], label: "Capture Lasso" },
  { action: "Stun", keys: ["F"], label: "Pulse Baton" },
  { action: "Lure", keys: ["Q"], label: "Sonic Beacon" },
  { action: "Grapple", keys: ["G"], label: "Grapple Line" },
  { action: "Pause", keys: ["Esc"], label: "Pause menu" },
];
