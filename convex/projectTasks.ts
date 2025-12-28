import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function updateProjectDone(ctx: any, projectId: any) {
  const tasks = await ctx.db
    .query("projectTasks")
    .withIndex("by_project_created", (q: any) => q.eq("projectId", projectId))
    .collect();
  const allDone = tasks.length > 0 && tasks.every((t: any) => t.done ?? false);
  const project = await ctx.db.get(projectId);
  if (!project) return;
  await ctx.db.patch(projectId, {
    done: allDone,
    completedAt: allDone ? project.completedAt ?? Date.now() : undefined,
  });
}

export const getForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("projectTasks")
      .withIndex("by_project_created", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();
    return rows.map((row) => ({
      ...row,
      done: row.done ?? false,
      createdAt: row.createdAt ?? 0,
    }));
  },
});

export const add = mutation({
  args: { projectId: v.id("projects"), text: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("projectTasks", {
      projectId: args.projectId,
      text: args.text.trim(),
      done: false,
      createdAt: Date.now(),
    });
    await updateProjectDone(ctx, args.projectId);
    return id;
  },
});

export const toggle = mutation({
  args: { id: v.id("projectTasks"), done: v.boolean() },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return;
    await ctx.db.patch(args.id, {
      done: args.done,
      completedAt: args.done ? Date.now() : undefined,
    });
    await updateProjectDone(ctx, task.projectId);
  },
});

export const getCompletedInTimeRange = query({
  args: { start: v.number(), end: v.number() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("projectTasks")
      .withIndex("by_completedAt", (q) =>
        q.gte("completedAt", args.start).lte("completedAt", args.end)
      )
      .collect();
    return tasks.length;
  },
});
