import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDay = query({
  args: { day: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("entries")
      .withIndex("by_day_start", (q) => q.eq("day", args.day))
      .order("asc")
      .collect();
    return rows;
  },
});

export const setEntry = mutation({
  args: {
    day: v.string(),
    blockId: v.string(),
    startHour: v.number(),
    task: v.string(),
    type: v.union(v.literal("Signal"), v.literal("Noise"), v.literal("Sleep")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("entries")
      .withIndex("by_day_block", (q) => q.eq("day", args.day).eq("blockId", args.blockId))
      .unique();

    if (existing?._id) {
      await ctx.db.patch(existing._id, {
        task: args.task,
        type: args.type,
        startHour: args.startHour,
      });
      return existing._id;
    }

    return await ctx.db.insert("entries", {
      day: args.day,
      blockId: args.blockId,
      startHour: args.startHour,
      task: args.task,
      type: args.type,
    });
  },
});
