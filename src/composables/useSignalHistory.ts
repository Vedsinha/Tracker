import { ConvexClient } from "convex/browser";
import { computed, ref, watch } from "vue";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

export type HistoryRange = "week" | "month" | "year";

export function useSignalHistory() {
  const convexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
  const range = ref<HistoryRange>("week");
  const entries = ref<Doc<"entries">[]>([]);
  const isLoading = ref(false);

  const setRange = (val: HistoryRange) => {
    range.value = val;
  };

  // Helper to match useHourlyLog format (YYYY-MM-DD in local time)
  function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const dates = computed((): { start: string; end: string } => {
    const now = new Date();
    const end = formatDateKey(now);
    const startObj = new Date();

    if (range.value === "week") {
      startObj.setDate(now.getDate() - 7);
    } else if (range.value === "month") {
      startObj.setDate(now.getDate() - 30);
    } else if (range.value === "year") {
      startObj.setFullYear(now.getFullYear() - 1);
    }

    const start = formatDateKey(startObj);
    return { start, end };
  });

  async function load() {
    isLoading.value = true;
    try {
      const rows = await convexClient.query(api.entries.getRange, {
        startDate: dates.value.start,
        endDate: dates.value.end,
      });
      entries.value = rows;
    } finally {
      isLoading.value = false;
    }
  }

  watch(
    dates,
    () => {
      load();
    },
    { immediate: true }
  );

  return {
    range,
    setRange,
    entries,
    isLoading,
    dates,
  };
}
