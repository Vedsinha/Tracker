<script setup lang="ts">
import type { Id } from "../../convex/_generated/dataModel";
import type { ProjectDoc } from "../composables/useProject";

const props = defineProps<{
  projects: ProjectDoc[];
  selectedId: Id<"projects"> | null;
  editable?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: Id<"projects">): void;
  (e: "add", name: string): void;
}>();

const handleAdd = (event: Event) => {
  const form = event.target as HTMLFormElement;
  const input = form.elements.namedItem("project") as HTMLInputElement;
  const value = input?.value ?? "";
  emit("add", value);
  if (input) input.value = "";
};
</script>

<template>
  <div
    class="mb-0 flex h-full w-full flex-col rounded-3xl border-2 border-black bg-white px-6 py-5 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.65)]"
  >
    <div class="flex items-center justify-between">
      <p
        class="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-700"
      >
        Projects
      </p>
      <span
        class="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500"
      >
        {{ projects.length }} total
      </span>
    </div>

    <div v-if="editable" class="mt-3">
      <form class="flex items-center gap-2" @submit.prevent="handleAdd">
        <input
          name="project"
          type="text"
          autocomplete="off"
          placeholder="Add a project"
          class="flex-1 rounded-xl border border-black/15 bg-black/5 px-3 py-2 text-sm text-black outline-none placeholder:text-neutral-500"
        />
        <button
          type="submit"
          class="rounded-xl bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_25px_-18px_rgba(0,0,0,0.8)] transition hover:-translate-y-[1px]"
        >
          Add
        </button>
      </form>
    </div>

    <div class="mt-3 space-y-2">
      <button
        v-for="project in projects"
        :key="project._id"
        type="button"
        class="flex w-full items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 text-left text-sm transition hover:bg-black/5"
        :class="project._id === selectedId ? 'ring-2 ring-black' : ''"
        @click="emit('select', project._id)"
      >
        <span
          :class="project.done ? 'line-through text-neutral-500' : 'text-black'"
        >
          {{ project.name }}
        </span>
        <span
          class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-neutral-500"
        >
          {{ project.done ? "Done" : "Active" }}
        </span>
      </button>
      <p v-if="projects.length === 0" class="text-sm text-neutral-500">
        No projects yet.
      </p>
    </div>
  </div>
</template>
