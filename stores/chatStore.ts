import { defineStore } from 'pinia';
import { useApi } from '@/composables/useApi';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const config = useRuntimeConfig();
export interface FetchChatHistory {
  chatRoomId: string;
  messages: ChatMessage[];
  nextCursor: string;
  hasMore: boolean;
}

export interface ChatInit {
  chatRoomId: string;
  buyer: {
    id: string;
    name: string;
  };
  store: {
    id: string;
    ownerId: string;
    name: string;
  };
}

export interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  chatRoomId: string;
  attachmentUrl?: string;
  createdAt: string;
  isRead: boolean;
  updatedAt: string;
}

export interface ChatPreview {
  chatRoomId: string;
  storeId: string;
  buyerId: string;
  storeName: string;
  buyerName: string;
  senderId?: string;
  sellerId?: string;
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    socket: null as Socket | null,
    messages: [] as ChatMessage[],
    chatPreviews: [] as ChatPreview[],
    currentChatRoomId: null as string | null,
    isLoading: false,
    hasMoreMessages: false,
    nextCursor: null as string | null,
    isTyping: false,
    typingUser: null as string | null,
  }),

  getters: {
    currentChatPreview(state) {
      return state.chatPreviews.find((chat) => chat.chatRoomId === state.currentChatRoomId) || null;
    },
    sortedChatPreviews(state) {
      return [...state.chatPreviews].sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
      );
    },
  },

  actions: {
    initializeSocket() {
      if (this.socket) this.socket.disconnect();
      const authStore = useAuthStore();
      this.socket = io(`${config.app.baseURL}/message`, {
        withCredentials: true,
        auth: {
          userId: authStore.userId,
          role: authStore.role,
        },
        transports: ['websocket', 'polling'],
      });
      this.setupSocketListeners();
    },

    async handleTokenRefresh() {
      const authStore = useAuthStore();
      try {
        await authStore.refresh();
        this.initializeSocket();
      } catch (error) {
        console.error('Token refresh failed:', error);
        await authStore.logout();
      }
    },

    setupSocketListeners() {
      if (!this.socket) return;
      this.socket.on('disconnect', () => console.warn('Disconnected from socket server'));

      this.socket.on('connect_error', async (error) => {
        console.error('Socket connection error:', error);
        if (
          error.data?.appErrorCode === 'TokenExpired' ||
          error.message?.includes('Token expired') ||
          error.message?.includes('jwt expired')
        ) {
          await this.handleTokenRefresh();
        } else if (error.message?.includes('Authentication failed')) {
          console.error('Authentication failed, redirecting to login...');
          const authStore = useAuthStore();
          await authStore.logout();
        } else {
          console.error('Socket connection error:', error.message);
        }
      });

      this.socket.on('connect', () => {
        // Join room if we have an active chat
        if (this.currentChatPreview) {
          this.socket?.emit('join-room', {
            storeId: this.currentChatPreview.storeId,
            buyerId: this.currentChatPreview.buyerId,
          });
        }
      });

      this.socket.on('new-message', (message: ChatMessage) => {
        if (this.currentChatRoomId === message.chatRoomId) {
          this.messages.push(message);

          const authStore = useAuthStore();
          if (message.senderId === authStore.userId) {
            message.isRead = false;
          } else {
            this.socket?.emit('mark-read', { chatRoomId: message.chatRoomId });
          }
        }

        this.updateChatPreviewFromMessage(message);
      });

      this.socket.on(
        'update-chat-preview',
        async (data: {
          chatRoomId: string;
          lastMessage: string;
          sellerId: string;
          lastMessageTime: string;
          senderName: string;
          senderId: string;
        }) => {
          const authStore = useAuthStore();
          const index = this.chatPreviews.findIndex((c) => c.chatRoomId === data.chatRoomId);
          if (index >= 0) {
            const preview = this.chatPreviews[index];
            const isCurrentChat = this.currentChatRoomId === data.chatRoomId;
            const isOwnMessage = data.senderId === authStore.userId;
            this.chatPreviews[index] = {
              ...preview,
              sellerId: data.sellerId,
              lastMessage: data.lastMessage,
              lastMessageTime: data.lastMessageTime,
              unreadCount:
                isOwnMessage || isCurrentChat ? preview.unreadCount : preview.unreadCount + 1,
            };
          } else {
            await this.fetchUserChats();
          }
        },
      );

      this.socket.on('messages-read', ({ readBy }: { readBy: string }) => {
        // Update read status for messages in current chat
        this.messages.forEach((message) => {
          if (message.senderId !== readBy && !message.isRead) {
            message.isRead = true;
          }
        });
      });

      this.socket.on('older-messages', (olderMessages: ChatMessage[]) => {
        if (olderMessages.length > 0) {
          this.messages = [...olderMessages, ...this.messages];
        } else {
          this.hasMoreMessages = false;
        }
      });

      this.socket.on(
        'user-typing',
        ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
          const authStore = useAuthStore();

          if (userId !== authStore.userId) {
            this.isTyping = isTyping;
            this.typingUser = isTyping ? userId : null;
          }
        },
      );

      this.socket.on('error', (error) => console.error('Socket error:', error));
    },

    async fetchUserChats() {
      const api = useApi();
      try {
        this.isLoading = true;
        const response = await api.get('/chat/my-chats');
        this.chatPreviews = response.data.data.chats;
      } catch (error) {
        console.error('Error fetching user chats:', error);
      } finally {
        this.isLoading = false;
      }
    },

    addChatPreviewIfNotExists(chatData: {
      chatRoomId: string;
      storeId: string;
      buyerId: string;
      storeName: string;
      buyerName: string;
    }) {
      if (!this.chatPreviews.some((c) => c.chatRoomId === chatData.chatRoomId)) {
        this.chatPreviews.push({
          chatRoomId: chatData.chatRoomId,
          storeId: chatData.storeId,
          buyerId: chatData.buyerId,
          storeName: chatData.storeName,
          buyerName: chatData.buyerName,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        });
      }
    },

    async fetchRoomDetails(chatRoomId: string) {
      const api = useApi();
      try {
        this.isLoading = true;
        const response = await api.get(`/chat/room/${chatRoomId}`);
        const data: {
          chatRoomId: string;
          buyer: { id: string; name: string };
          store: { id: string; name: string; sellerId: string };
        } = response.data.data;

        return { chatRoomId: data.chatRoomId, storeId: data.store.id, buyerId: data.buyer.id };
      } catch (error) {
        console.error('Error fetching room details:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async initializeChat(storeId: string) {
      const api = useApi();
      try {
        this.isLoading = true;
        const response = await api.get(`/chat/init/${storeId}`);
        const data: ChatInit = response.data.data;

        this.addChatPreviewIfNotExists({
          chatRoomId: data.chatRoomId,
          storeId: data.store.id,
          buyerId: data.buyer.id,
          storeName: data.store.name,
          buyerName: data.buyer.name,
        });

        await this.selectChat(data.chatRoomId, data.store.id, data.buyer.id);
        return { chatRoomId: data.chatRoomId, storeId: data.store.id, buyerId: data.buyer.id };
      } catch (error) {
        console.error('Error initializing chat:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchChatHistory(storeId: string, buyerId?: string) {
      const api = useApi();
      const authStore = useAuthStore();
      try {
        this.isLoading = true;
        this.messages = [];
        this.nextCursor = null;
        this.hasMoreMessages = false;

        let url = `/chat/history/${storeId}`;
        if (authStore.role === 'seller' && buyerId) url += `?buyerId=${buyerId}`;

        const response = await api.get(url);
        const data: FetchChatHistory = response.data.data;

        this.messages = data.messages;
        this.currentChatRoomId = data.chatRoomId;
        this.nextCursor = data.nextCursor;
        this.hasMoreMessages = data.hasMore;

        if (this.socket?.connected) {
          this.socket.emit('join-room', { storeId, buyerId: buyerId || authStore.userId });

          setTimeout(() => {
            this.socket?.emit('mark-read', { chatRoomId: this.currentChatRoomId });
          }, 1000);

          const chatIndex = this.chatPreviews.findIndex(
            (c) => c.chatRoomId === this.currentChatRoomId,
          );
          if (chatIndex >= 0) this.chatPreviews[chatIndex].unreadCount = 0;
        }
        return data;
      } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async loadMoreMessages() {
      if (
        !this.hasMoreMessages ||
        this.isLoading ||
        !this.currentChatPreview ||
        this.messages.length === 0
      ) {
        return;
      }

      const currentPreview = this.currentChatPreview;

      this.isLoading = true;

      return new Promise<void>((resolve, reject) => {
        const oldest = this.messages[0];
        const handleOlderMessages = (olderMessages: ChatMessage[]) => {
          if (olderMessages.length > 0) {
            this.messages = [...olderMessages, ...this.messages];
          } else {
            this.hasMoreMessages = false;
          }

          this.isLoading = false;
          resolve();
        };

        this.socket?.on('older-messages', handleOlderMessages);

        this.socket?.emit('fetch-older-messages', {
          storeId: currentPreview.storeId,
          buyerId: currentPreview.buyerId,
          beforeMessageId: oldest.id,
        });

        // Optional timeout fallback
        setTimeout(() => {
          this.socket?.off('older-messages', handleOlderMessages);
          this.isLoading = false;
          reject(new Error('Timeout loading messages'));
        }, 5000);
      });
    },

    async selectChat(chatRoomId: string, storeId: string, buyerId?: string) {
      const authStore = useAuthStore();

      if (this.socket && this.currentChatRoomId && this.currentChatRoomId !== chatRoomId) {
        this.socket.emit('leave-room', { chatRoomId: this.currentChatRoomId });
      }

      const finalBuyerId = authStore.role === 'buyer' ? (authStore.userId as string) : buyerId;

      await this.fetchChatHistory(storeId, finalBuyerId);
    },

    updateChatPreviewFromMessage(message: ChatMessage) {
      const authStore = useAuthStore();
      const index = this.chatPreviews.findIndex((c) => c.chatRoomId === message.chatRoomId);
      if (index >= 0) {
        const preview = this.chatPreviews[index];
        const isCurrentChat = this.currentChatRoomId === message.chatRoomId;
        const isOwnMessage = message.senderId === authStore.userId;

        const updatedPreview = {
          ...preview,
          senderId: message.senderId,
          lastMessage: message.message,
          lastMessageTime: message.createdAt,
          unreadCount:
            isOwnMessage || isCurrentChat ? preview.unreadCount : preview.unreadCount + 1,
        };

        // Remove the old preview and add the updated one at the beginning (most recent)
        const otherPreviews = this.chatPreviews.filter((_, i) => i !== index);
        this.chatPreviews = [updatedPreview, ...otherPreviews];
      }
    },

    sendMessage(message: string, attachmentUrl?: string) {
      if (!this.socket || !this.currentChatPreview || message.trim() === '') return;

      const { storeId, buyerId } = this.currentChatPreview;
      this.socket.emit('send-message', {
        storeId,
        buyerId,
        message: message.trim(),
        attachmentUrl,
      });
    },

    sendTypingStatus(isTyping: boolean) {
      if (!this.socket || !this.currentChatRoomId) return;
      this.socket.emit('typing', { chatRoomId: this.currentChatRoomId, isTyping });
    },

    markChatAsRead(chatRoomId: string) {
      if (this.socket?.connected) {
        this.socket.emit('mark-read', { chatRoomId });
      }

      const chatIndex = this.chatPreviews.findIndex((c) => c.chatRoomId === chatRoomId);
      if (chatIndex >= 0) {
        this.chatPreviews[chatIndex].unreadCount = 0;
      }
    },

    cleanUp() {
      if (this.socket) {
        if (this.currentChatRoomId) {
          this.socket.emit('leave-room', { chatRoomId: this.currentChatRoomId });
        }
        this.socket.disconnect();
        this.socket = null;
      }

      this.messages = [];
      this.chatPreviews = [];
      this.currentChatRoomId = null;
      this.hasMoreMessages = false;
      this.nextCursor = null;
      this.isTyping = false;
      this.typingUser = null;
    },

    isConnected(): boolean {
      return this.socket?.connected || false;
    },

    // Helper method to reconnect
    reconnect() {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    },
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
