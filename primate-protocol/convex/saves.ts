import { query } from "./_generated/server";
import { v } from "convex/values";

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