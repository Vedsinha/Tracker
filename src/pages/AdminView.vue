<script setup lang="ts">
import { ref } from "vue";
import HourlyBoard from "../components/HourlyBoard.vue";
import type { HourEntry } from "../composables/useHourlyLog";
import { useHourlyLog } from "../composables/useHourlyLog";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "tracker@14042023";
const SESSION_KEY = import.meta.env.VITE_SESSION_KEY ?? "hourly-tracker-admin";

const {
  timeBlocks,
  currentEntries,
  compactLabel,
  moveDay,
  updateEntry,
} = useHourlyLog();

const password = ref("");
const isUnlocked = ref(checkSession());
const error = ref("");

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

function lockEditing() {
  isUnlocked.value = false;
  persistSession(false);
}

function handleUpdate(payload: { id: string; value: Partial<HourEntry> }) {
  if (!isUnlocked.value) return;
  updateEntry(payload.id, payload.value);
}
</script>

<template>
  <section class="mb-8 flex flex-col items-center gap-4">
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

    <div class="flex flex-wrap items-center justify-center gap-3">
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
          placeholder="tracker@14042023"
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
          class="rounded-xl border border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-[1px]"
          @click="lockEditing"
        >
          Lock
        </button>
      </form>
      <p v-if="error" class="w-full text-center text-sm text-red-600">{{ error }}</p>
    </div>
  </section>

  <HourlyBoard
    :blocks="timeBlocks"
    :entries="currentEntries"
    :editable="isUnlocked"
    @update="handleUpdate"
  />
</template>
