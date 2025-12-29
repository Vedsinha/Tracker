import { ConvexClient } from "convex/browser";
import { ref } from "vue";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type ProjectDoc = {
  _id: Id<"projects">;
  name: string;
  done: boolean;
};

export function useProject() {
  const convexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
  const projects = ref<ProjectDoc[]>([]);
  const selectedProjectId = ref<Id<"projects"> | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);

  async function load() {
    isLoading.value = true;
    try {
      const rows = await convexClient.query(api.projects.getAll, {});
      projects.value = rows as ProjectDoc[];
      const firstId = rows[0]?._id as Id<"projects"> | undefined;
      if (!selectedProjectId.value && firstId) {
        selectedProjectId.value = firstId;
      } else if (
        selectedProjectId.value &&
        !rows.find((row) => row._id === selectedProjectId.value)
      ) {
        selectedProjectId.value = firstId ?? null;
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function addProject(name: string) {
    if (!name.trim()) return;
    isSaving.value = true;
    try {
      const id = await convexClient.mutation(api.projects.add, { name });
      await load();
      selectedProjectId.value = id as Id<"projects">;
    } finally {
      isSaving.value = false;
    }
  }

  async function setDone(id: Id<"projects">, done: boolean) {
    isSaving.value = true;
    try {
      await convexClient.mutation(api.projects.setDone, { id, done });
      projects.value = projects.value.map((p) => (p._id === id ? { ...p, done } : p));
    } finally {
      isSaving.value = false;
    }
  }

  load();

  return {
    projects,
    selectedProjectId,
    isLoading,
    isSaving,
    addProject,
    setDone,
    selectProject: (id: Id<"projects">) => {
      selectedProjectId.value = id;
    },
    reload: load,
  };
}
