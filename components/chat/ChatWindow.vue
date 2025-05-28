<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import ChatMessage from '@/components/chat/ChatMessage.vue';
import { Textarea } from '@/components/ui/textarea';

const props = defineProps<{
  storeId: string;
  buyerId: string;
  chatRoomId: string;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const messageInput = ref('');
const messagesContainer = ref<HTMLDivElement>();
const isScrolledToBottom = ref(true);
const typingTimeout = ref<ReturnType<typeof setTimeout>>();

const currentChat = computed(() => {
  return chatStore.chatPreviews.find((chat) => chat.chatRoomId === props.chatRoomId);
});

const displayName = computed(() => {
  if (!currentChat.value) return 'Chat';
  return authStore.role === 'buyer' ? currentChat.value.storeName : currentChat.value.buyerName;
});

const scrollToBottom = async () => {
  await nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      isScrolledToBottom.value = true;
    }
  });
};

const handleScroll = async () => {
  if (!messagesContainer.value) return;

  const container = messagesContainer.value;
  const { scrollTop, scrollHeight, clientHeight } = container;
  isScrolledToBottom.value = scrollTop + clientHeight >= scrollHeight - 50;

  if (scrollTop === 0 && chatStore.hasMoreMessages && !chatStore.isLoading) {
    const prevScrollHeight = container.scrollHeight;
    console.log(prevScrollHeight);
    await chatStore.loadMoreMessages();
    await nextTick();
    const newScrollHeight = container.scrollHeight;
    console.log(newScrollHeight);
    container.scrollTop = newScrollHeight - prevScrollHeight;
    console.log(container.scrollTop);
  }
};

const sendMessage = async () => {
  const message = messageInput.value.trim();
  if (!message) return;

  chatStore.sendMessage(message);
  messageInput.value = '';
  await scrollToBottom();
};

const handleTyping = () => {
  chatStore.sendTypingStatus(true);

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  typingTimeout.value = setTimeout(() => {
    chatStore.sendTypingStatus(false);
  }, 1000);
};

const handleKeyPress = async (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    await sendMessage();
  }
};

watch(
  () => chatStore.messages.length,
  async () => {
    if (isScrolledToBottom.value) {
      await scrollToBottom();
    }
  },
);

onMounted(async () => {
  await scrollToBottom();
});

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  chatStore.sendTypingStatus(false);
});
</script>

<template>
  <div class="flex-1 flex flex-col bg-white">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium"
        >
          {{ displayName.charAt(0).toUpperCase() }}
        </div>
        <div>
          <h2 class="font-semibold text-gray-900">{{ displayName }}</h2>
          <div class="text-sm text-gray-500">
            <span v-if="chatStore.isTyping && chatStore.typingUser !== authStore.userId">
              Typing...
            </span>
          </div>
        </div>
      </div>

      <!-- Chat actions could go here -->
      <div class="flex items-center space-x-2">
        <!-- Add any chat actions like call, video, etc. -->
      </div>
    </div>

    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      @scroll="handleScroll"
    >
      <!-- Loading more messages indicator -->
      <div v-if="chatStore.isLoading && chatStore.hasMoreMessages" class="text-center py-2">
        <div class="inline-flex items-center space-x-2 text-gray-500">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span class="text-sm">Loading more messages...</span>
        </div>
      </div>

      <!-- Messages -->
      <ChatMessage
        v-for="message in chatStore.messages"
        :key="message.id"
        :message="message"
        :show-sender-name="false"
      />

      <!-- Typing indicator -->
      <div
        v-if="chatStore.isTyping && chatStore.typingUser !== authStore.userId"
        class="flex items-center space-x-2"
      >
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0.1s"
          ></div>
          <div
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
        </div>
        <span class="text-sm text-gray-500">Someone is typing...</span>
      </div>

      <!-- Empty state -->
      <div
        v-if="chatStore.messages.length === 0 && !chatStore.isLoading"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100"
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
          <p class="text-gray-500">Start your conversation with {{ displayName }}</p>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="border-t border-gray-200 p-4 bg-white">
      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <Textarea
            v-model="messageInput"
            placeholder="Type your message..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            rows="1"
            @keydown.enter="handleKeyPress"
            @input="handleTyping"
          />
        </div>
        <button
          :disabled="!messageInput.trim()"
          class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="sendMessage"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Scroll to bottom button -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 transform translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform translate-y-2"
    >
      <button
        v-if="!isScrolledToBottom"
        class="absolute bottom-20 right-8 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        @click="scrollToBottom"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
/* Custom scrollbar for messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Auto-resize textarea */
textarea {
  min-height: 44px;
  max-height: 120px;
}

/* Typing indicator animation */
.animate-bounce {
  animation: bounce 1.4s infinite;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}
</style>
