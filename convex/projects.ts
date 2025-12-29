import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("projects").withIndex("by_createdAt").order("asc").collect();
    return rows.map((row) => ({
      ...row,
      done: row.done ?? false,
      createdAt: row.createdAt ?? 0,
    }));
  },
});

export const getCompletedInTimeRange = query({
  args: { start: v.number(), end: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("projects")
      .withIndex("by_completedAt", (q) =>
        q.gte("completedAt", args.start).lte("completedAt", args.end)
      )
      .collect();
    return rows.length;
  },
});

export const add = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name.trim(),
      done: false,
      createdAt: Date.now(),
    });
  },
});

export const setDone = mutation({
  args: { id: v.id("projects"), done: v.boolean() },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return;
    await ctx.db.patch(args.id, {
      done: args.done,
      completedAt: args.done ? project.completedAt ?? Date.now() : undefined,
    });
  },
});
