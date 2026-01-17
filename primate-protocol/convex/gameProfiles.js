import { mutation, query } from "convex/server";
import { v } from "convex/values";

const requireIdentity = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity.subject;
};

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireIdentity(ctx);
    return ctx.db
      .query("gameProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const ensureProfile = mutation({
  args: {
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("gameProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      return existing._id;
    }

    return ctx.db.insert("gameProfiles", {
      userId,
      displayName: args.displayName,
      createdAt: Date.now(),
    });
  },
});

export const updateDisplayName = mutation({
  args: {
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("gameProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) {
      throw new Error("Profile not found.");
    }

    await ctx.db.patch(existing._id, {
      displayName: args.displayName,
    });

    return existing._id;
  },
});
