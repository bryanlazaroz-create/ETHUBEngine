import { create } from "zustand";
import type { GadgetId, LevelId } from "@/lib/game/constants";
import type { GameSaveData } from "@/lib/save/save";

export type Vec3 = [number, number, number];

export type CreatureStatus = "idle" | "stunned" | "captured";

export type CreatureState = {
  id: string;
  status: CreatureStatus;
  stunUntil: number;
  lastSeenAt: number;
};

export type GadgetEvent = {
  id: number;
  type: GadgetId;
  origin: Vec3;
  radius: number;
  timestamp: number;
};

type GameState = {
  isPaused: boolean;
  activeLevelId: LevelId;
  playerPosition: Vec3;
  playerVelocity: Vec3;
  gadgetsUnlocked: Record<GadgetId, boolean>;
  activeGadget: GadgetId;
  gadgetEvent: GadgetEvent | null;
  gadgetEventId: number;
  creatures: Record<string, CreatureState>;
  capturedCount: number;
  lastSaveAt: number | null;
  togglePause: () => void;
  setPaused: (isPaused: boolean) => void;
  setLevel: (levelId: LevelId) => void;
  updatePlayerState: (position: Vec3, velocity: Vec3) => void;
  unlockGadget: (gadgetId: GadgetId) => void;
  setActiveGadget: (gadgetId: GadgetId) => void;
  registerCreature: (creatureId: string) => void;
  stunCreature: (creatureId: string, durationMs: number) => void;
  captureCreature: (creatureId: string) => void;
  clearCreatureStun: (creatureId: string) => void;
  triggerGadgetEvent: (type: GadgetId, origin: Vec3, radius: number) => void;
  markSaved: (timestamp: number) => void;
  applySaveData: (data: GameSaveData) => void;
};

const defaultGadgets: Record<GadgetId, boolean> = {
  "capture-lasso": true,
  "pulse-baton": false,
  "sonic-beacon": false,
  "grapple-line": false,
};

export const useGameStore = create<GameState>((set) => ({
  isPaused: false,
  activeLevelId: "level-01",
  playerPosition: [0, 1, 0],
  playerVelocity: [0, 0, 0],
  gadgetsUnlocked: { ...defaultGadgets },
  activeGadget: "capture-lasso",
  gadgetEvent: null,
  gadgetEventId: 0,
  creatures: {},
  capturedCount: 0,
  lastSaveAt: null,
  togglePause: () =>
    set((state) => ({
      isPaused: !state.isPaused,
    })),
  setPaused: (isPaused) => set({ isPaused }),
  setLevel: (levelId) =>
    set({
      activeLevelId: levelId,
      creatures: {},
      capturedCount: 0,
      gadgetEvent: null,
      gadgetEventId: 0,
      isPaused: false,
    }),
  updatePlayerState: (position, velocity) =>
    set({
      playerPosition: position,
      playerVelocity: velocity,
    }),
  unlockGadget: (gadgetId) =>
    set((state) => ({
      gadgetsUnlocked: {
        ...state.gadgetsUnlocked,
        [gadgetId]: true,
      },
    })),
  setActiveGadget: (gadgetId) => set({ activeGadget: gadgetId }),
  registerCreature: (creatureId) =>
    set((state) => {
      if (state.creatures[creatureId]) {
        return state;
      }
      return {
        creatures: {
          ...state.creatures,
          [creatureId]: {
            id: creatureId,
            status: "idle",
            stunUntil: 0,
            lastSeenAt: Date.now(),
          },
        },
      };
    }),
  stunCreature: (creatureId, durationMs) =>
    set((state) => {
      const existing = state.creatures[creatureId];
      if (!existing || existing.status === "captured") {
        return state;
      }
      return {
        creatures: {
          ...state.creatures,
          [creatureId]: {
            ...existing,
            status: "stunned",
            stunUntil: Date.now() + durationMs,
            lastSeenAt: Date.now(),
          },
        },
      };
    }),
  captureCreature: (creatureId) =>
    set((state) => {
      const existing = state.creatures[creatureId];
      if (!existing || existing.status === "captured") {
        return state;
      }
      const nextCount = state.capturedCount + 1;
      return {
        capturedCount: nextCount,
        creatures: {
          ...state.creatures,
          [creatureId]: {
            ...existing,
            status: "captured",
            lastSeenAt: Date.now(),
          },
        },
      };
    }),
  clearCreatureStun: (creatureId) =>
    set((state) => {
      const existing = state.creatures[creatureId];
      if (!existing || existing.status !== "stunned") {
        return state;
      }
      return {
        creatures: {
          ...state.creatures,
          [creatureId]: {
            ...existing,
            status: "idle",
            lastSeenAt: Date.now(),
          },
        },
      };
    }),
  triggerGadgetEvent: (type, origin, radius) =>
    set((state) => {
      const nextId = state.gadgetEventId + 1;
      return {
        activeGadget: type,
        gadgetEventId: nextId,
        gadgetEvent: {
          id: nextId,
          type,
          origin,
          radius,
          timestamp: Date.now(),
        },
      };
    }),
  markSaved: (timestamp) => set({ lastSaveAt: timestamp }),
  applySaveData: (data) =>
    set(() => {
      const capturedCreatures = data.capturedCreatures.reduce<
        Record<string, CreatureState>
      >((acc, creatureId) => {
        acc[creatureId] = {
          id: creatureId,
          status: "captured",
          stunUntil: 0,
          lastSeenAt: Date.now(),
        };
        return acc;
      }, {});

      return {
        activeLevelId: data.levelId as LevelId,
        gadgetsUnlocked: {
          ...defaultGadgets,
          ...data.gadgetsUnlocked,
        },
        capturedCount: data.capturedCount,
        creatures: capturedCreatures,
        isPaused: false,
        gadgetEvent: null,
        gadgetEventId: 0,
      };
    }),
}));

export const selectSaveData = (state: GameState): GameSaveData => ({
  levelId: state.activeLevelId,
  gadgetsUnlocked: state.gadgetsUnlocked,
  capturedCreatures: Object.values(state.creatures)
    .filter((creature) => creature.status === "captured")
    .map((creature) => creature.id),
  capturedCount: state.capturedCount,
});

export const useSaveData = () => useGameStore(selectSaveData);
