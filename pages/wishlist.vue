<script lang="ts" setup>
import { useBuyerStore } from '@/stores/buyerStore';
import { useMutation } from '@tanstack/vue-query';
import type { ProductParamSchema } from '@/types/product';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';

definePageMeta({
  middleware: 'auth',
  roles: ['buyer'],
});

const buyerStore = useBuyerStore();

const removeFromWishListMutation = useMutation({
  mutationFn: async (productId: ProductParamSchema) => {
    return await buyerStore.removeWishlistItem(productId);
  },
  onSuccess: async (data) => {
    toast.success(data.message, {
      description: 'Product has been removed from your wishlist.',
      duration: 3000,
    });
  },
  onError: (error) => {
    let errorMessage = 'An error occurred while removing the product from your wishlist.';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    }
    toast.error('Failed to remove product from wishlist', {
      description: errorMessage,
      duration: 3000,
    });
  },
});

onMounted(async () => {
  try {
    if (!buyerStore.buyerWishlists?.length) {
      await buyerStore.fetchBuyerWishlists();
    }
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
  }
});
</script>
<template>
  <div class="min-h-screen p-6 w-5/6 mx-auto max-w-2xl">
    <h2 class="text-2xl font-bold mb-4">Your Wishlist</h2>
    <h3 class="text-xl font-bold mb-2">
      Items : {{ buyerStore.buyerWishlists ? buyerStore.buyerWishlists.length : 0 }}
    </h3>
    <div v-if="buyerStore.buyerWishlists?.length === 0" class="text-center text-gray-500">
      Your wishlist is empty.
    </div>
    <div v-else class="flex-col w-full flex gap-3">
      <div
        v-for="item in buyerStore.buyerWishlists"
        :key="item.id"
        class="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-200 flex"
      >
        <div class="flex items-start gap-3 not-sm:flex-col w-11/12 max-w-2xl">
          <NuxtLink :to="`/product/${item.product.id}`" class="w-full">
            <div class="flex not-sm:h-28 w-full">
              <div class="w-32 h-24 mr-4 overflow-hidden rounded">
                <Carousel class="w-full h-full" orientation="horizontal">
                  <CarouselContent>
                    <CarouselItem
                      v-for="image in item.product.images"
                      :key="image.id"
                      class="relative w-full h-full"
                    >
                      <NuxtImg
                        :src="image.imageUrl"
                        :alt="`Image of ${item.product.productName}`"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>
              <div class="flex-col flex w-2/3">
                <h3 class="text-sm font-semibold">Name: {{ item.product.productName }}</h3>
                <p class="text-green-600 font-bold">Price: ${{ item.product.price.toFixed(2) }}</p>
              </div>
            </div>
          </NuxtLink>
          <Button
            class="mt-2 bg-primary text-white px-2 py-2 rounded hover:active:bg-primary-100:5 hover:cursor-pointer transition-colors not-sm:w-full"
            @click="removeFromWishListMutation.mutate(item.product.id)"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
