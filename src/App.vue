<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="relative min-h-screen bg-white text-black">
    <main class="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-10">
      <RouterView />
    </main>
  </div>
</template>
