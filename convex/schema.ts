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
  tasks: defineTable({
    day: v.optional(v.string()),
    text: v.string(),
    done: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    isCompleted: v.optional(v.boolean()),
  }).index("by_day_created", ["day", "createdAt"]),
  project: defineTable({
    day: v.optional(v.string()),
    name: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }).index("by_day_created", ["day", "createdAt"]),
  projects: defineTable({
    day: v.optional(v.string()),
    name: v.string(),
    done: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_day_created", ["day", "createdAt"])
    .index("by_createdAt", ["createdAt"])
    .index("by_completedAt", ["completedAt"]),
  projectTasks: defineTable({
    projectId: v.id("projects"),
    text: v.string(),
    done: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_project_created", ["projectId", "createdAt"])
    .index("by_completedAt", ["completedAt"]),
});
