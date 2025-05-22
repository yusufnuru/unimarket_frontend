<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <Toaster rich-colors close-button position="top-right" />
  </ClientOnly>
</template>
