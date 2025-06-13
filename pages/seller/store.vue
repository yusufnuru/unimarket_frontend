<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth'],
  roles: ['seller'],
});
</script>

<template>
  <StoreView />
</template>
