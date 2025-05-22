import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { useQuery } from '@tanstack/vue-query';
import { useDebounceFn } from '@vueuse/core';
import type { Product } from '@/types/product';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProductQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'productName';
  sortOrder?: 'desc' | 'asc';
}

interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export type SortOption =
  | 'latest'
  | 'oldest'
  | 'price-low'
  | 'price-high'
  | 'name-asc'
  | 'name-desc';

const SORT_CONFIGS: Record<
  SortOption,
  { sortBy: ProductQuery['sortBy']; sortOrder: ProductQuery['sortOrder'] }
> = {
  latest: { sortBy: 'createdAt', sortOrder: 'desc' },
  oldest: { sortBy: 'createdAt', sortOrder: 'asc' },
  'price-low': { sortBy: 'price', sortOrder: 'asc' },
  'price-high': { sortBy: 'price', sortOrder: 'desc' },
  'name-asc': { sortBy: 'productName', sortOrder: 'asc' },
  'name-desc': { sortBy: 'productName', sortOrder: 'desc' },
};

interface UseProductsOptions {
  url: string;
  initialLimit?: number;
  debounceDelay?: number;
}

export const useProducts = (options: UseProductsOptions) => {
  const { initialLimit = 12, debounceDelay = 300, url } = options;
  const api = useApi();

  const searchValue = ref('');
  const sortValue = ref('latest');
  const minPriceValue = ref('');
  const maxPriceValue = ref('');

  const productQuery = ref<ProductQuery>({
    page: 1,
    limit: initialLimit,
    search: undefined,
    categoryId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchProducts = async (query: ProductQuery): Promise<ProductsResponse> => {
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
    const { products, pagination } = response.data as ProductsResponse;
    return { products, pagination };
  };

  const {
    data,
    isLoading,
    error: err,
    refetch,
  } = useQuery<ProductsResponse, Error>({
    queryKey: ['products', productQuery],
    queryFn: () => fetchProducts(productQuery.value),
    placeholderData: (keepPreviousData) => keepPreviousData,
  });

  const totalPages = computed(() => data?.value?.pagination?.pages || 1);
  const totalItems = computed(() => data?.value?.pagination?.total || 0);
  const currentPage = computed(() => productQuery.value.page);
  const error = computed(() => err.value);
  const loading = computed(() => isLoading.value);
  const products = computed(() => data?.value?.products || []);
  const itemsPerPage = computed(() => productQuery.value.limit);

  const handleSortChange = (option: SortOption) => {
    sortValue.value = option;
    const config = SORT_CONFIGS[option];

    productQuery.value = {
      ...productQuery.value,
      ...config,
      page: 1,
    };
  };

  watch(
    searchValue,
    useDebounceFn((val: string) => {
      productQuery.value = {
        ...productQuery.value,
        search: val || undefined,
        page: 1,
      };
    }, debounceDelay),
  );

  watch(
    minPriceValue,
    useDebounceFn((val: string) => {
      productQuery.value = {
        ...productQuery.value,
        minPrice: val ? Number(val) : undefined,
        page: 1,
      };
    }, debounceDelay),
  );

  watch(
    maxPriceValue,
    useDebounceFn((val: string) => {
      productQuery.value = {
        ...productQuery.value,
        maxPrice: val ? Number(val) : undefined,
        page: 1,
      };
    }, debounceDelay),
  );

  const setCategoryFilter = (categoryId: string | undefined) => {
    productQuery.value = {
      ...productQuery.value,
      categoryId,
      page: 1,
    };
  };

  const resetFilters = () => {
    searchValue.value = '';
    sortValue.value = 'latest';
    minPriceValue.value = '';
    maxPriceValue.value = '';

    productQuery.value = {
      page: 1,
      limit: initialLimit,
      search: undefined,
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    productQuery.value = {
      ...productQuery.value,
      page,
    };
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages.value);
  const goToNextPage = () => goToPage(currentPage.value + 1);
  const goToPreviousPage = () => goToPage(currentPage.value - 1);

  const getPageNumbers = () => {
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];

    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const updateQuery = (updates: Partial<ProductQuery>) => {
    productQuery.value = {
      ...productQuery.value,
      ...updates,
    };
  };

  return {
    // State
    searchValue,
    sortValue,
    minPriceValue,
    maxPriceValue,

    // Computed
    products,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage,
    itemsPerPage,

    // Methods
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    getPageNumbers,
    handleSortChange,
    resetFilters,
    setCategoryFilter,
    updateQuery,
    refetch,

    // Advanced
    productQuery: computed(() => productQuery.value),
    data: computed(() => data.value),
  };
};
