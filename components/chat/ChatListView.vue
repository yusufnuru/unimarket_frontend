<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import ChatSidebar from '@/components/chat/ChatSidebar.vue';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import { useChat } from '@/composables/useChat';
import { AxiosError } from 'axios';
import { toast } from 'vue-sonner';

const chatStore = useChatStore();
const authStore = useAuthStore();
const route = useRoute();
const config = useRuntimeConfig();

const chatRoomId = computed(() => route.params.id as string);

const {
  selectedChatDetails,
  handleChatSelect,
  navigateTo,
  hasActiveChat,
  error,
  isLoading,
  isSeller,
  isBuyer,
} = useChat(chatRoomId);

onMounted(async () => {
  try {
    if (!chatStore.isConnected()) {
      chatStore.reconnect();
    }

    if (!chatStore.chatPreviews.length) {
      await chatStore.fetchUserChats();
    }
  } catch (err) {
    console.error('Error during component initialization:', err);
    let errorMessage = 'Failed to load page';
    if (err instanceof AxiosError) {
      errorMessage = err.response?.data?.message || errorMessage;
    }
    error.value = errorMessage;
    toast.error(errorMessage);
  }
});
</script>

<template>
  <div class="flex h-screen w-full">
    <ChatSidebar
      :class="['w-full sm:w-1/3', hasActiveChat ? 'hidden sm:w-5/12 md:1/3 max-w-96 sm:block' : '']"
      :selected-chat-room-id="selectedChatDetails.chatRoomId"
      :chat-previews="chatStore.chatPreviews"
      :is-loading="chatStore.isLoading"
      @select="handleChatSelect"
    />

    <div class="flex-1 flex">
      <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center p-6">
          <div
            class="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-100"
          >
            <svg
              class="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700">Loading chat...</h3>
          <p class="text-gray-500 mt-2">Please wait while we load your conversation</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center p-6">
          <div
            class="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700">Error loading chat</h3>
          <p class="text-gray-500 mt-2">{{ error }}</p>
          <button
            class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            @click="navigateTo"
          >
            {{}}
          </button>
        </div>
      </div>

      <ChatWindow
        v-else-if="hasActiveChat && selectedChatDetails.storeId"
        :store-id="selectedChatDetails.storeId"
        :buyer-id="selectedChatDetails.buyerId"
        :chat-room-id="selectedChatDetails.chatRoomId"
        class="flex-1"
      />

      <div v-else class="hidden sm:flex flex-1 items-center justify-center bg-gray-50">
        <div class="text-center p-6">
          <div
            class="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>

          <h3 class="text-xl font-semibold text-gray-700">
            {{ chatRoomId ? 'Chat Selected' : 'Select a conversation' }}
          </h3>

          <p class="text-gray-500 mt-2">
            {{
              chatRoomId
                ? 'Loading your conversation...'
                : 'Choose a conversation from the sidebar to start messaging'
            }}
          </p>

          <div v-if="chatStore.isLoading" class="mt-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p class="text-sm text-gray-500 mt-2">Loading...</p>
          </div>

          <div v-if="authStore.role === 'buyer'" class="mt-6 space-y-3">
            <button
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              @click="navigateTo"
            >
              {{
                isBuyer
                  ? 'Browse Marketplace'
                  : isSeller
                    ? 'Go to Seller Dashboard'
                    : 'Error, Something Went Wrong'
              }}
            </button>
          </div>

          <!-- Debug info (remove in production) -->
          <div v-if="config.public.nodeEnv === 'development'" class="mt-6 text-xs text-gray-400">
            <details>
              <summary class="cursor-pointer">Debug Info</summary>
              <pre class="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto">
                Current Chat Room ID: {{ chatStore.currentChatRoomId }}
                Route Chat Room ID: {{ chatRoomId }}
                Socket Connected: {{ chatStore.socket?.connected }}
                Chat Previews Count: {{ chatStore.chatPreviews.length }}
                Messages Count: {{ chatStore.messages.length }}
                Selected Details: {{ JSON.stringify(selectedChatDetails, null, 2) }}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
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
