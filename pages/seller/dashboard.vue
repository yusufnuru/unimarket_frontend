<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSellerStore } from '@/stores/sellerStore';
import DataTable from '@/components/data-table/DataTable.vue';
import { storeRequestColumns } from '@/components/data-table/StoreRequestColumns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

definePageMeta({
  layout: 'seller',
  middleware: ['auth'],
  roles: ['seller'],
});

const seller = useSellerStore();
const error = ref<unknown>(null);
const storeId = computed(() => seller.storeId);
const isLoading = ref(true); // Start with loading true
const storeName = computed(() => seller.storeName);
const storeOwnerId = computed(() => seller.storeOwnerId);
const storeOwnerName = computed(() => seller.storeOwnerName);
const storeProducts = computed(() => seller.storeProducts);
const storeRequest = computed(() => seller.storeRequest);

const hasStoreData = computed(() => {
  return !isLoading.value && storeId.value;
});

onMounted(async () => {
  try {
    if (!storeId.value) {
      await seller.fetchStore();
    }

    await seller.fetchStoreRequest();
    await seller.getStoreProducts({
      page: 1,
      limit: 4,
      sortOptions: {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = err;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="w-5/6 p-6 mx-auto">
    <h1 class="not-sm:text-lg text-2xl font-bold mb-4">Welcome to Seller Dashboard</h1>

    <!-- Use ClientOnly to prevent hydration mismatches -->
    <ClientOnly>
      <div v-if="isLoading" class="flex flex-col gap-3">
        <div class="w-11/12 p-6 shadow-md">
          <p>Loading...</p>
        </div>
      </div>

      <div v-else-if="hasStoreData" class="flex flex-col gap-3">
        <div class="w-11/12 p-6 rounded-2xl shadow-md border">
          <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-4">Store Details</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 text-gray-700">
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Store Name</span>
              <p class="not-sm:text-sm text-md">{{ storeName }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Store ID</span>
              <p class="not-sm:text-sm text-md">{{ storeId }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Owner ID</span>
              <p class="not-sm:text-sm text-md">{{ storeOwnerId }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Owner Name</span>
              <p class="not-sm:text-sm text-md">{{ storeOwnerName }}</p>
            </div>
            <div>
              <NuxtLink
                to="/seller/store"
                class="w-1/2 bg-primary text-primary-foreground py-3 text-center rounded-lg hover:bg-primary/90 block"
              >
                More Info
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="w-11/12 p-6 rounded-2xl shadow-md border">
          <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-4">Store Requests</h2>
          <div v-if="storeRequest && storeRequest.length > 0" class="w-full flex flex-wrap">
            <ScrollArea class="w-full border rounded-md">
              <DataTable :columns="storeRequestColumns" :data="storeRequest" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div v-else>
            <p>No requests available for this store.</p>
          </div>
        </div>

        <div class="w-11/12 rounded-2xl shadow-md border py-6 px-6">
          <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-4">Store Products</h2>
          <div v-if="storeProducts && storeProducts.length > 0" class="flex flex-col gap-4">
            <ProductsGrid :products="storeProducts" />
            <div class="flex justify-center mt-4">
              <NuxtLink
                class="mx-auto p-2 bg-primary text-primary-foreground border rounded-lg hover:bg-primary/90"
                to="/seller/product"
              >
                View More
              </NuxtLink>
            </div>
          </div>
          <div v-else class="px-2">
            <p>No products available for this store.</p>
            <NuxtLink to="/seller/product/new"
              ><Button class="not-sm:w-[120px] not-sm:text-md">Add Product</Button></NuxtLink
            >
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div class="w-11/12 p-6 rounded-2xl shadow-md border">
          <p>You don't have a store yet. Please register a store to continue.</p>
          <RegisterStore />
        </div>
      </div>

      <template #fallback>
        <div class="flex flex-col gap-3">
          <div class="w-11/12 p-6 rounded-2xl shadow-md border">
            <p>Loading...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
