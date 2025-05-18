<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { debounce } from 'lodash-es'; // Ensure lodash is installed for debouncing
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/global';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const api = useApi();
const publicProducts = ref<Product[]>([]);
const loading = ref(true);
const error = ref<unknown>(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12); // Default limit
const totalPages = ref(1);
const totalItems = ref(0);
const sortOptions = reactive({
  sortBy: 'createdAt', // 'createdAt', 'price', or 'productName'
  sortOrder: 'desc', // 'asc' or 'desc'
});
const currentImageIndex = reactive<Record<string, number>>({});
const categoryId = ref<string | undefined>(undefined);
const minPrice = ref<number | undefined>(undefined);
const maxPrice = ref<number | undefined>(undefined);

// Fetch products with search and sort parameters
const fetchProducts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await api.get('/public-product', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        sortBy: sortOptions.sortBy,
        sortOrder: sortOptions.sortOrder,
        categoryId: categoryId.value,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
      },
    });

    publicProducts.value = response.data.products;

    // Update pagination
    if (response.data.pagination) {
      const pagination: Pagination = response.data.pagination;
      totalPages.value = pagination.pages;
      totalItems.value = pagination.total;
    }

    // Initialize image carousel indexes
    publicProducts.value.forEach((product) => {
      currentImageIndex[product.id] = 0;
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = 'Failed to load products. Please try again later.';
    publicProducts.value = [];
  } finally {
    loading.value = false;
  }
};

// Handle sort changes
const handleSortChange = (option: unknown) => {
  const selectedOption = option as string;
  switch (selectedOption) {
    case 'latest':
      sortOptions.sortBy = 'createdAt';
      sortOptions.sortOrder = 'desc';
      break;
    case 'oldest':
      sortOptions.sortBy = 'createdAt';
      sortOptions.sortOrder = 'asc';
      break;
    case 'price-low':
      sortOptions.sortBy = 'price';
      sortOptions.sortOrder = 'asc';
      break;
    case 'price-high':
      sortOptions.sortBy = 'price';
      sortOptions.sortOrder = 'desc';
      break;
    case 'name-asc':
      sortOptions.sortBy = 'productName';
      sortOptions.sortOrder = 'asc';
      break;
    case 'name-desc':
      sortOptions.sortBy = 'productName';
      sortOptions.sortOrder = 'desc';
      break;
    default:
      sortOptions.sortBy = 'createdAt';
      sortOptions.sortOrder = 'desc';
  }
};

// Debounced search
const debouncedFetchProducts = debounce(async () => {
  currentPage.value = 1;
  await fetchProducts();
}, 300);

// Watch for changes in search, sort and filters
watch(
  [
    searchQuery,
    () => sortOptions.sortBy,
    () => sortOptions.sortOrder,
    categoryId,
    minPrice,
    maxPrice,
  ],
  async () => {
    await debouncedFetchProducts();
  },
);

// Watch for page changes
watch(currentPage, async () => {
  await fetchProducts();
});

onMounted(async () => {
  await fetchProducts();
});

// Pagination controls
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// Reset filters
const resetFilters = async () => {
  searchQuery.value = '';
  sortOptions.sortBy = 'createdAt';
  sortOptions.sortOrder = 'desc';
  categoryId.value = undefined;
  minPrice.value = undefined;
  maxPrice.value = undefined;
  currentPage.value = 1;
  await fetchProducts();
};
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
              v-model="searchQuery"
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
            <Select @update:model-value="handleSortChange($event)">
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
              v-model="minPrice"
              type="number"
              placeholder="Min price"
              class="w-full sm:w-28"
              min="0"
              step="0.01"
            />
            <span class="text-muted-foreground">to</span>
            <Input
              v-model="maxPrice"
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
      v-else-if="error"
      class="border border-destructive/20 bg-destructive/10 text-destructive p-4 rounded-lg text-center"
    >
      <p>{{ error }}</p>
      <Button
        class="mt-2 text-sm text-primary hover:text-primary/90 underline"
        @click="fetchProducts"
      >
        Try again
      </Button>
    </div>

    <div v-if="publicProducts.length > 0">
      <ProductsGrid :products="publicProducts" />
    </div>
    <!-- Empty State -->
    <div v-else class="text-center py-12">
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

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="goToPage(currentPage - 1)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>

        <div class="flex gap-1">
          <!-- First page -->
          <Button
            v-if="currentPage > 3"
            variant="outline"
            :class="{ 'bg-primary text-primary-foreground': currentPage === 1 }"
            @click="goToPage(1)"
          >
            1
          </Button>

          <!-- Ellipsis if needed -->
          <span v-if="currentPage > 4" class="px-3 flex items-center">...</span>

          <!-- Page numbers around current page -->
          <Button
            v-for="page in Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, start + 4);
              const adjustedStart = end - 4 < 1 ? 1 : end - 4;
              return i + adjustedStart;
            }).filter((p) => p > 0 && p <= totalPages)"
            :key="page"
            variant="outline"
            :class="{ 'bg-primary text-primary-foreground': currentPage === page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>

          <!-- Ellipsis if needed -->
          <span v-if="currentPage < totalPages - 3" class="px-3 flex items-center">...</span>

          <!-- Last page -->
          <Button
            v-if="currentPage < totalPages - 2"
            variant="outline"
            :class="{ 'bg-primary text-primary-foreground': currentPage === totalPages }"
            @click="goToPage(totalPages)"
          >
            {{ totalPages }}
          </Button>
        </div>

        <Button
          variant="outline"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="goToPage(currentPage + 1)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </div>

    <!-- Page info -->
    <div v-if="publicProducts.length > 0" class="text-center text-sm text-muted-foreground mt-4">
      Showing {{ (currentPage - 1) * itemsPerPage + 1 }} -
      {{ Math.min(currentPage * itemsPerPage, totalItems) }}
      of {{ totalItems }} products
    </div>
  </div>
</template>
