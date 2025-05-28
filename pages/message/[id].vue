<script setup lang="ts">
import ChatRoomView from '@/components/chat/ChatRoomView.vue';

definePageMeta({
  middleware: 'auth',
  roles: ['buyer'],
  pageTransition: {
    name: 'rotate',
  },
});
</script>
<template>
  <ChatRoomView />
</template>
