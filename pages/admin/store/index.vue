<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useApi } from '@/composables/useApi';
import type { Pagination } from '@/types/global';
import { AxiosError } from 'axios';
import Badge from '@/components/ui/badge/Badge.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  roles: ['admin'],
});

interface StoreQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy?: 'name' | 'joined';
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'incomplete' | 'inactive' | 'suspended';
}

interface StoreResponse {
  pagination: Pagination;
  message: string;
  stores: {
    id: string;
    storeName: string;
    storeStatus: 'active' | 'inactive' | 'suspended' | 'incomplete';
    createdAt: string;
  }[];
}

export type SortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc';

const SORT_CONFIGS: Record<
  SortOption,
  { sortBy: StoreQuery['sortBy']; sortOrder: StoreQuery['sortOrder'] }
> = {
  latest: { sortBy: 'joined', sortOrder: 'desc' },
  oldest: { sortBy: 'joined', sortOrder: 'asc' },
  'name-asc': { sortBy: 'name', sortOrder: 'asc' },
  'name-desc': { sortBy: 'name', sortOrder: 'desc' },
};

const adminStore = useAdminStore();
const adminId = computed(() => adminStore.adminId);
const api = useApi();
const router = useRouter();
const searchValue = ref('');
const sortValue = ref('latest');
const debounceDelay = 300;
const storeQuery = ref<StoreQuery>({
  page: 1,
  limit: 10,
  search: undefined,
  sortBy: 'joined',
  sortOrder: 'desc',
});

const fetchStore = async (query: StoreQuery): Promise<StoreResponse> => {
  const params = Object.entries(query)
    .filter(([_, value]) => value !== undefined && value !== '')
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string | number>,
    );

  if (!adminId.value) {
    throw new AxiosError('Admin ID is required');
  }
  const response = await api.get(`/admin/${adminId.value}/stores`, { params });
  const { pagination, stores, message } = response.data as StoreResponse;
  return { pagination, stores, message };
};

const {
  data,
  isLoading,
  error: err,
  refetch,
} = useQuery<StoreResponse, Error>({
  queryKey: ['stores', storeQuery],
  queryFn: () => fetchStore(storeQuery.value),
  placeholderData: (keepPreviousData) => keepPreviousData,
});

const stores = computed(() => data.value?.stores || []);
const error = computed(() => err.value);
const totalPages = computed(() => data?.value?.pagination?.pages || 1);
const totalItems = computed(() => data?.value?.pagination?.total || 0);
const currentPage = computed(() => storeQuery.value.page);
const loading = computed(() => isLoading.value);
const itemsPerPage = computed(() => storeQuery.value.limit);
const handleSortChange = (option: SortOption) => {
  sortValue.value = option;
  const config = SORT_CONFIGS[option];

  storeQuery.value = {
    ...storeQuery.value,
    ...config,
    page: 1,
  };
};

watch(
  searchValue,
  useDebounceFn((val: string) => {
    storeQuery.value = {
      ...storeQuery.value,
      search: val || undefined,
      page: 1,
    };
  }, debounceDelay),
);

watch(
  storeQuery,
  async (newQuery) => {
    const query = Object.entries(newQuery)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      .reduce(
        (acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>,
      );

    await router.push({ query });
  },
  { deep: true },
);

const resetFilters = async () => {
  searchValue.value = '';
  sortValue.value = 'latest';
  storeQuery.value = {
    page: 1,
    limit: 10,
    search: undefined,
    sortBy: 'joined',
    sortOrder: 'desc',
  };
  await refetch();
};
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  storeQuery.value = {
    ...storeQuery.value,
    page,
  };
};

const { goToFirstPage, goToLastPage, goToNextPage, goToPreviousPage, getPageNumbers } =
  usePagination({ totalPages, currentPage, goToPage });
</script>

<template>
  <div class="w-5/6 py-6 sm:p-6 mx-auto">
    <h1 class="not-sm:text-lg text-2xl font-bold mb-4">Store Management</h1>
    <div class="flex flex-col sticky top-0 z-10 xl:flex-row gap-4">
      <div class="flex flex-col sm:flex-row gap-4 w-full :flex-1">
        <!-- Search Input -->
        <div class="relative w-full sm:w-1/2 max-w-2xs">
          <Input
            :model-value="searchValue"
            type="text"
            placeholder="Search stores..."
            class="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Search products"
            @update:model-value="(val) => (searchValue = String(val))"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>

        <!-- Sort Select -->
        <div class="w-full sm:w-48">
          <Select
            :model-value="sortValue"
            @update:model-value="(val) => handleSortChange(val as SortOption)"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="latest">Sort by: Latest</SelectItem>
                <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" class="whitespace-nowrap" @click="resetFilters">
          Reset Filters
        </Button>
      </div>
    </div>
    <div v-if="loading" class="text-center text-lg">Loading...</div>
    <div v-else-if="error" class="text-red-500 text-center">Error: {{ error.message }}</div>
    <div v-else class="w-full p-2 sm:p-6">
      <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-2 sm:mb-4">Stores</h2>
      <div v-if="stores.length > 0" class="w-full flex flex-wrap gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          <div
            v-for="store in stores"
            :key="store.id"
            class="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-lg truncate">{{ store.storeName }}</h3>
              <Badge
                :class="
                  store.storeStatus === 'active'
                    ? 'bg-green-100 text-green-800'
                    : store.storeStatus === 'inactive' || store.storeStatus === 'incomplete'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                "
              >
                {{ store.storeStatus }}
              </Badge>
            </div>
            <p class="text-sm text-gray-500 mb-4">
              Joined: {{ new Date(store.createdAt).toLocaleDateString() }}
            </p>
            <div class="flex justify-end">
              <NuxtLink :to="`/admin/store/${store.id}`">
                <Button size="sm" variant="outline">View Details</Button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <Pagination
        class="w-full sm:w-1/2 mt-4"
        :current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        :total-pages="totalPages"
        :get-page-numbers="getPageNumbers"
        :go-to-first-page="goToFirstPage"
        :go-to-last-page="goToLastPage"
        :go-to-next-page="goToNextPage"
        :go-to-previous-page="goToPreviousPage"
      />
    </div>
  </div>
</template>

<style scoped></style>
