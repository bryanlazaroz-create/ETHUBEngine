import { mutation, query } from "convex/server";
import { v } from "convex/values";

const requireIdentity = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity.subject;
};

export const submitScore = mutation({
  args: {
    score: v.number(),
    capturedCount: v.number(),
    timeElapsed: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentity(ctx);
    return ctx.db.insert("gameScores", {
      userId,
      score: args.score,
      capturedCount: args.capturedCount,
      timeElapsed: args.timeElapsed,
      createdAt: Date.now(),
    });
  },
});

export const listTopScores = query({
  args: {},
  handler: async (ctx) => {
    const scores = await ctx.db.query("gameScores").collect();
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((score) => ({
        id: score._id,
        score: score.score,
        capturedCount: score.capturedCount,
        timeElapsed: score.timeElapsed,
        createdAt: score.createdAt,
      }));
  },
});
