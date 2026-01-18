import type { GadgetId } from "@/lib/game/constants";
import { Vec3, GadgetEvent, CreatureState } from "@/lib/game/state";
import type { GameSaveData } from "@/lib/save/save";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveGame = mutation({
  args: {
    userId: v.string(),
    levelId: v.string(),
    gadgetsUnlocked: v.record(v.string(), v.boolean()),
    capturedCreatures: v.array(v.string()),
    capturedCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("saves", {
      userId: args.userId,
      levelId: args.levelId,
      gadgetsUnlocked: args.gadgetsUnlocked,
      capturedCreatures: args.capturedCreatures,
      capturedCount: args.capturedCount,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const loadGame = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("saves")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
  },
});
export type GameState = {
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
