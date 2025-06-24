<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductById } from '@/composables/useProductById';
import { useAdminStore } from '@/stores/adminStore';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import ProductItem from '@/components/ProductItem.vue';
import { createStoreWarningSchema, type CreateStoreWarningSchema } from '@/types/store';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { useApi } from '@/composables/useApi';
import { Button } from '@/components/ui/button';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  roles: ['admin'],
});

const api = useApi();
const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const adminId = computed(() => adminStore.adminId);
const productId = computed(() => route.params.id as string);
const formSchema = toTypedSchema(createStoreWarningSchema);

const { refetch, product, loading, error, errorMessage } = useProductById(
  `/admin/${adminId.value}/products/${productId.value}`,
);
const storeId = computed(() => product.value?.storeId);
const { isFieldDirty, handleSubmit, errors, resetForm } = useForm({
  validationSchema: formSchema,
});

const reviewProduct = async (
  productId: string,
  storeId: string,
  values: CreateStoreWarningSchema,
) => {
  if (!adminId.value) {
    throw new AxiosError('Admin ID is required');
  }

  const response = await api.patch(
    `/admin/${adminId.value}/review/stores/${storeId}/products/${productId}`,
    values,
  );

  return response.data as { message: string };
};

const restoreProduct = async (productId: string, storeId: string) => {
  if (!adminId.value) {
    throw new AxiosError('Admin ID is required');
  }

  const response = await api.patch(
    `/admin/${adminId.value}/restore/stores/${storeId}/products/${productId}`,
  );

  return response.data as { message: string };
};

const reviewProductMutation = useMutation({
  mutationFn: async (values: CreateStoreWarningSchema) => {
    if (!storeId.value) {
      throw new AxiosError('Store ID is required');
    }
    return await reviewProduct(productId.value, storeId.value, values);
  },
  onSuccess: async (data) => {
    toast.success(data.message, {
      description: 'Product has been reviewed successfully.',
      duration: 3000,
    });
    await router.push(`/admin/store/${storeId.value}`);
    resetForm();
  },
  onError: (error) => {
    let errorMessage = 'An error occurred while reviewing the product.';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data.message;
    }
    toast.error('Failed to review product', {
      description: errorMessage,
      duration: 3000,
    });
  },
});

const restoreProductMutation = useMutation({
  mutationFn: async () => {
    if (!storeId.value) {
      throw new AxiosError('Store ID is required');
    }
    return await restoreProduct(productId.value, storeId.value);
  },
  onSuccess: async (data) => {
    toast.success(data.message, {
      description: 'Product has been restored successfully.',
      duration: 3000,
    });
    await router.push(`/admin/product/${productId.value}`);
  },
  onError: (error) => {
    let errorMessage = 'An error occurred while restoring the product.';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data.message;
    }
    toast.error('Failed to restore product', {
      description: errorMessage,
      duration: 3000,
    });
  },
});

const isPending = restoreProductMutation.isPending || reviewProductMutation.isPending;

const handleReviewProduct = handleSubmit(async (values: CreateStoreWarningSchema) => {
  await reviewProductMutation.mutateAsync(values);
});

const handleRestoreProduct = () => {
  restoreProductMutation.mutate();
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
      <div>Restoring... Product</div>
    </div>

    <!-- Product details -->
    <div v-else-if="product" class="py-0">
      <!-- Product Images -->
      <ProductItem :product="product">
        <div class="sm:flex sm:flex-row gap-4 sm:items-center flex-col not-sm:space-y-2">
          <div class="w-full">
            <Dialog>
              <DialogTrigger as-child>
                <Button
                  :disabled="product.visibility === false"
                  class="text-sm sm:text-md w-full bg-red-600 text-primary-foreground py-2 rounded-lg hover:bg-red-600/80 hover:cursor-pointer"
                >
                  Take Action
                </Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle></DialogTitle>
                  <DialogDescription>
                    State the detail for this action. This information will be shared with the store
                    owner.
                  </DialogDescription>
                </DialogHeader>
                <form
                  id="productReviewForm"
                  :validate-on-blur="!isFieldDirty"
                  class="space-y-4"
                  @submit="handleReviewProduct"
                >
                  <FormField v-slot="{ componentField }" name="actionTaken">
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <Select v-bind="componentField" :disabled="!reviewProductMutation.isPending">
                        <FormControl>
                          <SelectTrigger class="w-full">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="product_hidden">Hide Product</SelectItem>
                            <SelectItem value="product_deleted">Delete Product</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                  <FormField v-slot="{ componentField }" name="reason">
                    <FormItem>
                      <FormLabel> Reason For Action</FormLabel>
                      <FormControl>
                        <Textarea
                          v-bind="componentField"
                          :disabled="!reviewProductMutation.isPending"
                          aria-required="true"
                          placeholder="State the reason..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>

                  <DialogFooter>
                    <Button
                      type="submit"
                      form="productReviewForm"
                      class="w-full bg-red-600 text-primary-foreground py-2 rounded-lg hover:bg-red-600/80 hover:cursor-pointer"
                      :disabled="!reviewProductMutation.isPending || Object.keys(errors).length > 0"
                    >
                      <span v-if="!reviewProductMutation.isPending" class="flex items-center">
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Taking.... Action
                      </span>
                      <span v-else>Take Action</span>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div class="w-full">
            <AlertDialog>
              <AlertDialogTrigger
                :disabled="product.visibility === true"
                class="font-semibold text-sm sm:text-md w-full bg-primary text-primary-foreground py-2 rounded-lg hover:primary/90 hover:cursor-pointer"
                >Restore Product</AlertDialogTrigger
              >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription> This will restore the product. </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel class="hover:cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    class="hover:bg-primary/90 hover:cursor-pointer"
                    @click="handleRestoreProduct"
                    >Yes</AlertDialogAction
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

<style scoped></style>
