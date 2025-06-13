<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth'],
  roles: ['seller'],
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-2xl font-bold mb-4">Seller Settings</h1>
    <p class="text-gray-600">Manage your seller account settings here.</p>
  </div>
</template>

<style scoped></style>
