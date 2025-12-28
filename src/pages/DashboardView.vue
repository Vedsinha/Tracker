<script setup lang="ts">
import { computed, ref } from "vue";
import HourlyBoard from "../components/HourlyBoard.vue";
import ProjectsCard from "../components/ProjectsCard.vue";
import ProjectTasksCard from "../components/ProjectTasksCard.vue";
import RatioCard from "../components/RatioCard.vue";
import SignalHistoryChart from "../components/SignalHistoryChart.vue";
import TaskStatsCard from "../components/TaskStatsCard.vue";
import TasksCard from "../components/TasksCard.vue";
import { useHourlyLog } from "../composables/useHourlyLog";
import { useProject } from "../composables/useProject";
import { useProjectTasks } from "../composables/useProjectTasks";
import { useTasks } from "../composables/useTasks";

const { timeBlocks, currentEntries, compactLabel, moveDay, selectedDate } =
  useHourlyLog();
const { projects, selectedProjectId, selectProject } = useProject(selectedDate);
const { tasks, toggleTask, pendingCount } = useTasks(selectedDate);
const {
  tasks: projectTasks,
  addTask: addProjectTask,
  toggleTask: toggleProjectTask,
} = useProjectTasks(selectedProjectId);

const signalCount = computed(
  () =>
    Object.values(currentEntries.value ?? {}).filter(
      (entry) => entry?.type === "Signal"
    ).length
);
const noiseCount = computed(
  () =>
    Object.values(currentEntries.value ?? {}).filter(
      (entry) => entry?.type === "Noise"
    ).length
);
const ratio = computed(() => {
  const total = signalCount.value + noiseCount.value;
  if (total === 0) return 0;
  return Math.round((signalCount.value / total) * 100);
});

const activeTab = ref<"planning" | "execution" | "stats">("planning");
</script>

<template>
  <section class="relative mb-6 flex h-14 items-center justify-between">
    <!-- Left: Tabs -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-full border px-3 py-2 text-sm font-semibold"
        :class="
          activeTab === 'planning'
            ? 'border-black bg-black text-white'
            : 'border-black text-black'
        "
        @click="activeTab = 'planning'"
      >
        Planning
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-2 text-sm font-semibold"
        :class="
          activeTab === 'execution'
            ? 'border-black bg-black text-white'
            : 'border-black text-black'
        "
        @click="activeTab = 'execution'"
      >
        Execution
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-2 text-sm font-semibold"
        :class="
          activeTab === 'stats'
            ? 'border-black bg-black text-white'
            : 'border-black text-black'
        "
        @click="activeTab = 'stats'"
      >
        Stats
      </button>
    </div>

    <!-- Center: Date Navigation (Absolutely Centered) -->
    <div
      class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-3"
    >
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

  <section v-if="activeTab === 'execution'" class="mb-6 flex flex-col gap-4">
    <div class="w-full" style="max-height: calc(100vh - 200px); overflow: auto">
      <HourlyBoard
        :blocks="timeBlocks"
        :entries="currentEntries"
        :editable="false"
      />
    </div>
  </section>

  <section v-else-if="activeTab === 'stats'" class="flex flex-col gap-8">
    <div class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="lg:col-span-2">
        <RatioCard
          :ratio="ratio"
          :signal-count="signalCount"
          :noise-count="noiseCount"
        />
      </div>

      <div class="lg:col-span-2">
        <SignalHistoryChart />
      </div>

      <div class="lg:col-span-2">
        <TaskStatsCard />
      </div>
    </div>
  </section>

  <section v-else class="flex flex-col gap-8">
    <div
      class="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 min-h-[calc(100vh-150px)]"
    >
      <div class="flex flex-col">
        <ProjectsCard
          :projects="projects"
          :selected-id="selectedProjectId"
          :editable="false"
          @select="selectProject"
        />
      </div>

      <div class="flex flex-col">
        <ProjectTasksCard
          :project-name="
            projects.find((p) => p._id === selectedProjectId)?.name
          "
          :tasks="projectTasks"
          :editable="false"
          @add="addProjectTask"
          @toggle="({ id, done }) => toggleProjectTask(id, done)"
        />
      </div>

      <div class="flex flex-col">
        <TasksCard
          :tasks="tasks"
          :pending-count="pendingCount"
          :editable="false"
          @toggle="({ id, done }) => toggleTask(id, done)"
        />
      </div>
    </div>
  </section>
</template>
