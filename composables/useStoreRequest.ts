import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import type { StoreRequest } from '@/types/store';
import type { Pagination } from '@/types/global';
import { useQuery } from '@tanstack/vue-query';
import { useDebounceFn } from '@vueuse/core';

type StoreRequestStatus = 'pending' | 'approved' | 'rejected' | undefined;

interface StoreRequestQuery {
  page: number;
  limit: number;
  status?: StoreRequestStatus;
}

interface UseStoreRequestOptions {
  url: string;
  initialLimit?: number;
  debounceDelay?: number;
}

interface StoreRequestResponse {
  message: string;
  storeRequests: StoreRequest[];
  pagination: Pagination;
}

export const useStoreRequest = (options: UseStoreRequestOptions) => {
  const { initialLimit = 5, debounceDelay = 300, url } = options;
  const api = useApi();
  const storeRequestQuery = ref<StoreRequestQuery>({
    page: 1,
    limit: initialLimit,
    status: undefined,
  });
  const statusValues = ref<StoreRequestStatus>(undefined);
  const fetchStoreRequests = async (query: StoreRequestQuery) => {
    const params = Object.entries(query)
      .filter(([_, value]) => value !== undefined && value !== '')
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string | number>,
      );
    const response = await api.get(url, { params });
    const { pagination, storeRequests, message } = response.data as StoreRequestResponse;
    return { storeRequests, pagination, message };
  };

  const {
    data,
    isLoading,
    error: err,
    refetch,
  } = useQuery<StoreRequestResponse, Error>({
    queryKey: ['storeRequest', storeRequestQuery],
    queryFn: () => fetchStoreRequests(storeRequestQuery.value),
    placeholderData: (keepPreviousData) => keepPreviousData,
  });

  const totalPages = computed(() => data?.value?.pagination?.pages || 1);
  const totalItems = computed(() => data?.value?.pagination?.total || 0);
  const currentPage = computed(() => storeRequestQuery.value.page);
  const error = computed(() => err.value);
  const loading = computed(() => isLoading.value);
  const storeRequests = computed(() => data?.value?.storeRequests || []);
  const itemsPerPage = computed(() => storeRequestQuery.value.limit);

  watch(
    statusValues,
    useDebounceFn((val: StoreRequestStatus) => {
      storeRequestQuery.value = {
        ...storeRequestQuery.value,
        status: val || undefined,
        page: 1,
      };
    }, debounceDelay),
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    storeRequestQuery.value = {
      ...storeRequestQuery.value,
      page,
    };
  };

  const { goToFirstPage, goToLastPage, goToNextPage, goToPreviousPage, getPageNumbers } =
    usePagination({ totalPages, currentPage, goToPage });

  const resetFilter = () => {
    statusValues.value = undefined;
  };

  return {
    resetFilter,
    storeRequests,
    totalPages,
    totalItems,
    currentPage,
    error,
    loading,
    itemsPerPage,
    refetch,
    storeRequestQuery,
    statusValues,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    getPageNumbers,
    goToPage,
  };
};
