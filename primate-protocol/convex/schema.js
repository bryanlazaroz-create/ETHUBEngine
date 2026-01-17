import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  gameProfiles: defineTable({
    userId: v.string(),
    displayName: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
  gameSaves: defineTable({
    userId: v.string(),
    slot: v.number(),
    data: v.any(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_slot", ["userId", "slot"]),
});
