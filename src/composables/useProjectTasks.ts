import { ConvexClient } from "convex/browser";
import { ref, watch } from "vue";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type ProjectTask = {
  _id: Id<"projectTasks">;
  projectId: Id<"projects">;
  text: string;
  done: boolean;
};

export function useProjectTasks(projectIdRef: { value: Id<"projects"> | null }) {
  const convexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
  const tasks = ref<ProjectTask[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);

  async function load() {
    if (!projectIdRef.value) {
      tasks.value = [];
      return;
    }
    isLoading.value = true;
    try {
      const rows = await convexClient.query(api.projectTasks.getForProject, {
        projectId: projectIdRef.value,
      });
      tasks.value = rows as ProjectTask[];
    } finally {
      isLoading.value = false;
    }
  }

  async function addTask(text: string) {
    if (!projectIdRef.value || !text.trim()) return;
    isSaving.value = true;
    try {
      await convexClient.mutation(api.projectTasks.add, {
        projectId: projectIdRef.value,
        text: text.trim(),
      });
      await load();
    } finally {
      isSaving.value = false;
    }
  }

  async function toggleTask(id: Id<"projectTasks">, done: boolean) {
    isSaving.value = true;
    try {
      await convexClient.mutation(api.projectTasks.toggle, { id, done });
      tasks.value = tasks.value.map((t) => (t._id === id ? { ...t, done } : t));
    } finally {
      isSaving.value = false;
    }
  }

  watch(
    () => projectIdRef.value,
    () => load(),
    { immediate: true }
  );

  return { tasks, isLoading, isSaving, addTask, toggleTask };
}
