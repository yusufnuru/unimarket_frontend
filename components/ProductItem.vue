<script setup lang="ts">
import type { Product, ProductCategory } from '@/types/product';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps<{
  product: Product & {
    category: ProductCategory;
  };
}>();
const route = useRoute();
const authStore = useAuthStore();
const isSeller = computed(() => authStore.role === 'seller');
const isAdmin = computed(() => authStore.role === 'admin');
const isAdminPage = computed(() => route.path.includes('/admin'));
const isSellerPage = computed(() => route.path.includes('/seller'));
</script>

<template>
  <div class="flex flex-col gap-0 max-w-2xl">
    <!-- Product Images -->
    <div class="bg-card rounded-t-lg overflow-hidden shadow-md">
      <Carousel orientation="horizontal" class="w-full">
        <CarouselContent>
          <CarouselItem v-for="image in product.images" :key="image.id" class="h-full">
            <div class="w-full h-64 md:h-96 relative">
              <NuxtImg
                :src="image.imageUrl"
                :alt="`Image of ${product.productName}`"
                width="500"
                height="300"
                class="w-full h-full object-contain bg-secondary-foreground"
                loading="lazy"
              />
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious
          v-if="product.images?.length > 1"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-10"
        />
        <CarouselNext
          v-if="product.images?.length > 1"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-10"
        />
      </Carousel>
    </div>

    <!-- Product Information -->
    <div class="bg-card rounded-b-lg p-6 shadow-md border border-border/30">
      <h1 class="text-2xl font-bold mb-2 text-card-foreground">{{ product.productName }}</h1>

      <div class="flex items-center justify-between mb-4">
        <p class="text-2xl font-bold text-primary">${{ product.price?.toFixed(2) }}</p>
        <p class="text-sm bg-secondary px-3 py-1 rounded-full text-secondary-foreground">
          {{ product.quantity }} in stock
        </p>
      </div>

      <!-- Show visibility badge for sellers/admins -->
      <div
        v-if="authStore.isAuthenticated && (isSeller || isAdmin) && (isAdminPage || isSellerPage)"
        class="mb-4"
      >
        <span
          class="px-3 py-1 rounded-full text-sm font-medium"
          :class="product.visibility ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          {{ product.visibility ? 'Visible' : 'Hidden' }}
        </span>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-2">Description</h2>
        <p class="text-muted-foreground">
          {{ product.description ? product.description : 'No description available' }}
        </p>
      </div>

      <!-- Product details/specs -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-2">Details</h2>
        <div class="flex flex-col sm:flex-row justify-between">
          <div v-if="product.categoryId === product.category.id" class="text-sm">
            <span class="font-medium text-muted-foreground">Category:</span>
            <span class="ml-2">{{ product.category.name }}</span>
          </div>
          <div class="text-sm">
            <span class="font-medium text-muted-foreground">Liked by:</span>
            <span class="ml-2">{{ product.wishlistCount }} users</span>
          </div>
        </div>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
