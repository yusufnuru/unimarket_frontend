import { defineStore } from 'pinia';
import type { Product, ProductParamSchema, ProductReportSchema } from '@/types/product';
import { AxiosError } from 'axios';

interface AddToWishlistResponse {
  message: string;
  wishlist: WishList;
}

interface CreateReportResponse {
  message: string;
  report: {
    id: string;
    productId: string;
    buyerId: string;
    reason: string;
    description: string;
    createdAt: string;
  };
}

interface WishList {
  id: string;
  productId: string;
  buyerId: string;
  createdAt: string;
  updatedAt: string;
}

interface WishListWithProduct extends WishList {
  product: Product;
}

interface BuyerState {
  buyerWishlists: WishListWithProduct[] | null;
}

export const useBuyerStore = defineStore('buyer', {
  state: (): BuyerState => ({
    buyerWishlists: null,
  }),

  getters: {
    isProductInWishlist: (state) => {
      return (productId: ProductParamSchema): boolean => {
        return state.buyerWishlists?.some((wishlist) => wishlist.productId === productId) ?? false;
      };
    },

    buyerId: () => {
      const authStore = useAuthStore();
      return authStore.role === 'buyer' ? authStore.profileId : null;
    },
  },

  actions: {
    async fetchBuyerWishlists() {
      const api = useApi();
      if (!this.buyerId) {
        throw new AxiosError('Buyer ID is not set');
      }
      const response = await api.get(`/buyer/${this.buyerId}/wishlists`, {
        withCredentials: true,
      });
      this.buyerWishlists = response.data.wishlists;
    },

    async addToWishlist(productId: ProductParamSchema): Promise<AddToWishlistResponse> {
      const api = useApi();
      if (!this.buyerId) {
        throw new AxiosError('Buyer ID is not set');
      }
      const response = await api.post(
        `/buyer/${this.buyerId}/wishlists`,
        { productId },
        { withCredentials: true },
      );
      await this.fetchBuyerWishlists();
      return response.data as AddToWishlistResponse;
    },

    async removeWishlistItem(productId: ProductParamSchema) {
      const api = useApi();
      if (!this.buyerId) {
        throw new AxiosError('Buyer ID is not set');
      }
      const response = await api.delete(`/buyer/${this.buyerId}/wishlists/${productId}`, {
        withCredentials: true,
      });
      await this.fetchBuyerWishlists();
      return response.data as { message: string };
    },

    async createReport(productReport: ProductReportSchema): Promise<CreateReportResponse> {
      const api = useApi();
      if (!this.buyerId) {
        throw new AxiosError('Buyer ID is not set');
      }
      const response = await api.post(`/buyer/${this.buyerId}/reports`, productReport, {
        withCredentials: true,
      });
      return response.data as CreateReportResponse;
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
