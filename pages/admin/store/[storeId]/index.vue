<script setup lang="ts">
import { useAdminStore } from '@/stores/adminStore';
import { useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useApi } from '@/composables/useApi';
import { AxiosError } from 'axios';
import Badge from '@/components/ui/badge/Badge.vue';
import { useRoute, useRouter } from 'vue-router';
import type { StoreReports, StoreRequest } from '@/types/store';
import { storeRequestColumns } from '@/components/data-table/StoreRequestColumns';
import { storeReportColumns } from '@/components/data-table/StoreReportsColumns';
import { storeWarningColumns } from '@/components/data-table/StoreWarningsColumns';
import Pagination from '@/components/Pagination.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  roles: ['admin'],
});

interface StoreReportResponse {
  messages: string;
  storeProductsReport: StoreReports[];
}

interface StoreResponse {
  message: string;
  store: {
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    ownerId: string;
    storeName: string;
    storeAddress: string;
    storeStatus: 'incomplete' | 'active' | 'inactive' | 'suspended';
    requests: {
      id: string;
      createdAt: string;
      updatedAt: string;
      storeId: string;
      requestMessage: string;
      requestStatus: 'pending' | 'approved' | 'rejected';
      rejectionReason: string | null;
      approvedBy: string | null;
    }[];
    owner: {
      id: string;
      createdAt: string;
      updatedAt: string;
      userId: string;
      fullName: string;
      phoneNumber: string;
      role: 'admin' | 'buyer' | 'seller';
      hasStore: boolean;
      user: {
        email: string;
      };
    };
    warnings: {
      id: string;
      storeId: string;
      productId: string;
      reason: string;
      actionTaken: 'product_deleted' | 'product_hidden';
      createdAt: string;
      updatedAt: string;
      store: {
        id: string;
        storeName: string;
      };
      product: {
        id: string;
        storeId: string;
        productName: string;
      };
    }[];
  };
}

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const adminId = computed(() => adminStore.adminId);
const api = useApi();
const storeId = route.params.storeId as string;

const fetchStore = async (storeId: string): Promise<StoreResponse> => {
  if (!adminId.value) {
    throw new AxiosError('Admin ID is required');
  }
  const response = await api.get(`/admin/${adminId.value}/stores/${storeId}`);
  return response.data as StoreResponse;
};

const fetchStoreReport = async (storeId: string): Promise<StoreReportResponse> => {
  if (!adminId.value) {
    throw new AxiosError('Admin ID is required');
  }
  const response = await api.get(`/admin/${adminId.value}/reports/stores/${storeId}`);

  return response.data as StoreReportResponse;
};

const {
  data,
  error: storeError,
  isLoading: storeLoading,
} = useQuery({
  queryKey: ['store', storeId],
  queryFn: async () => {
    const [dataStore, dataStoreReport] = await Promise.all([
      fetchStore(storeId),
      fetchStoreReport(storeId),
    ]);
    return {
      dataStore,
      dataStoreReport,
    };
  },
  placeholderData: (keepPreviousData) => keepPreviousData,
});

const storeRequest = computed(() => {
  if (!data.value?.dataStore?.store.requests?.length) return null;
  return data.value.dataStore.store.requests.map((request) => ({
    id: request.id,
    storeId: request.storeId,
    requestMessage: request.requestMessage,
    requestStatus: request.requestStatus,
    rejectionReason: request.rejectionReason,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    approvedBy: request.approvedBy,
    store: {
      id: data.value.dataStore.store.id,
      storeName: data.value.dataStore.store.storeName,
    },
  })) as StoreRequest[];
});
const loading = computed(() => storeLoading.value || productsLoading.value);
const error = computed(() => storeError.value || productsError.value);

const hasError = computed(() => !!error.value);
const errorMessage = computed(() => {
  if (!error.value) return '';
  if (error.value instanceof AxiosError) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return error.value.response?.data?.message || error.value.message;
  }
  return error.value.message || 'An unexpected error occurred';
});
const storeWarnings = computed(() => {
  if (!data.value?.dataStore.store?.warnings?.length) return null;
  return data.value.dataStore.store.warnings;
});

const {
  currentPage,
  error: productsError,
  getPageNumbers,
  goToFirstPage,
  goToLastPage,
  goToNextPage,
  goToPage,
  goToPreviousPage,
  itemsPerPage,
  loading: productsLoading,
  totalPages,
  totalItems,
  products,
} = useProducts({
  url: `/admin/${adminId.value}/stores/${storeId}/products`,
  initialLimit: 5,
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center">
      <div class="loader">Loading...</div>
    </div>

    <div
      v-else-if="hasError"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ errorMessage }}</span>
    </div>

    <div v-else-if="data">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ data.dataStore.store.storeName }}</h1>
        <Badge
          :class="
            data.dataStore.store.storeStatus === 'active'
              ? 'bg-green-100 text-green-800'
              : data.dataStore.store.storeStatus === 'inactive' ||
                  data.dataStore.store.storeStatus === 'incomplete'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          "
          >{{ data.dataStore.store.storeStatus }}</Badge
        >

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white shadow rounded p-4">
            <h2 class="text-xl font-bold mb-3">Store Details</h2>
            <p>
              <span class="font-medium">Description:</span>
              {{ data.dataStore.store.description || 'No description' }}
            </p>
            <p><span class="font-medium">Address:</span> {{ data.dataStore.store.storeAddress }}</p>
            <p><span class="font-medium">Owner:</span> {{ data.dataStore.store.owner.fullName }}</p>
            <p>
              <span class="font-medium">Email:</span> {{ data.dataStore.store.owner.user.email }}
            </p>
            <p>
              <span class="font-medium">Phone:</span> {{ data.dataStore.store.owner.phoneNumber }}
            </p>
          </div>

          <div v-if="storeRequest && storeRequest.length > 0" class="bg-white shadow rounded p-4">
            <h2 class="text-xl font-bold mb-3">Store Requests</h2>
            <ScrollArea class="w-full border rounded-md">
              <DataTable :columns="storeRequestColumns" :data="storeRequest" class="w-full" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Store Warnings</h2>
        <div v-if="storeWarnings && storeWarnings.length > 0" class="bg-white shadow rounded p-4">
          <ScrollArea class="w-full border rounded-md">
            <DataTable :columns="storeWarningColumns" :data="storeWarnings" class="w-full" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div v-else class="shadow rounded p-4">
          <p class="text-primary">No warnings for this store.</p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Store Products</h2>
        <div class="mb-4">
          <div v-if="products && products.length > 0" class="bg-white shadow rounded p-4 mb-5">
            <ProductsGrid :products="products" />
            <Pagination
              :current-page="currentPage"
              :total-items="totalItems"
              :items-per-page="itemsPerPage"
              :total-pages="totalPages"
              :get-page-numbers="getPageNumbers"
              :go-to-first-page="goToFirstPage"
              :go-to-last-page="goToLastPage"
              :go-to-next-page="goToNextPage"
              :go-to-previous-page="goToPreviousPage"
              :go-to-page="goToPage"
            />
          </div>
          <div v-else class="shadow rounded p-4">
            <p class="text-primary">No Products for this store.</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Store Reports</h2>
          <div
            v-if="
              data?.dataStoreReport?.storeProductsReport &&
              data?.dataStoreReport?.storeProductsReport.length > 0
            "
            class="bg-white shadow rounded p-4"
          >
            <ScrollArea class="w-full border rounded-md">
              <DataTable
                :columns="storeReportColumns"
                :data="data?.dataStoreReport?.storeProductsReport"
                class="w-full"
              />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div v-else class="bg-white shadow rounded p-4">
            <p class="text-primary">No reports for this store.</p>
          </div>
        </div>

        <div class="flex justify-end">
          <Button
            class="px-4 py-2 hover:bg-primary/90 hover:cursor-pointer rounded mr-2"
            @click="router.push('/admin/store')"
          >
            Back to Stores
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
