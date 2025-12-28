import { ConvexClient } from "convex/browser";
import { computed, ref, watch } from "vue";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type TimeBlock = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export type EntryType = "Signal" | "Noise" | "Sleep";

export type HourEntry = {
  _id?: Id<"entries">;
  task: string;
  type: EntryType;
};

const START_HOUR = 4;
const BLOCK_COUNT = 24;

const timeBlocks: TimeBlock[] = Array.from({ length: BLOCK_COUNT }, (_, index) => {
  const start = (START_HOUR + index) % 24;
  const end = (start + 1) % 24;
  return {
    id: `block-${start}`,
    label: `${formatHour(start)} - ${formatHour(end)}`,
    start,
    end,
  };
});

const selectedDate = ref<string>(getTodayKey());

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convexClient = new ConvexClient(convexUrl);
const fetched = ref<{ _id: Id<"entries">; blockId: string; task: string; type: EntryType; startHour: number }[]>(
  []
);
const isPending = ref(false);
const isSaving = ref(false);

const currentEntries = computed<Record<string, HourEntry>>(() => {
  const defaults: Record<string, HourEntry> = createEmptyDay();
  const docs = fetched.value ?? [];
  docs.forEach((doc) => {
    defaults[doc.blockId] = { _id: doc._id, task: doc.task, type: doc.type };
  });
  return defaults;
});

async function loadDay() {
  isPending.value = true;
  try {
    const rows = await convexClient.query(api.entries.getDay, { day: selectedDate.value });
    fetched.value = rows;
  } finally {
    isPending.value = false;
  }
}

watch(
  selectedDate,
  () => {
    loadDay();
  },
  { immediate: true }
);

function formatHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${hour12}:00 ${suffix}`;
}

function createEmptyDay() {
  const entries: Record<string, HourEntry> = {};
  timeBlocks.forEach((block) => {
    entries[block.id] = { task: "", type: "Sleep" };
  });
  return entries;
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string) {
  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  if (!yearStr || !monthStr || !dayStr) return dateKey;
  const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function formatCompactLabel(dateKey: string) {
  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  if (!yearStr || !monthStr || !dayStr) return dateKey.toUpperCase();
  const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  const weekday = date.toLocaleDateString("en", { weekday: "short" }).toUpperCase();
  const month = date.toLocaleDateString("en", { month: "short" }).toUpperCase();
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${weekday} ${day} ${month}`;
}

function setDate(dateKey: string) {
  selectedDate.value = dateKey;
}

function updateEntry(blockId: string, value: Partial<HourEntry>) {
  const block = timeBlocks.find((b) => b.id === blockId);
  if (!block) return;

  const existing = currentEntries.value[blockId];
  const nextTask = value.task ?? existing?.task ?? "";
  const nextType = value.type ?? existing?.type ?? "Sleep";

  isSaving.value = true;
  convexClient
    .mutation(api.entries.setEntry, {
      day: selectedDate.value,
      blockId,
      startHour: block.start,
      task: nextTask,
      type: nextType,
    })
    .then(() => loadDay())
    .finally(() => {
      isSaving.value = false;
    });
}

export function useHourlyLog() {
  const selectedLabel = computed(() => formatDateLabel(selectedDate.value));
  const compactLabel = computed(() => formatCompactLabel(selectedDate.value));

  return {
    selectedDate,
    selectedLabel,
    compactLabel,
    timeBlocks,
    currentEntries,
    isLoading: isPending,
    isSaving,
    setDate,
    setToToday: () => setDate(getTodayKey()),
    moveDay: (delta: number) => {
      const [yearStr, monthStr, dayStr] = selectedDate.value.split("-");
      const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
      date.setDate(date.getDate() + delta);
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      setDate(`${year}-${month}-${day}`);
    },
    updateEntry,
  };
}
