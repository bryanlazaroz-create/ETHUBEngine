import { mutation, query } from "convex/server";
import { v } from "convex/values";

const requireIdentity = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity.subject;
};

export const saveProgress = mutation({
  args: {
    slot: v.number(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("gameSaves")
      .withIndex("by_user_slot", (q) =>
        q.eq("userId", userId).eq("slot", args.slot)
      )
      .unique();

    const payload = {
      userId,
      slot: args.slot,
      data: args.data,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return ctx.db.insert("gameSaves", payload);
  },
});

export const loadProgress = query({
  args: {
    slot: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentity(ctx);
    return ctx.db
      .query("gameSaves")
      .withIndex("by_user_slot", (q) =>
        q.eq("userId", userId).eq("slot", args.slot)
      )
      .unique();
  },
});

export const listSaves = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireIdentity(ctx);
    const saves = await ctx.db
      .query("gameSaves")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return saves
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((save) => ({
        id: save._id,
        slot: save.slot,
        updatedAt: save.updatedAt,
      }));
  },
});
