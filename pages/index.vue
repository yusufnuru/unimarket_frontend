<script setup lang="ts">
import { Input } from '@/components/ui/input';
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
</script>

<template>
  <div class="min-h-screen sm:p-6 w-5/6 mx-auto">
    <!-- Filters and Search -->
    <div class="flex flex-col gap-6 mb-6">
      <h2 class="text-2xl font-semibold text-foreground">All Products</h2>

      <!-- Main filters container with responsive behavior -->
      <div class="flex flex-col sticky top-0 z-10 xl:flex-row gap-4">
        <!-- Search + Sort that stay together on medium screens -->
        <div class="flex flex-col sm:flex-row gap-4 w-full :flex-1">
          <!-- Search Input -->
          <div class="relative w-full sm:w-1/2 max-w-2xs">
            <Input
              v-model="searchValue"
              type="text"
              placeholder="Search products..."
              class="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Search products"
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
            <Select v-model="sortValue" @update:model-value="() => handleSortChange">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="latest">Sort by: Latest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Price Filter & Reset -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <Input
              v-model="minPriceValue"
              type="number"
              placeholder="Min price"
              class="w-full sm:w-28"
              min="0"
              step="0.01"
            />
            <span class="text-muted-foreground">to</span>
            <Input
              v-model="maxPriceValue"
              type="number"
              placeholder="Max price"
              class="w-full sm:w-28"
              min="0"
              step="0.01"
            />
          </div>
          <Button variant="outline" size="sm" class="whitespace-nowrap" @click="resetFilters"
            >Reset Filters</Button
          >
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n" class="rounded-lg shadow-md overflow-hidden animate-pulse">
        <div class="h-64 bg-muted"></div>
        <div class="p-4 space-y-4">
          <div class="h-6 bg-muted rounded w-3/4"></div>
          <div class="flex justify-between">
            <div class="h-6 bg-muted rounded w-1/4"></div>
            <div class="h-6 bg-muted rounded w-1/4"></div>
          </div>
          <div class="h-10 bg-muted rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && !loading"
      class="border border-destructive/20 bg-destructive/10 text-destructive p-4 rounded-lg text-center"
    >
      <p>{{ error.message }}</p>
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
      <h3 class="text-xl font-medium text-foreground mb-2">No Products Found</h3>
      <p class="text-muted-foreground">Try adjusting your search or filters</p>
      <Button class="mt-4" @click="resetFilters"> Reset Filters </Button>
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
