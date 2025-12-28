<script setup lang="ts">
const props = defineProps<{
  ratio: number;
  signalCount: number;
  noiseCount: number;
}>();
</script>

<template>
  <div
    class="drop-card flex h-full w-full flex-col items-center gap-4 rounded-3xl border-2 border-black bg-white px-6 py-6 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.65)]"
  >
    <p
      class="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600"
    >
      Signal / Noise Ratio
    </p>

    <p class="text-5xl font-extrabold text-black">{{ Math.round(ratio) }}%</p>

    <div class="h-1 w-10 rounded-full bg-black" />
    <div class="h-px w-full bg-neutral-200" />

    <div class="flex w-full items-center justify-between text-center">
      <div class="flex-1">
        <p class="text-lg font-semibold text-black">{{ signalCount }}h</p>
        <p
          class="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600"
        >
          Signal
        </p>
      </div>
      <div class="flex-1">
        <p class="text-lg font-semibold text-black">{{ noiseCount }}h</p>
        <p
          class="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600"
        >
          Noise
        </p>
      </div>
    </div>
  </div>
</template>
