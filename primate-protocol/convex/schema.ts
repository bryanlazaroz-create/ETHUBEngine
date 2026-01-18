import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  saves: defineTable({
    userId: v.string(),
    levelId: v.string(),
    gadgetsUnlocked: v.object({
      "capture-lasso": v.boolean(),
      "pulse-baton": v.boolean(),
      "sonic-beacon": v.boolean(),
      "grapple-line": v.boolean(),
    }),
    capturedCreatures: v.array(v.string()),
    capturedCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});