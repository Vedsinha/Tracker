<script setup lang="ts">
import HourlyBoard from "../components/HourlyBoard.vue";
import { useHourlyLog } from "../composables/useHourlyLog";

const { timeBlocks, currentEntries, compactLabel, moveDay } = useHourlyLog();
</script>

<template>
  <section class="mb-6 flex flex-col items-center gap-6">
    <div class="flex items-center justify-center gap-3">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-black bg-black text-white transition hover:-translate-y-[1px]"
        @click="moveDay(-1)"
        aria-label="Previous day"
      >
        ‹
      </button>

      <div
        class="inline-flex min-w-[220px] items-center justify-center rounded-[18px] border-2 border-black bg-white px-6 py-2 text-lg font-semibold uppercase tracking-[0.14em] shadow-[0_12px_0_-6px_rgba(0,0,0,0.85)]"
      >
        {{ compactLabel }}
      </div>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-black bg-black text-white transition hover:-translate-y-[1px]"
        @click="moveDay(1)"
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  </section>

  <HourlyBoard :blocks="timeBlocks" :entries="currentEntries" :editable="false" />
</template>
