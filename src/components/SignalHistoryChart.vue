<script setup lang="ts">
import { computed } from "vue";
import { useSignalHistory } from "../composables/useSignalHistory";

const { range, setRange, entries, dates } = useSignalHistory();

// Process data for the chart
const chartData = computed(() => {
  if (!entries.value) return [];
  const grouped: Record<string, { signal: number; noise: number }> = {};

  // Helper
  function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Initialize all days in range for "week"
  // Note: logic simplified here, we rely on entries being sparse or we can fill gaps if needed.
  // For chart aesthetics, filling gaps is better.

  if (range.value === "week") {
    // We need to parse YYYY-MM-DD correctly to avoid UTC shifts
    // But simpler: just iterate 7 days back from today (or based on range)
    // Actually improved: iterate from start date string to end date string
    const startParts = dates.value.start.split("-").map(Number);
    const startDate = new Date(
      startParts[0] ?? 0,
      (startParts[1] ?? 1) - 1,
      startParts[2] ?? 1
    );

    const endParts = dates.value.end.split("-").map(Number);
    const endDate = new Date(
      endParts[0] ?? 0,
      (endParts[1] ?? 1) - 1,
      endParts[2] ?? 1
    );

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const k = formatDateKey(d);
      grouped[k] = { signal: 0, noise: 0 };
    }
  }

  entries.value.forEach((e) => {
    // e.day should be YYYY-MM-DD
    if (!grouped[e.day]) grouped[e.day] = { signal: 0, noise: 0 };
    if (e.type === "Signal") grouped[e.day]!.signal++;
    if (e.type === "Noise") grouped[e.day]!.noise++;
  });

  // Turn day-level tallies into a cumulative average across the selected range
  const sortedEntries = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));

  let cumulativeSignal = 0;
  let cumulativeNoise = 0;

  return sortedEntries.map(([day, counts]) => {
    cumulativeSignal += counts.signal;
    cumulativeNoise += counts.noise;
    const total = cumulativeSignal + cumulativeNoise;
    const ratio = total === 0 ? 0 : Math.round((cumulativeSignal / total) * 100);
    return { day, ratio };
  });
});

const maxRatio = computed(() => 100); // Fixed at 100%
</script>

<template>
  <div
    class="flex w-full flex-col gap-4 rounded-3xl border-2 border-black bg-white px-6 py-6 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.65)]"
  >
    <div class="flex items-center justify-between">
      <p
        class="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-700"
      >
        Signal / Noise History
      </p>
      <div class="flex gap-2">
        <button
          v-for="r in ['week', 'month', 'year']"
          :key="r"
          type="button"
          class="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] transition hover:-translate-y-[1px]"
          :class="
            range === r
              ? 'border-black bg-black text-white'
              : 'border-black/10 bg-black/5 text-neutral-500'
          "
          @click="setRange(r as any)"
        >
          {{ r }}
        </button>
      </div>
    </div>

    <!-- Simple Bar Chart -->
    <div class="relative h-48 w-full">
      <div
        class="absolute inset-0 flex items-end justify-between gap-1 overflow-visible"
      >
        <div
          v-for="item in chartData"
          :key="item.day"
          class="group relative flex h-full flex-1 flex-col justify-end"
        >
          <!-- Bar -->
          <div
            class="w-full rounded-t-sm bg-black transition-all group-hover:bg-neutral-800"
            :style="{ height: `${(item.ratio / maxRatio) * 100}%` }"
          ></div>

          <!-- Tooltip on hover -->
          <div
            class="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white group-hover:block"
            style="z-index: 10"
          >
            <div class="whitespace-nowrap font-bold">{{ item.day }}</div>
            <div class="whitespace-nowrap">
              Cumulative ratio: {{ item.ratio }}%
            </div>
          </div>
        </div>
      </div>
      <!-- Empty state -->
      <div
        v-if="chartData.length === 0"
        class="absolute inset-0 flex items-center justify-center text-sm text-neutral-400"
      >
        No data for this {{ range }}
      </div>
    </div>
  </div>
</template>
