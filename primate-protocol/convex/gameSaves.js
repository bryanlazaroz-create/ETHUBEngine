import { mutation, query } from "convex/server";
import { v } from "convex/values";

/**
 * Resolve a stable user id from a Convex identity.
 * @param {{subject?:string,tokenIdentifier?:string}} identity - Auth identity.
 * @returns {string} Stable user id.
 */
function getUserId(identity) {
  return identity.subject || identity.tokenIdentifier;
}

/**
 * Save or update a game progress slot.
 */
export const saveProgress = mutation({
  args: {
    slot: v.number(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to save progress.");
    }
    const userId = getUserId(identity);
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
    return await ctx.db.insert("gameSaves", payload);
  },
});

/**
 * Load a game progress slot.
 */
export const loadProgress = query({
  args: {
    slot: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to load progress.");
    }
    const userId = getUserId(identity);
    return await ctx.db
      .query("gameSaves")
      .withIndex("by_user_slot", (q) =>
        q.eq("userId", userId).eq("slot", args.slot)
      )
      .unique();
  },
});

/**
 * List save slots for the authenticated user.
 */
export const listSaves = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to list saves.");
    }
    const userId = getUserId(identity);
    const saves = await ctx.db
      .query("gameSaves")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return saves
      .map((save) => ({
        id: save._id,
        slot: save.slot,
        updatedAt: save.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
