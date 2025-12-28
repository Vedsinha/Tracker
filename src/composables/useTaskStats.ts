import { ConvexClient } from "convex/browser";
import { ref, onMounted } from "vue";
import { api } from "../../convex/_generated/api";

export function useTaskStats() {
  const convexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
  const projectsApi = (api as any).projects;

  const countWeek = ref(0);
  const countMonth = ref(0);
  const countQuarter = ref(0);
  const countYear = ref(0);
  const projectsWeek = ref(0);
  const projectsMonth = ref(0);
  const projectsQuarter = ref(0);
  const projectsYear = ref(0);
  const isLoading = ref(false);

  async function load() {
    isLoading.value = true;
    const now = new Date();
    // Reset times

    // Week
    const dWeek = new Date(now);
    const day = dWeek.getDay() || 7; // Get current day number, converting Sun (0) to 7
    if (day !== 1) dWeek.setHours(-24 * (day - 1)); // adjust backwards
    dWeek.setHours(0, 0, 0, 0);
    const startOfWeek = dWeek.getTime();

    // Month
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();

    // Quarter
    const startOfQuarter = new Date(
      now.getFullYear(),
      Math.floor(now.getMonth() / 3) * 3,
      1
    ).getTime();

    // Year
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const endTime = Date.now();

    try {
      const [
        w,
        m,
        q,
        y,
        pw,
        pm,
        pq,
        py,
      ] = await Promise.all([
        convexClient.query(api.projectTasks.getCompletedInTimeRange, {
          start: startOfWeek,
          end: endTime,
        }),
        convexClient.query(api.projectTasks.getCompletedInTimeRange, {
          start: startOfMonth,
          end: endTime,
        }),
        convexClient.query(api.projectTasks.getCompletedInTimeRange, {
          start: startOfQuarter,
          end: endTime,
        }),
        convexClient.query(api.projectTasks.getCompletedInTimeRange, {
          start: startOfYear,
          end: endTime,
        }),
        convexClient.query(projectsApi.getCompletedInTimeRange, {
          start: startOfWeek,
          end: endTime,
        }),
        convexClient.query(projectsApi.getCompletedInTimeRange, {
          start: startOfMonth,
          end: endTime,
        }),
        convexClient.query(projectsApi.getCompletedInTimeRange, {
          start: startOfQuarter,
          end: endTime,
        }),
        convexClient.query(projectsApi.getCompletedInTimeRange, {
          start: startOfYear,
          end: endTime,
        }),
      ]);
      countWeek.value = w;
      countMonth.value = m;
      countQuarter.value = q;
      countYear.value = y;
      projectsWeek.value = pw;
      projectsMonth.value = pm;
      projectsQuarter.value = pq;
      projectsYear.value = py;
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    load();
  });

  return {
    countWeek,
    countMonth,
    countQuarter,
    countYear,
    projectsWeek,
    projectsMonth,
    projectsQuarter,
    projectsYear,
    isLoading,
    refresh: load,
  };
}
