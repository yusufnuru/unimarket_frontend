import type { Product, ProductCategory } from '@/types/product';
import { useApi } from '@/composables/useApi';
import { useQuery } from '@tanstack/vue-query';
import { AxiosError } from 'axios';

interface ProductResponse {
  product: Product & {
    category: ProductCategory;
  };
}
export const useProductById = (url: string) => {
  const fetchedProductById = async (): Promise<ProductResponse> => {
    const api = useApi();
    const response = await api.get(url, { withCredentials: true });
    return response.data as ProductResponse;
  };

  const {
    data,
    isLoading,
    error: err,
    refetch,
  } = useQuery<ProductResponse, Error>({
    queryKey: ['productById', url],
    queryFn: fetchedProductById,
    placeholderData: (keepPreviousData) => keepPreviousData,
  });

  const error = computed(() => err.value);
  const loading = computed(() => isLoading.value);
  const product = computed(() => data.value?.product || null);
  const errorMessage =
    error.value instanceof AxiosError
      ? (error.value?.response?.data?.message as string)
      : error.value?.message || 'Fetch Error - An unexpected error occurred.';
  return {
    product,
    loading,
    error,
    refetch,
    errorMessage,
  };
};
