<script setup lang="ts">
import { computed } from 'vue';
import type { ChatMessage } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps<{
  message: ChatMessage;
  showSenderName?: boolean;
}>();

const authStore = useAuthStore();

const isMyMessage = computed(() => {
  return props.message.senderId === authStore.userId;
});

const formattedTime = computed(() => {
  const date = new Date(props.message.createdAt);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

const senderName = computed(() => {
  if (props.message.senderProfile) {
    return props.message.senderProfile.fullName;
  }
  return 'Unknown User';
});
</script>

<template>
  <div class="mb-4" :class="{ 'text-right': isMyMessage }">
    <div v-if="showSenderName && !isMyMessage" class="text-2xl text-gray-500 mb-1 ml-2">
      <h3>{{ senderName }}</h3>
    </div>

    <div class="flex" :class="{ 'justify-end': isMyMessage }">
      <div
        class="max-w-[80%] rounded-lg px-3 py-2 inline-block text-left"
        :class="[
          isMyMessage
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-800 rounded-tl-none',
        ]"
      >
        <div class="flex items-center gap-2">
          <p class="w-full break-words">{{ message.message }}</p>
        </div>

        <div
          class="text-xs mt-1 flex items-center justify-end gap-1"
          :class="{ 'text-white/70': isMyMessage, 'text-gray-500': !isMyMessage }"
        >
          {{ formattedTime }}
          <span v-if="isMyMessage" class="ml-1">
            <svg
              v-if="message.isRead"
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <div v-if="message.attachmentUrl" class="mt-1">
      <a
        :href="message.attachmentUrl"
        target="_blank"
        class="text-xs text-blue-500 hover:underline"
      >
        View Attachment
      </a>
    </div>
  </div>
</template>
