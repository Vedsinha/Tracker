import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByDay = query({
  args: { day: v.string() },
  handler: async (ctx, args) => {
    const current = await ctx.db
      .query("project")
      .withIndex("by_day_created", (q) => q.eq("day", args.day))
      .order("desc")
      .first();
    if (current) return current;

    const undated = await ctx.db.query("project").order("desc").first();
    return undated ?? null;
  },
});

export const set = mutation({
  args: { day: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("project")
      .withIndex("by_day_created", (q) => q.eq("day", args.day))
      .order("desc")
      .first();

    if (existing?._id) {
      await ctx.db.patch(existing._id, { name: args.name, day: args.day, createdAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("project", {
      day: args.day,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
