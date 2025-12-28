import { computed, ref, watch } from "vue";

export type TimeBlock = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export type EntryType = "Signal" | "Noise" | "Sleep";

export type HourEntry = {
  task: string;
  type: EntryType;
};

type LogsByDate = Record<string, Record<string, HourEntry>>;

const STORAGE_KEY = "hourly-tracker-log";
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

const logs = ref<LogsByDate>(loadLogs());
const selectedDate = ref<string>(getTodayKey());

ensureDay(selectedDate.value);

watch(
  logs,
  (value) => {
    persist(value);
  },
  { deep: true }
);

const currentEntries = computed<Record<string, HourEntry>>(() => {
  ensureDay(selectedDate.value);
  const day = logs.value[selectedDate.value];
  if (!day) {
    const empty = createEmptyDay();
    logs.value[selectedDate.value] = empty;
    return empty;
  }
  return day;
});

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

function ensureDay(dateKey: string) {
  if (!logs.value[dateKey]) {
    logs.value[dateKey] = createEmptyDay();
    return;
  }
  const day = logs.value[dateKey];
  Object.keys(day).forEach((key) => {
    const value = day[key];
    if (!value) {
      day[key] = { task: "", type: "Sleep" };
      return;
    }
    if (typeof value === "string") {
      day[key] = { task: value, type: "Sleep" };
      return;
    }
    day[key] = {
      task: value.task ?? "",
      type: (value.type as EntryType) ?? "Sleep",
    };
  });
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadLogs(): LogsByDate {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as LogsByDate;
    }
  } catch (error) {
    console.warn("Unable to read saved logs, starting fresh.", error);
  }
  return {};
}

function persist(value: LogsByDate) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
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
  ensureDay(dateKey);
}

function updateEntry(blockId: string, value: Partial<HourEntry>) {
  ensureDay(selectedDate.value);
  const day = logs.value[selectedDate.value];
  if (!day) return;
  day[blockId] = {
    task: value.task ?? day[blockId]?.task ?? "",
    type: value.type ?? day[blockId]?.type ?? "Sleep",
  };
}

function resetDay(dateKey: string) {
  logs.value[dateKey] = createEmptyDay();
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
    resetDay,
  };
}
