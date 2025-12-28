<script setup lang="ts">
import type { Id } from "../../convex/_generated/dataModel";
import type { ProjectTask } from "../composables/useProjectTasks";

const props = defineProps<{
  tasks: ProjectTask[];
  editable?: boolean;
  projectName?: string;
}>();

const emit = defineEmits<{
  (e: "add", text: string): void;
  (e: "toggle", payload: { id: Id<"projectTasks">; done: boolean }): void;
}>();

const handleAdd = (event: Event) => {
  const form = event.target as HTMLFormElement;
  const input = form.elements.namedItem("task") as HTMLInputElement;
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
        Tasks for {{ projectName || "..." }}
      </p>
      <span
        class="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500"
      >
        {{ tasks.length }} items
      </span>
    </div>

    <div v-if="editable" class="mt-3">
      <form class="flex items-center gap-2" @submit.prevent="handleAdd">
        <input
          name="task"
          type="text"
          autocomplete="off"
          placeholder="Add task"
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
      <div
        v-for="task in tasks"
        :key="task._id"
        class="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-[0_10px_25px_-24px_rgba(0,0,0,0.5)]"
      >
        <input
          type="checkbox"
          :checked="task.done"
          :disabled="!editable"
          class="h-4 w-4 cursor-pointer accent-black"
          @change="emit('toggle', { id: task._id, done: !task.done })"
        />
        <p :class="task.done ? 'line-through text-neutral-500' : 'text-black'">
          {{ task.text }}
        </p>
      </div>
      <p v-if="tasks.length === 0" class="text-sm text-neutral-500">
        No tasks yet.
      </p>
    </div>
  </div>
</template>
