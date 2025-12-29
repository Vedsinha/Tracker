<script setup lang="ts">
import { computed, ref } from "vue";
import HourlyBoard from "../components/HourlyBoard.vue";
import ProjectsCard from "../components/ProjectsCard.vue";
import ProjectTasksCard from "../components/ProjectTasksCard.vue";
import RatioCard from "../components/RatioCard.vue";
import SignalHistoryChart from "../components/SignalHistoryChart.vue";
import TaskStatsCard from "../components/TaskStatsCard.vue";
import TasksCard from "../components/TasksCard.vue";
import type { HourEntry } from "../composables/useHourlyLog";
import { useHourlyLog } from "../composables/useHourlyLog";
import { useProject } from "../composables/useProject";
import { useProjectTasks } from "../composables/useProjectTasks";
import { useTasks } from "../composables/useTasks";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;

const {
  timeBlocks,
  currentEntries,
  compactLabel,
  moveDay,
  selectedDate,
  updateEntry,
  isSaving,
  saveDirtyEntries,
} = useHourlyLog();

const { projects, selectedProjectId, addProject, selectProject } = useProject();
const { tasks: projectTasks, addTask: addProjectTask, toggleTask: toggleProjectTask } =
  useProjectTasks(selectedProjectId);
const { tasks, addTask, toggleTask, pendingCount } = useTasks(selectedDate);

const signalCount = computed(
  () =>
    Object.values(currentEntries.value ?? {}).filter((entry) => entry?.type === "Signal").length
);
const noiseCount = computed(
  () =>
    Object.values(currentEntries.value ?? {}).filter((entry) => entry?.type === "Noise").length
);
const ratio = computed(() => {
  if (noiseCount.value === 0) {
    return signalCount.value === 0 ? 0 : signalCount.value;
  }
  return Math.round(signalCount.value / noiseCount.value);
});

const activeTab = ref<"planning" | "execution" | "stats">("execution");

const password = ref("");
const isUnlocked = ref(checkSession());
const error = ref("");
const locking = ref(false);

function checkSession() {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

function persistSession(allowed: boolean) {
  if (typeof sessionStorage === "undefined") return;
  if (allowed) {
    sessionStorage.setItem(SESSION_KEY, "true");
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function handleSubmit() {
  if (password.value === ADMIN_PASSWORD) {
    isUnlocked.value = true;
    error.value = "";
    persistSession(true);
  } else {
    error.value = "Incorrect password. View mode only.";
    isUnlocked.value = false;
    persistSession(false);
  }
}

async function lockEditing() {
  if (locking.value) return;
  locking.value = true;
  isUnlocked.value = false;
  try {
    await saveDirtyEntries();
  } finally {
    persistSession(false);
    locking.value = false;
  }
}

function handleUpdate(payload: { id: string; value: Partial<HourEntry> }) {
  if (!isUnlocked.value) return;
  updateEntry(payload.id, payload.value);
}
</script>

<template>
  <section class="relative mb-6 flex h-14 items-center justify-between">
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-full border px-3 py-2 text-sm font-semibold"
        :class="activeTab === 'planning' ? 'border-black bg-black text-white' : 'border-black text-black'"
        @click="activeTab = 'planning'"
      >
        Planning
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-2 text-sm font-semibold"
        :class="activeTab === 'execution' ? 'border-black bg-black text-white' : 'border-black text-black'"
        @click="activeTab = 'execution'"
      >
        Execution
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-2 text-sm font-semibold"
        :class="activeTab === 'stats' ? 'border-black bg-black text-white' : 'border-black text-black'"
        @click="activeTab = 'stats'"
      >
        Stats
      </button>
    </div>

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

  <section class="mb-6 flex flex-wrap items-center justify-center gap-3">
    <span
      class="rounded-full border border-black/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
      :class="isUnlocked ? 'border-black text-black' : 'text-neutral-700'"
    >
      {{ isUnlocked ? "Editing enabled" : "View only" }}
    </span>

    <form class="flex flex-wrap items-center gap-2" @submit.prevent="handleSubmit">
      <input
        v-model="password"
        :disabled="isUnlocked"
        type="password"
        autocomplete="current-password"
        class="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-black shadow-inner shadow-black/5 outline-none transition focus:border-black focus:ring-2 focus:ring-black/20 disabled:opacity-60"
      />
      <button
        type="submit"
        class="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isUnlocked"
      >
        {{ isUnlocked ? "Unlocked" : "Unlock" }}
      </button>
      <button
        v-if="isUnlocked"
        type="button"
        class="rounded-xl border border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSaving || locking"
        @click="lockEditing"
      >
        {{ isSaving || locking ? "Saving..." : "Lock" }}
      </button>
    </form>
    <p v-if="error" class="w-full text-center text-sm text-red-600">{{ error }}</p>
  </section>

  <section v-if="activeTab === 'execution'" class="mb-8 flex flex-col gap-4">
    <div
      class="w-full"
      style="max-height: calc(100vh - 200px); overflow: auto;"
    >
      <HourlyBoard
        :blocks="timeBlocks"
        :entries="currentEntries"
        :editable="isUnlocked"
        @update="handleUpdate"
      />
    </div>
  </section>

  <section v-else-if="activeTab === 'stats'" class="flex flex-col gap-8">
    <div class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="lg:col-span-2">
        <RatioCard :ratio="ratio" :signal-count="signalCount" :noise-count="noiseCount" />
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
          :editable="isUnlocked"
          @add="addProject"
          @select="selectProject"
        />
      </div>

      <div class="flex flex-col">
        <ProjectTasksCard
          :project-name="projects.find((p) => p._id === selectedProjectId)?.name"
          :tasks="projectTasks"
          :editable="isUnlocked && !!selectedProjectId"
          @add="addProjectTask"
          @toggle="({ id, done }) => toggleProjectTask(id, done)"
        />
      </div>

      <div class="flex flex-col">
        <TasksCard
          :tasks="tasks"
          :pending-count="pendingCount"
          :editable="isUnlocked"
          @add="addTask"
          @toggle="({ id, done }) => toggleTask(id, done)"
        />
      </div>
    </div>
  </section>
</template>
