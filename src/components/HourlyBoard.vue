<script setup lang="ts">
import { computed } from "vue";
import type { EntryType, HourEntry, TimeBlock } from "../composables/useHourlyLog";

const props = defineProps<{
  blocks: TimeBlock[];
  entries: Record<string, HourEntry>;
  editable?: boolean;
}>();

const emit = defineEmits<{
  (e: "update", payload: { id: string; value: Partial<HourEntry> }): void;
}>();

const filledCount = computed(() =>
  props.blocks.reduce((count, block) => {
    return count + (props.entries?.[block.id]?.task.trim() ? 1 : 0);
  }, 0)
);

const handleInput = (blockId: string, event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update", { id: blockId, value: { task: target.value } });
};

const handleTypeChange = (blockId: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update", { id: blockId, value: { type: target.value as EntryType } });
};
</script>

<template>
  <div class="flex items-center justify-between pb-3 text-xs uppercase tracking-[0.14em] text-neutral-600">
    <span>{{ filledCount }} / {{ blocks.length }} hours logged</span>
    <span :class="editable ? 'text-black' : 'text-neutral-500'">
      {{ editable ? "Editing unlocked" : "View only" }}
    </span>
  </div>

  <div class="overflow-hidden rounded-2xl border border-black/20 shadow-[0_10px_40px_-30px_rgba(0,0,0,0.85)]">
    <div
      class="grid grid-cols-[1fr_2fr_1fr] bg-black text-center text-white text-[0.8rem] font-semibold uppercase tracking-[0.12em]"
    >
      <div class="border-r border-white/20 px-4 py-3">Time slot</div>
      <div class="border-r border-white/20 px-4 py-3">Activity / Task</div>
      <div class="px-4 py-3">Type</div>
    </div>

    <div class="divide-y divide-black/15">
      <div
        v-for="block in blocks"
        :key="block.id"
        class="grid grid-cols-[1fr_2fr_1fr] bg-white"
      >
        <div class="flex items-center border-r border-black/10 px-4 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-neutral-800">
          {{ block.label }}
        </div>
        <div class="border-r border-black/10 px-4 py-3">
          <template v-if="editable">
            <textarea
              :value="entries[block.id]?.task ?? ''"
              @input="handleInput(block.id, $event)"
              class="h-16 w-full resize-none rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/15"
              placeholder="What did you focus on this hour?"
            />
          </template>
          <template v-else>
            <p class="min-h-[4rem] whitespace-pre-line text-sm text-neutral-700">
              {{ entries[block.id]?.task || "—" }}
            </p>
          </template>
        </div>
        <div class="flex items-center justify-between gap-2 px-4 py-3 text-sm">
          <template v-if="editable">
            <select
              :value="
                entries[block.id]?.type === 'Sleep' && !entries[block.id]?.task
                  ? ''
                  : entries[block.id]?.type ?? ''
              "
              @change="handleTypeChange(block.id, $event)"
              class="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-semibold text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/15"
            >
              <option disabled value="">Select type</option>
              <option value="Signal">Signal</option>
              <option value="Noise">Noise</option>
              <option value="Sleep">Sleep</option>
            </select>
          </template>
          <template v-else>
            <span
              class="inline-flex w-full items-center justify-center rounded-full border border-black/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-800"
            >
              {{
                entries[block.id]?.type === "Sleep" && !entries[block.id]?.task
                  ? "—"
                  : entries[block.id]?.type || "—"
              }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
