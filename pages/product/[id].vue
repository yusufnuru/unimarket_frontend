<script setup lang="ts">
import type { ProductParamSchema } from '@/types/product';
import { useBuyerStore } from '@/stores/buyerStore';
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';
import { useProductById } from '@/composables/useProductById';

const route = useRoute();
const authStore = useAuthStore();
const buyerStore = useBuyerStore();
const productId = computed(() => route.params.id as string);
const isSeller = computed(() => authStore.role === 'seller');
const isAdmin = computed(() => authStore.role === 'admin');
const { loading, product, error, refetch, errorMessage } = useProductById(
  `/public-product/${productId.value}`,
);

const isInWishlist = computed(() => buyerStore.isProductInWishlist(productId.value));

const addToWishListMutation = useMutation({
  mutationFn: async (productId: ProductParamSchema) => {
    return await buyerStore.addToWishlist(productId);
  },
  onSuccess: async (data) => {
    await refetch();
    toast.success(data.message, {
      description: 'Product has been added to your wishlist.',
      duration: 3000,
    });
  },
  onError: (error) => {
    let errorMessage = 'An error occurred while adding the product to your wishlist.';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    }
    toast.error('Failed to add product to wishlist', {
      description: errorMessage,
      duration: 3000,
    });
  },
});

const removeFromWishListMutation = useMutation({
  mutationFn: async (productId: ProductParamSchema) => {
    return await buyerStore.removeWishlistItem(productId);
  },
  onSuccess: async (data) => {
    await refetch();
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

const handleWishlistToggle = async () => {
  if (!authStore.isAuthenticated) {
    toast.error('Please log in to add products to your wishlist', {
      description: 'You need to be logged in to use this feature.',
      duration: 3000,
    });
    await router.push('/login');
    return;
  }

  if (isAdmin.value || isSeller.value) {
    toast.error('Sellers and admins cannot add products to wishlist', {
      description: 'This feature is only available for buyers.',
      duration: 3000,
    });
    return;
  }

  if (!product.value?.id) {
    toast.error('Invalid product information', {
      description: 'Please select a valid product to add to your wishlist.',
      duration: 3000,
    });
    return;
  }

  if (isInWishlist.value) {
    removeFromWishListMutation.mutate(product.value?.id);
  } else {
    addToWishListMutation.mutate(product.value?.id);
  }
};

const chat = useChatStore();
const router = useRouter();
const getChatRoomId = async (storeId: string) => {
  if (!storeId || storeId.trim() === '') {
    throw new Error('Invalid store information');
  }
  const { chatRoomId } = await chat.initializeChat(storeId);
  if (chatRoomId) {
    await router.push(`/message/${chatRoomId}`);
  } else {
    alert('Failed to initialize chat. Please try again later.');
  }
};

onMounted(async () => {
  if (
    authStore.isAuthenticated &&
    !isAdmin.value &&
    !isSeller.value &&
    !buyerStore.buyerWishlists?.length
  ) {
    await buyerStore.fetchBuyerWishlists();
  }
  await refetch();
});
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-8">
      <h2 class="text-xl font-semibold text-destructive mb-2">Error loading product</h2>
      <p class="text-muted-foreground mb-4">{{ errorMessage }}</p>
      <Button variant="outline" @click="refetch">Try Again</Button>
    </div>

    <!-- Product details -->
    <div v-else-if="product" class="py-0">
      <!-- Product Images -->
      <ProductItem :product="product">
        <div class="flex gap-3">
          <Button
            class="flex-1 bg-primary text-primary-foreground py-2 text-center rounded-lg hover:bg-primary/90"
            @click="getChatRoomId(product.storeId)"
          >
            Contact Seller
          </Button>

          <Button
            class="p-3 border border-input rounded-lg transition-colors duration-200"
            :class="
              isInWishlist
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-white text-black hover:bg-gray-100'
            "
            :aria-label="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
            :disabled="
              addToWishListMutation.isPending.value || removeFromWishListMutation.isPending.value
            "
            @click="handleWishlistToggle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              :fill="isInWishlist ? 'currentColor' : 'none'"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Button>
        </div>
      </ProductItem>
    </div>
  </div>
</template>
