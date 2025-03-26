<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue';
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <Toaster />
  </ClientOnly>
</template>
