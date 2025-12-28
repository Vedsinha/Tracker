<script setup lang="ts">
const props = defineProps<{
  name?: string;
  editable?: boolean;
}>();

const emit = defineEmits<{
  (e: "save", name: string): void;
}>();

const handleSubmit = (event: Event) => {
  const form = event.target as HTMLFormElement;
  const input = form.elements.namedItem("project") as HTMLInputElement;
  emit("save", input?.value ?? "");
};
</script>

<template>
  <div class="mb-3 w-[300px] bg-transparent px-1 py-1">
    <div v-if="editable" class="mt-1">
      <form class="flex items-center gap-2" @submit.prevent="handleSubmit">
        <input
          name="project"
          type="text"
          :default-value="name"
          autocomplete="off"
          placeholder="Enter project name"
          class="flex-1 rounded-xl border border-black/15 bg-black/5 px-3 py-2 text-sm text-black outline-none placeholder:text-neutral-500"
        />
        <button
          type="submit"
          class="rounded-xl bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_25px_-18px_rgba(0,0,0,0.8)] transition hover:-translate-y-[1px]"
        >
          Save
        </button>
      </form>
    </div>

    <p v-else class="mt-1 text-lg font-normal text-black">
      Currently building {{ name || "..." }}
    </p>
  </div>
</template>
