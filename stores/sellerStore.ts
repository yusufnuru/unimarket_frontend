import { defineStore } from 'pinia';
import { useApi } from '@/composables/useApi';
import type {
  CreateStoreSchema,
  UpdateStoreSchema,
  StoreRequest,
  CreateStoreRequestSchema,
} from '@/types/store';
import type { Product, ProductParamSchema } from '@/types/product';
import { AxiosError } from 'axios';

interface StoreResponse {
  message: string;
  store: {
    id: string;
    storeName: string;
    ownerId: string;
    ownerName: string;
    description: string;
    storeAddress: string;
    storeStatus: 'incomplete' | 'active' | 'inactive' | 'suspended';
  };
}

export interface StoreCreationResponse extends StoreResponse {
  request: StoreRequest;
}

export interface ProductResponse {
  message: string;
  product: Product;
}

export interface StoreRequestCreationResponse {
  message: string;
  request: StoreRequest;
}

interface SellerState {
  storeId: string | null;
  storeName: string | null;
  storeOwnerId: string | null;
  storeOwnerName: string | null;
  storeDescription: string | null;
  storeAddress: string | null;
  storeStatus: 'incomplete' | 'active' | 'inactive' | 'suspended' | null;
  storeRequest: StoreRequest[] | null;
  storeProducts: Product[] | null;
}

export const useSellerStore = defineStore('seller', {
  state: (): SellerState => ({
    storeId: null,
    storeOwnerId: null,
    storeOwnerName: null,
    storeName: null,
    storeDescription: null,
    storeAddress: null,
    storeStatus: null,
    storeRequest: null,
    storeProducts: null,
  }),

  actions: {
    async fetchStore() {
      try {
        const api = useApi();
        const response = await api.get('/store', { withCredentials: true });
        this.storeId = response.data.store.id;
        this.storeName = response.data.store.name;
        this.storeOwnerId = response.data.store.ownerId;
        this.storeOwnerName = response.data.store.ownerName;
        this.storeDescription = response.data.store.description;
        this.storeAddress = response.data.store.address;
        this.storeStatus = response.data.store.status;
        return response;
      } catch (error) {
        console.error('Error fetching store:', error);
        throw error;
      }
    },

    async createStore(values: CreateStoreSchema): Promise<StoreCreationResponse> {
      const api = useApi();
      const response = await api.post('/store/create', values, { withCredentials: true });
      await this.fetchStore();
      return response.data as StoreCreationResponse;
    },

    async fetchStoreRequest() {
      try {
        const api = useApi();
        if (!this.storeId) return;

        const response = await api.get(`/store/${this.storeId}/request`, { withCredentials: true });
        this.storeRequest = response.data.requests as StoreRequest[];
      } catch (error) {
        console.error('Error fetching store request:', error);
        throw error;
      }
    },

    async updateStore(values: UpdateStoreSchema): Promise<StoreResponse> {
      const api = useApi();
      if (!this.storeId) {
        return Promise.reject(new AxiosError('Store ID is required'));
      }

      const response = await api.patch(`/store/${this.storeId}`, values, {
        withCredentials: true,
      });
      this.storeName = response.data.store.storeName;
      this.storeDescription = response.data.store.description;
      this.storeAddress = response.data.store.storeAddress;
      console.warn({
        address: this.storeAddress,
        desc: this.storeDescription,
        name: this.storeName,
      });
      return response.data as StoreResponse;
    },

    async deleteStore() {
      try {
        const api = useApi();
        if (!this.storeId) return;

        const response = await api.delete(`/store/${this.storeId}`, { withCredentials: true });
        this.storeId = null;
        this.storeName = null;
        this.storeDescription = null;
        this.storeAddress = null;
        this.storeStatus = null;
        this.storeRequest = null;
        this.storeProducts = null;
        return response;
      } catch (error) {
        console.error('Error deleting store:', error);
        throw error;
      }
    },

    async createStoreProduct(formData: FormData): Promise<ProductResponse> {
      const api = useApi();
      if (!this.storeId) {
        return Promise.reject(new AxiosError('Store ID is required'));
      }
      const response = await api.post(`/store/${this.storeId}/products`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as ProductResponse;
    },

    async updateStoreProduct(
      productId: ProductParamSchema,
      formData: FormData,
    ): Promise<ProductResponse> {
      const api = useApi();
      if (!this.storeId) {
        return Promise.reject(new AxiosError('Store ID is required'));
      }
      const response = await api.patch(`/store/${this.storeId}/products/${productId}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as ProductResponse;
    },

    async deleteStoreProduct(productId: ProductParamSchema): Promise<ProductResponse> {
      const api = useApi();
      if (!this.storeId) {
        return Promise.reject(new AxiosError('Store ID is required'));
      }
      const response = await api.delete(`/store/${this.storeId}/products/${productId}`, {
        withCredentials: true,
      });
      return response.data as ProductResponse;
    },

    async createStoreRequest(
      values: CreateStoreRequestSchema,
    ): Promise<StoreRequestCreationResponse> {
      const api = useApi();
      if (!this.storeId) {
        return Promise.reject(new AxiosError('Store ID is required'));
      }
      const response = await api.post(`/store/${this.storeId}/request`, values, {
        withCredentials: true,
      });
      return response.data as StoreRequestCreationResponse;
    },

    async getStoreProducts(
      params: {
        page: number;
        limit: number;
        search?: string;
        sortOptions: {
          sortBy: string;
          sortOrder: 'asc' | 'desc';
        };
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {
        page: 1,
        limit: 12,
        search: '',
        sortOptions: { sortBy: 'createdAt', sortOrder: 'desc' },
      },
    ) {
      try {
        const api = useApi();
        if (!this.storeId) return;

        const response = await api.get(`/store/${this.storeId}/products`, {
          withCredentials: true,
          params: {
            page: params.page,
            limit: params.limit,
            search: params.search,
            sortBy: params.sortOptions.sortBy,
            sortOrder: params.sortOptions.sortOrder,
            categoryId: params.categoryId,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
          },
        });
        this.storeProducts = response.data.products as Product[];
      } catch (error) {
        console.error('Error fetching store products:', error);
        throw error;
      }
    },
  },

  persist: true,
});
