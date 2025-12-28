<script setup lang="ts">
import { computed } from "vue";
import { useTaskStats } from "../composables/useTaskStats";

const {
  countWeek,
  countMonth,
  countQuarter,
  countYear,
  projectsWeek,
  projectsMonth,
  projectsQuarter,
  projectsYear,
} = useTaskStats();

const taskStats = computed(() => [
  { label: "This Week", value: countWeek.value ?? 0 },
  { label: "This Month", value: countMonth.value ?? 0 },
  { label: "This Quarter", value: countQuarter.value ?? 0 },
  { label: "This Year", value: countYear.value ?? 0 },
]);

const projectStats = computed(() => [
  { label: "This Week", value: projectsWeek.value ?? 0 },
  { label: "This Month", value: projectsMonth.value ?? 0 },
  { label: "This Quarter", value: projectsQuarter.value ?? 0 },
  { label: "This Year", value: projectsYear.value ?? 0 },
]);
</script>

<template>
  <div
    class="flex w-full flex-col gap-4 rounded-3xl border-2 border-black bg-white px-6 py-6 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.65)]"
  >
    <p
      class="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-700"
    >
      Project Tasks & Projects Done
    </p>

    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-3">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Project Tasks Completed
        </p>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div
            v-for="stat in taskStats"
            :key="stat.label"
            class="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-black/5 py-4"
          >
            <span class="text-3xl font-extrabold text-black">{{ stat.value }}</span>
            <span
              class="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-neutral-500"
            >
              {{ stat.label }}
            </span>
          </div>
        </div>
      </div>

      <div class="h-px w-full bg-neutral-200" />

      <div class="flex flex-col gap-3">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Projects Completed
        </p>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div
            v-for="stat in projectStats"
            :key="stat.label"
            class="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-black/5 py-4"
          >
            <span class="text-3xl font-extrabold text-black">{{ stat.value }}</span>
            <span
              class="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-neutral-500"
            >
              {{ stat.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
