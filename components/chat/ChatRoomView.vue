<script setup lang="ts">
import ChatSidebar from '@/components/chat/ChatSidebar.vue';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import { useChat } from '@/composables/useChat';
import { AxiosError } from 'axios';
import { toast } from 'vue-sonner';

const route = useRoute();
const chatStore = useChatStore();
const chatRoomId = computed(() => route.params.id as string);
const {
  componentKey,
  error,
  handleChatSelect,
  hasActiveChat,
  navigateTo,
  selectedChatDetails,
  loadChatDetails,
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
    await loadChatDetails();
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

onUnmounted(() => {
  if (chatStore.socket && chatStore.currentChatRoomId) {
    chatStore.socket.emit('leave-room', { chatRoomId: chatStore.currentChatRoomId });
    chatStore.currentChatRoomId = null;
  }
});
</script>

<template>
  <div :key="componentKey" class="flex h-screen w-full">
    <ChatSidebar
      class="hidden sm:w-5/12 md:1/3 max-w-96 sm:block"
      :chat-previews="chatStore.sortedChatPreviews"
      :selected-chat-room-id="selectedChatDetails.chatRoomId"
      @select="handleChatSelect"
    />

    <div class="flex-1 flex">
      <div v-if="error" class="flex-1 flex items-center justify-center bg-gray-50">
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
            {{
              isBuyer
                ? 'Browse Marketplace'
                : isSeller
                  ? 'Go to Seller Dashboard'
                  : 'Error, Something Went Wrong'
            }}
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

      <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
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
          <h3 class="text-xl font-semibold text-gray-700">No chat selected</h3>
          <p class="text-gray-500 mt-2">Select a conversation from the sidebar</p>
        </div>
      </div>
    </div>
  </div>
</template>
