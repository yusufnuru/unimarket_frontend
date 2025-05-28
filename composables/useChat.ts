import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';

export const useChat = (chatRoomId: globalThis.ComputedRef<string>) => {
  const selectedChatDetails = ref({
    storeId: '',
    buyerId: '',
    chatRoomId: '',
  });
  const chatStore = useChatStore();
  const role = useAuthStore().role;
  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';
  const router = useRouter();
  const isLoading = ref(false);
  const error = ref('');

  const hasActiveChat = computed(() => {
    return chatStore.currentChatRoomId !== null && selectedChatDetails.value.storeId;
  });

  const handleChatSelect = async (details: {
    storeId: string;
    buyerId: string;
    chatRoomId: string;
  }) => {
    try {
      if (details.chatRoomId !== chatRoomId.value) {
        if (isBuyer) {
          await router.push(`/message/${details.chatRoomId}`);
        } else if (isSeller) {
          await router.push(`/seller/message/${details.chatRoomId}`);
        }
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  };

  const loadChatDetails = async () => {
    if (!chatRoomId.value) return;

    isLoading.value = true;
    error.value = '';

    try {
      const existingChat = chatStore.sortedChatPreviews.find(
        (chat) => chat.chatRoomId === chatRoomId.value,
      );

      if (existingChat) {
        selectedChatDetails.value = {
          storeId: existingChat.storeId,
          buyerId: existingChat.buyerId,
          chatRoomId: existingChat.chatRoomId,
        };

        await chatStore.selectChat(
          existingChat.chatRoomId,
          existingChat.storeId,
          existingChat.buyerId,
        );
      } else {
        try {
          const response = await chatStore.fetchRoomDetails(chatRoomId.value);
          selectedChatDetails.value = {
            storeId: response.storeId,
            buyerId: response.buyerId,
            chatRoomId: response.chatRoomId,
          };
          await chatStore.selectChat(response.chatRoomId, response.storeId, response.buyerId);
        } catch (err) {
          console.error('Error fetching chat details:', err);
          let errorMessage = 'Failed to load chat details';
          if (err instanceof AxiosError) {
            errorMessage = err.response?.data?.message || errorMessage;
          }
          error.value = errorMessage;
          toast.error(errorMessage);
          await router.push('/message');
          return;
        }
      }
    } catch (err) {
      console.error('Error loading chat details:', err);
      let errorMessage = 'Failed to load chat details';
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      error.value = errorMessage;
    } finally {
      isLoading.value = false;
    }
  };

  watch(
    () => chatRoomId,
    async (newChatRoomId, oldChatRoomId) => {
      if (newChatRoomId !== oldChatRoomId) {
        await loadChatDetails();
      }
    },
    { immediate: true },
  );

  const navigateTo = async () => {
    if (isBuyer) {
      await router.push(`/`);
    } else if (isSeller) {
      await router.push(`/seller/dashboard`);
    }
  };

  const componentKey = computed(() => `message-${chatRoomId.value}`);

  return {
    isSeller,
    isBuyer,
    isLoading,
    selectedChatDetails,
    error,
    hasActiveChat,
    handleChatSelect,
    loadChatDetails,
    navigateTo,
    componentKey,
  };
};
