import { v } from "convex/values";
import { mutation } from "./_generated/server";


export const saveGame = mutation({
    args: {
        userId: v.string(),
        levelId: v.string(),
        gadgetsUnlocked: v.object(v.boolean()),
        capturedCreatures: v.array(v.string()),
        capturedCount: v.number(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const existing = await ctx.db
            .query("saves")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                updatedAt: now,
            });
            return existing._id;
        }

        return await ctx.db.insert("saves", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});
