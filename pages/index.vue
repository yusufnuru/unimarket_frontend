<script setup lang="ts">
import { AxiosError } from 'axios';
import ProductPagination from '@/components/Pagination.vue';

const buyerStore = useBuyerStore();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.role === 'admin');
const isSeller = computed(() => authStore.role === 'seller');
const isAuthenticated = computed(() => authStore.isAuthenticated);

const {
  currentPage,
  getPageNumbers,
  goToFirstPage,
  goToLastPage,
  goToNextPage,
  goToPreviousPage,
  goToPage,
  itemsPerPage,
  totalPages,
  totalItems,
  error,
  handleSortChange,
  sortValue,
  maxPriceValue,
  minPriceValue,
  searchValue,
  loading,
  products,
  resetFilters,
  refetch,
} = useProducts({
  url: '/public-product',
});

const errorMessage =
  error.value instanceof AxiosError
    ? (error.value.response?.data?.message as string)
    : error.value?.message || 'Fetch Error - An unexpected error occurred.';

onMounted(async () => {
  try {
    if (
      isAuthenticated.value &&
      (isAdmin.value || isSeller.value) &&
      !buyerStore.buyerWishlists?.length
    ) {
      await buyerStore.fetchBuyerWishlists();
    }
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
  }
});
</script>

<template>
  <div class="min-h-screen p-6 w-5/6 mx-auto">
    <!-- Filters and Search -->
    <div class="flex flex-col gap-6 mb-6">
      <h2 class="text-2xl font-bold">All Products</h2>

      <!-- Main filters container with responsive behavior -->
      <ProductFilterOptions
        :sort-value="sortValue"
        :min-price-value="minPriceValue"
        :max-price-value="maxPriceValue"
        :search-value="searchValue"
        :handle-sort-change="handleSortChange"
        :reset-filters="resetFilters"
        @update-search="(value) => (searchValue = value)"
        @update-min-price="(value) => (minPriceValue = value)"
        @update-max-price="(value) => (maxPriceValue = value)"
      />
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading">
      <ProductLoading />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && !loading"
      class="border border-destructive/20 bg-destructive/10 text-destructive p-4 rounded-lg text-center"
    >
      <p>{{ errorMessage }}</p>
      <Button class="mt-2 text-sm text-primary hover:text-primary/90 underline" @click="refetch">
        Try again
      </Button>
    </div>

    <!-- Products Grid -->
    <div v-if="products.length > 0">
      <ProductsGrid :products="products" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && products.length <= 0" class="text-center py-12">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto text-muted-foreground mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
      <h3 class="text-xl font-medium text-foreground mb-2">No Products Found</h3>
      <p class="text-muted-foreground">Try adjusting your search or filters</p>
      <Button class="mt-4" @click="resetFilters"> Reset Filters </Button>
    </div>

    <!-- Pagination -->
    <ProductPagination
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
</template>
