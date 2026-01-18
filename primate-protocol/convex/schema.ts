import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const saveData = v.object({
  levelId: v.string(),
  gadgetsUnlocked: v.record(v.string(), v.boolean()),
  capturedCreatures: v.array(v.string()),
  capturedCount: v.number(),
});

export default defineSchema({
  saves: defineTable({
    userId: v.string(),
    version: v.number(),
    updatedAt: v.string(),
    data: saveData,
  }).index("by_user", ["userId"]),
});
