<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth-redirect'],
});
</script>
<template>
  <LoginForm />
</template>
