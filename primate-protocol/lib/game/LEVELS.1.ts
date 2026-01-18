import { LevelDefinition } from "./LevelDefinition";

/**
 * Array of level definitions for the game.
 *
 * Each level includes metadata such as unique identifier, display name, and description,
 * along with gameplay objectives, unlockable rewards, and associated 3D asset paths.
 *
 * @const
 * @type {readonly LevelDefinition[]}
 *
 * @example
 * const hubLevel = LEVELS.find(level => level.id === 'hub');
 * console.log(hubLevel.name); // "The Relay Yard"
 */

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
