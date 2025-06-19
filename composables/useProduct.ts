import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { useQuery } from '@tanstack/vue-query';
import { useDebounceFn } from '@vueuse/core';
import type { Product } from '@/types/product';
import type { Pagination } from '@/types/global';

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

interface ProductCategory {
  id: string;
  name: string;
}

interface ProductsResponse {
  productsCategory?: ProductCategory;
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
  category?: string;
}

export const useProducts = (options: UseProductsOptions) => {
  const { initialLimit = 12, debounceDelay = 300, url, category } = options;
  const api = useApi();
  const router = useRouter();

  const searchValue = ref('');
  const sortValue = ref('latest');
  const minPriceValue = ref('');
  const maxPriceValue = ref('');

  const productQuery = ref<ProductQuery>({
    page: 1,
    limit: initialLimit,
    search: undefined,
    categoryId: category,
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
    const { products, pagination, productsCategory } = response.data as ProductsResponse;
    return { products, pagination, productsCategory };
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
  const productsCategory = computed(() => data?.value?.productsCategory || null);

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

  watch(
    productQuery,
    async (newQuery) => {
      const query = Object.entries(newQuery)
        .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
        .reduce(
          (acc, [key, value]) => {
            acc[key] = String(value); // Convert everything to string for URL
            return acc;
          },
          {} as Record<string, string>,
        );

      await router.push({ query });
    },
    { deep: true },
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

  const { goToFirstPage, goToLastPage, goToNextPage, goToPreviousPage, getPageNumbers } =
    usePagination({ totalPages, currentPage, goToPage });

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
    productsCategory,

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
