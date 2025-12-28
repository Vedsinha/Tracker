import { ConvexClient } from "convex/browser";
import { computed, ref, watch } from "vue";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type Task = {
  _id: Id<"tasks">;
  text: string;
  done: boolean;
};

export function useTasks(dayRef: { value: string }) {
  const convexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
  const tasks = ref<Task[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);

  async function load() {
    isLoading.value = true;
    try {
      const rows = await convexClient.query(api.tasks.getDay, { day: dayRef.value });
      tasks.value = rows as Task[];
    } finally {
      isLoading.value = false;
    }
  }

  async function addTask(text: string) {
    if (!text.trim()) return;
    isSaving.value = true;
    try {
      await convexClient.mutation(api.tasks.add, { day: dayRef.value, text: text.trim() });
      await load();
    } finally {
      isSaving.value = false;
    }
  }

  async function toggleTask(id: Id<"tasks">, done: boolean) {
    isSaving.value = true;
    try {
      await convexClient.mutation(api.tasks.toggle, { id, done });
      tasks.value = tasks.value.map((t) => (t._id === id ? { ...t, done } : t));
    } finally {
      isSaving.value = false;
    }
  }

  const pendingCount = computed(() => tasks.value.filter((t) => !t.done).length);

  watch(
    () => dayRef.value,
    () => load(),
    { immediate: true }
  );

  return {
    tasks,
    isLoading,
    isSaving,
    pendingCount,
    addTask,
    toggleTask,
  };
}
