import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { GameSave } from "../lib/save/save";

const SAVE_VERSION = 1;

const saveDataValidator = v.object({
  levelId: v.string(),
  gadgetsUnlocked: v.record(v.string(), v.boolean()),
  capturedCreatures: v.array(v.string()),
  capturedCount: v.number(),
});

export const upsertSave = mutation({
  args: {
    data: saveDataValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in required to save.");
    }

    const existing = await ctx.db
      .query("saves")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    const save = {
      version: SAVE_VERSION,
      updatedAt: new Date().toISOString(),
      data: args.data,
    };

    if (existing) {
      await ctx.db.patch(existing._id, save);
    } else {
      await ctx.db.insert("saves", {
        userId: identity.subject,
        ...save,
      });
    }

    return save satisfies GameSave;
  },
});

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const existing = await ctx.db
      .query("saves")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!existing) {
      return null;
    }

    const { version, updatedAt, data } = existing;
    return { version, updatedAt, data } satisfies GameSave;
  },
});
