<script setup lang="ts">
import ChatRoomView from '@/components/chat/ChatRoomView.vue';

definePageMeta({
  middleware: 'auth',
  roles: ['seller'],
  layout: 'seller',
  pageTransition: {
    name: 'rotate',
  },
});
</script>

<template>
  <ChatRoomView />
</template>
