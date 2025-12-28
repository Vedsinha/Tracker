<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="relative min-h-screen bg-white text-black">
    <main class="relative z-10 w-full px-6 pb-16 pt-10 sm:px-10">
      <RouterView />
    </main>
  </div>
</template>
