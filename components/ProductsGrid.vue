<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import type { Product } from '@/types/global';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

defineProps<{
  products: Array<
    Product & {
      visibility?: boolean;
    }
  >;
}>();
const auth = useAuthStore();
const isSeller = auth.role === 'seller';
const isAdmin = auth.role === 'admin';

const getToProductPage = (productId: string) => {
  return isSeller
    ? `/seller/product/${productId}`
    : isAdmin
      ? `/admin/product/${productId}`
      : `/product/${productId}`;
};
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
    <div
      v-for="product in products"
      :key="product.id"
      class="flex flex-col h-full rounded-lg shadow-md overflow-hidden hover:shadow-xl duration-300 bg-card border border-border/30"
    >
      <!-- Product Image Carousel -->
      <div class="relative w-full aspect-[4/3] overflow-hidden">
        <Carousel class="w-full" orientation="horizontal">
          <CarouselContent>
            <CarouselItem
              v-for="(image, _) in product.images"
              :key="image.id"
              class="relative w-full h-full"
            >
              <img
                :src="image.imageUrl"
                :alt="`Image of ${product.productName}`"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      <!-- Product Details -->
      <NuxtLink
        :to="getToProductPage(product.id)"
        class="bg-card p-2 flex flex-col justify-between flex-1"
      >
        <div class="flex flex-col flex-1 justify-between">
          <!-- Title -->
          <h3 class="text-md sm:text-lg font-semibold sm:mb-1 truncate">
            {{ product.productName }}
          </h3>

          <!-- Price -->
          <p class="text-lg sm:text-xl font-bold text-primary sm">
            ${{ product.price.toFixed(2) }}
          </p>

          <!-- Likes -->
          <p class="text-sm sm:text-md font-bold text-primary">Liked by 19 users</p>

          <!-- Visibility (Conditional) -->
          <p
            v-if="auth.isAuthenticated && (isSeller || isAdmin)"
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
