<script setup lang="ts">
import {
  PaginationItem,
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationNext,
} from '@/components/ui/pagination';
import { AxiosError } from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const categoryId = route.params.id as string;

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
  productsCategory,
  resetFilters,
  refetch,
} = useProducts({
  url: `/public-category/${categoryId}`,
  category: categoryId,
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
      <h2 class="text-2xl font-bold">{{ productsCategory?.name }} Products</h2>

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
      <h3 class="text-xl font-medium text-foreground mb-2">
        No Products Found under <br />{{ productsCategory?.name }} category
      </h3>
    </div>

    <Pagination class="mt-4" :items-per-page="itemsPerPage" :total="totalItems">
      <PaginationContent>
        <PaginationPrevious @click="goToPreviousPage" />

        <PaginationItem v-if="currentPage > 3" :value="1" @click="goToFirstPage">
          <PaginationFirst />
        </PaginationItem>

        <PaginationEllipsis v-if="currentPage > 4" />

        <template v-for="pageNum in getPageNumbers()" :key="pageNum">
          <PaginationItem
            :value="Number(pageNum)"
            :is-active="pageNum === currentPage"
            @click="goToPage(Number(pageNum))"
          >
            {{ pageNum }}
          </PaginationItem>
        </template>

        <PaginationEllipsis v-if="currentPage < totalPages - 3" />

        <PaginationItem
          v-if="currentPage < totalPages - 2"
          :value="totalPages"
          @click="goToLastPage"
        >
          <PaginationLast />
        </PaginationItem>

        <PaginationNext @click="goToNextPage" />
      </PaginationContent>
    </Pagination>

    <div v-if="totalItems > 0" class="text-center text-sm text-muted-foreground mt-4">
      Showing {{ (currentPage - 1) * itemsPerPage + 1 }} -
      {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} products
    </div>
  </div>
</template>
