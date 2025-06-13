<script setup lang="ts">
import type { Product } from '@/types/product';

defineProps<{
  products: Array<Product>;
}>();
const route = useRoute();
const auth = useAuthStore();
const isSeller = auth.role === 'seller';
const isAdmin = auth.role === 'admin';
const isSellerPage = route.path.includes('/seller');
const isAdminPage = route.path.includes('/admin');

const getToProductPage = (productId: string) =>
  isAdmin && isAdminPage
    ? `/admin/product/${productId}`
    : isSeller && isSellerPage
      ? `/seller/product/${productId}`
      : `/product/${productId}`;
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
    <div
      v-for="product in products"
      :key="product.id"
      class="flex flex-col h-full rounded-lg shadow-md overflow-hidden hover:shadow-xl duration-300 bg-card border border-border/30"
    >
      <!-- Product Image Carousel -->
      <div class="w-full h-28 sm:h-52 md:h-56 lg:h-60 overflow-hidden">
        <Carousel class="w-full h-full" orientation="horizontal">
          <CarouselContent>
            <CarouselItem
              v-for="image in product.images"
              :key="image.id"
              class="relative w-full h-full"
            >
              <NuxtImg
                :src="image.imageUrl"
                :alt="`Image of ${product.productName}`"
                class="w-full sm:w-96 h-44 sm:h-96 object-cover"
                loading="lazy"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      <!-- Product Details -->
      <NuxtLink
        :to="`${getToProductPage(product.id)}`"
        class="bg-card p-2 flex flex-col justify-between flex-1"
      >
        <div class="flex flex-col flex-1 justify-between">
          <!-- Title -->
          <h3 class="text-md sm:text-lg font-semibold sm:mb-1 truncate">
            {{ product.productName }}
          </h3>

          <!-- Price -->
          <p class="text-md sm:text-xl font-bold text-primary sm">
            ${{ product.price.toFixed(2) }}
          </p>

          <!-- Likes -->
          <p class="text-sm sm:text-md sm:font-bold text-primary">
            Likes {{ product.wishlistCount }}
          </p>

          <!-- Visibility (Conditional) -->
          <p
            v-if="isAdminPage || isSellerPage"
            class="text-sm sm:text-md font-bold"
            :class="product.visibility ? 'text-green-600' : 'text-red-600'"
          >
            {{ product.visibility ? 'Visible' : 'Hidden' }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
