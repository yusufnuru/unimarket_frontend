<script setup lang="ts">
import { computed, defineProps } from 'vue';
import type { ChatPreview } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps<{
  chat: ChatPreview;
  isActive?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select'): void;
}>();

const authStore = useAuthStore();

const displayName = computed(() => {
  if (authStore.role === 'buyer') return props.chat.storeName;
  else return props.chat.buyerName;
});

const senderName = computed(() => {
  const { senderId, buyerId, storeId, buyerName, storeName } = props.chat;
  const data = {
    senderId,
    buyerId,
    storeId,
    buyerName,
    storeName,
  };
  console.log(data);
  if (!senderId) return 'Unknown User';

  const currentUserId = authStore.userId;

  if (!senderId) return 'Unknown User';
  if (senderId === currentUserId) return 'You';

  if (senderId === buyerId) return buyerName;
  if (senderId !== buyerId) return storeName;

  return 'Unknown User';
});

const formattedTime = computed(() => {
  const date = new Date(props.chat.lastMessageTime || new Date());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (date >= yesterday) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
});
</script>

<template>
  <div
    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors"
    :class="[isActive ? 'bg-primary/10' : 'hover:bg-gray-100']"
    @click="emit('select')"
  >
    <div class="flex items-center space-x-3 overflow-hidden">
      <div
        class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"
      >
        {{ displayName.charAt(0).toUpperCase() }}
      </div>
      <div class="overflow-hidden">
        <div class="font-medium truncate">{{ displayName }}</div>
        <div class="text-sm text-gray-500 truncate">
          {{
            chat.lastMessage
              ? `${senderName}: ${chat.lastMessage?.slice(0, 20)}${chat.lastMessage.length > 20 ? '...' : ''}`
              : 'Start a conversation...'
          }}
        </div>
      </div>
    </div>

    <div class="flex flex-col items-end">
      <div class="text-xs text-gray-500 mb-1">{{ formattedTime }}</div>
      <div
        v-if="chat.unreadCount > 0"
        class="bg-primary text-white text-xs px-2 py-0.5 rounded-full"
      >
        {{ chat.unreadCount }}
      </div>
    </div>
  </div>
</template>
