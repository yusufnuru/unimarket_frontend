<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
definePageMeta({
  layout: 'seller',
  middleware: ['auth'],
  roles: ['seller'],
});

const route = useRoute();
const router = useRouter();
const sellerStore = useSellerStore();
const productId = computed(() => route.params.id as string);
const storeId = computed(() => sellerStore.storeId);
const { refetch, product, loading, error, errorMessage } = useProductById(
  `/store/${storeId.value}/products/${productId.value}`,
);

const deleteProductMutation = useMutation({
  mutationKey: ['updateStoreProduct', productId.value],
  mutationFn: async () => {
    return await sellerStore.deleteStoreProduct(productId.value);
  },
  onSuccess: async (data) => {
    toast.success(data.message, {
      description: 'Product has been deleted successfully.',
      duration: 3000,
    });
    await router.push(`/seller/product/`);
  },
  onError: (error) => {
    let errorMessage = 'An error occurred while deleting the product.';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data.message;
    }
    toast.error('Failed to delete product', {
      description: errorMessage,
      duration: 3000,
    });
  },
});

const isPending = deleteProductMutation.isPending;
const handleDeleteProduct = () => {
  deleteProductMutation.mutate();
};
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

    <div v-else-if="isPending" class="flex justify-center items-center min-h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <div>Deleting... Product</div>
    </div>

    <!-- Product details -->
    <div v-else-if="product" class="py-0">
      <!-- Product Images -->
      <ProductItem :product="product">
        <div class="sm:flex sm:flex-row gap-4 sm:items-center flex-col not-sm:space-y-2">
          <div class="w-full">
            <NuxtLink :to="`/seller/product/${product.id}/edit`">
              <Button
                class="text-sm sm:text-md w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 hover:cursor-pointer"
              >
                Edit Product
              </Button>
            </NuxtLink>
          </div>
          <div class="w-full">
            <AlertDialog>
              <AlertDialogTrigger
                class="font-semibold text-sm sm:text-md w-full bg-red-500 text-primary-foreground py-2 rounded-lg hover:bg-red-400 hover:cursor-pointer"
                >Delete Product</AlertDialogTrigger
              >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the product and all
                    of its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel class="hover:cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    class="bg-red-500 hover:bg-red-400 hover:cursor-pointer"
                    @click="handleDeleteProduct"
                    >Delete</AlertDialogAction
                  >
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </ProductItem>
    </div>
  </div>
</template>
