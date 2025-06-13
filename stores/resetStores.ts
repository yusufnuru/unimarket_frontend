import { useChatStore } from './chatStore';
import { useAuthStore } from './authStore';
import { useSellerStore } from './sellerStore';

export const resetStores = () => {
  useAuthStore().$reset();
  useChatStore().$reset();
  useSellerStore().$reset();
  useBuyerStore().$reset();
  useAdminStore().$reset();
};
