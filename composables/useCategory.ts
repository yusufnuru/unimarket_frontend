import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { AxiosError } from 'axios';

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}
interface CategoryResponse {
  categories: Category[];
}

export const useCategory = () => {
  const api = useApi();
  const fetchCategories = async (): Promise<CategoryResponse> => {
    const response = await api.get('/public-category');
    return response.data as CategoryResponse;
  };

  const {
    data,
    isLoading,
    error: err,
  } = useQuery<CategoryResponse, Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    placeholderData: (keepPreviousData) => keepPreviousData,
  });

  const error = computed(() => err.value);

  const errorMessage =
    error.value instanceof AxiosError
      ? (error.value.response?.data?.message as string)
      : error.value?.message || 'Fetch Error - An unexpected error occurred.';

  const categories = computed(() => data.value?.categories || []);
  const loading = computed(() => isLoading.value);

  return {
    categories,
    loading,
    error,
    errorMessage,
  };
};
