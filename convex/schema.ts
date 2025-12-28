import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  entries: defineTable({
    day: v.string(), // e.g. 2024-11-09
    blockId: v.string(), // e.g. block-4
    startHour: v.number(), // 0-23 for ordering
    task: v.string(),
    type: v.union(v.literal("Signal"), v.literal("Noise"), v.literal("Sleep")),
  })
    .index("by_day_start", ["day", "startHour"])
    .index("by_day_block", ["day", "blockId"]),
});
