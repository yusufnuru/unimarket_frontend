<script setup lang="ts">
import { computed } from 'vue';
import { useAdminStore } from '@/stores/adminStore';
import { useStoreRequest } from '@/composables/useStoreRequest';
import { storeRequestColumns } from '@/components/data-table/StoreRequestColumns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import DataTable from '@/components/data-table/DataTable.vue';
import Pagination from '@/components/Pagination.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  roles: ['admin'],
});

const adminStore = useAdminStore();
const adminId = computed(() => adminStore.adminId);

const {
  error,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  storeRequests,
  loading,
  getPageNumbers,
  goToFirstPage,
  goToLastPage,
  goToPreviousPage,
  goToNextPage,
  goToPage,
} = await useStoreRequest({ url: `/admin/${adminId.value}/store-requests` });
</script>

<template>
  <div class="w-5/6 py-6 sm:p-6 mx-auto">
    <h1 class="not-sm:text-lg text-2xl font-bold mb-4">Welcome to Admin Dashboard</h1>
    <div v-if="loading">
      <p class="text-center text-lg">Loading...</p>
    </div>

    <div v-else-if="error">
      <p class="text-red-500 text-center">Error: {{ error.message }}</p>
    </div>

    <div v-else class="w-11/12 p-2 sm:p-6 rounded-2xl shadow-md border">
      <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-2 sm:mb-4">Store Requests</h2>
      <div v-if="storeRequests && storeRequests.length > 0" class="w-full flex flex-wrap gap-4">
        <ScrollArea class="w-full border rounded-md">
          <DataTable :columns="storeRequestColumns" :data="storeRequests" class="w-full" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div class="w-full flex flex-col items-center justify-between">
          <NuxtLink
            to="/admin/request"
            class="w-1/3 sm:w-1/4 bg-primary text-primary-foreground py-3 text-center rounded-lg hover:bg-primary/90 block"
          >
            More Requests
          </NuxtLink>
        </div>
      </div>
      <div v-else>
        <p>No requests available.</p>
      </div>
    </div>
  </div>
</template>
