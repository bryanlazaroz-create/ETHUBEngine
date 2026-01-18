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
 * Create or update the player's profile.
 */
export const upsertProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to manage profiles.");
    }
    const userId = getUserId(identity);
    const displayName =
      args.displayName || identity.name || identity.email || "Primate Agent";
    const existing = await ctx.db
      .query("gameProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { displayName });
      return existing._id;
    }
    return await ctx.db.insert("gameProfiles", {
      userId,
      displayName,
      createdAt: Date.now(),
    });
  },
});

/**
 * Fetch the current player's profile.
 */
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to load profiles.");
    }
    const userId = getUserId(identity);
    return await ctx.db
      .query("gameProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
