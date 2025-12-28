import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDay = query({
  args: { day: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("tasks").collect();
    const filtered = all
      .filter((row) => {
        const day = row.day ?? "";
        const done = row.done ?? row.isCompleted ?? false;
        // Always include tasks for the selected day
        if (day === args.day) return true;
        // Carry over unfinished tasks from previous days or undated tasks
        if (!done && (day === "" || day < args.day)) return true;
        return false;
      })
      .map((row) => ({
        ...row,
        done: row.done ?? row.isCompleted ?? false,
        createdAt: row.createdAt ?? 0,
        day: row.day ?? args.day,
      }))
      .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    return filtered;
  },
});

export const add = mutation({
  args: { day: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      day: args.day,
      text: args.text,
      done: false,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("tasks"), done: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { done: args.done });
  },
});
