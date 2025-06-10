<script setup lang="ts">
import { useSellerStore } from '@/stores/sellerStore';
import ProductPagination from '@/components/ProductPagination.vue';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';

definePageMeta({
  layout: 'seller',
  middleware: ['auth'],
  roles: ['seller'],
});

const sellerStore = useSellerStore();

if (!sellerStore.storeId) {
  throw new AxiosError('Store ID is not set. Please create a store first.');
}

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
  url: `/store/${sellerStore.storeId}/products`,
});

const errorMessage =
  error.value instanceof AxiosError
    ? (error.value.response?.data?.message as string)
    : error.value?.message || 'Fetch Error - An unexpected error occurred.';
</script>

<template>
  <div class="min-h-screen p-6 w-5/6 mx-auto">
    <!-- Filters and Search -->
    <div class="flex flex-col gap-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="sm:text-2xl font-bold text-xl">Store <br class="sm:hidden" />Products</h2>
        <NuxtLink to="/seller/product/new"
          ><Button class="not-sm:w-[120px] not-sm:text-md">Add Product</Button></NuxtLink
        >
      </div>

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

<style scoped></style>
