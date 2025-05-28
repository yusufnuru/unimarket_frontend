<script setup lang="ts">
import ChatListView from '@/components/chat/ChatListView.vue';

definePageMeta({
  middleware: 'auth',
  roles: ['buyer'],
  pageTransition: {
    name: 'rotate',
  },
});
</script>
<template>
  <ChatListView />
</template>
