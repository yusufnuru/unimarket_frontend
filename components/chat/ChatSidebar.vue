<script setup lang="ts">
import { ref, computed } from 'vue';
import { type ChatPreview } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import ChatItem from '@/components/chat/ChatItem.vue';

const emit = defineEmits<{
  (e: 'select', payload: { storeId: string; buyerId: string; chatRoomId: string }): void;
}>();

const props = defineProps<{
  selectedChatRoomId: string | null;
  chatPreviews: ChatPreview[];
  isLoading?: boolean;
}>();

const authStore = useAuthStore();
const searchQuery = ref('');

const filteredChats = computed(() => {
  if (!searchQuery.value) {
    return props.chatPreviews;
  }
  const query = searchQuery.value.toLowerCase();
  return props.chatPreviews.filter((chat) => {
    if (authStore.role === 'buyer') {
      return chat.storeName.toLowerCase().includes(query);
    } else {
      return chat.buyerName.toLowerCase().includes(query);
    }
  });
});

const selectChat = (chat: ChatPreview) => {
  emit('select', { storeId: chat.storeId, buyerId: chat.buyerId, chatRoomId: chat.chatRoomId });
};

const clearSearch = () => {
  searchQuery.value = '';
};
</script>

<template>
  <div class="border-r border-gray-200 bg-white h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">Messages</h2>
        <div v-if="chatPreviews.length > 0" class="text-xs text-gray-500">
          {{ chatPreviews.length }} conversation{{ chatPreviews.length !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="authStore.role === 'buyer' ? 'Search stores...' : 'Search buyers...'"
          class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />

        <!-- Search Icon / Clear Button -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            v-if="searchQuery"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            @click="clearSearch"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400 pointer-events-none"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Search Results Info -->
      <div
        v-if="searchQuery && filteredChats.length !== chatPreviews.length"
        class="mt-2 text-xs text-gray-500"
      >
        {{ filteredChats.length }} of {{ chatPreviews.length }} conversations
      </div>
    </div>

    <!-- Chat List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center p-8">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"
          ></div>
          <p class="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>

      <!-- Chat Items -->
      <div v-else-if="filteredChats.length > 0" class="p-2 space-y-1">
        <ChatItem
          v-for="chat in filteredChats"
          :key="chat.chatRoomId"
          :chat="chat"
          :is-active="chat.chatRoomId === selectedChatRoomId"
          @select="selectChat(chat)"
        />
      </div>

      <!-- Empty States -->
      <div v-else class="flex items-center justify-center h-full p-8">
        <div class="text-center">
          <!-- No Search Results -->
          <div v-if="searchQuery" class="space-y-4">
            <div
              class="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-700">No conversations found</p>
              <p class="text-sm text-gray-500 mt-1">Try adjusting your search terms</p>
              <button
                class="mt-3 text-sm text-primary hover:text-primary-dark transition-colors"
                @click="clearSearch"
              >
                Clear search
              </button>
            </div>
          </div>

          <!-- No Conversations Yet -->
          <div v-else class="space-y-4">
            <div
              class="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-700">No conversations yet</p>
              <p class="text-sm text-gray-500 mt-1">
                {{
                  authStore.role === 'buyer'
                    ? 'Find a store to start a conversation'
                    : 'Wait for buyers to message you'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for the chat list */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Animation for loading spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
