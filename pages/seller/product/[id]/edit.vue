<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { useMutation } from '@tanstack/vue-query';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';

import { toTypedSchema } from '@vee-validate/zod';
import { type UpdateProductSchema, updateProductSchema } from '@/types/product';
import { useCategory } from '@/composables/useCategory';
import { Checkbox } from '@/components/ui/checkbox';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

definePageMeta({
  layout: 'seller',
  middleware: ['auth'],
  roles: ['seller'],
});

const fileInput = ref<HTMLInputElement | null>(null);
const router = useRouter();
const route = useRoute();
const seller = useSellerStore();
const productId = computed(() => route.params.id as string);
const storeId = computed(() => seller.storeId);
const { product } = useProductById(`/store/${storeId.value}/products/${productId.value}`);
const updateProductFormSchema = toTypedSchema(updateProductSchema);
const { categories } = useCategory();
const selectedImages = ref<File[]>([]);
const sellerStore = useSellerStore();
const { handleSubmit, errors, resetForm, isFieldDirty, setValues } = useForm({
  validationSchema: updateProductFormSchema,
});

const resetFormWithCurrentData = () => {
  if (!product.value) return;
  setValues({
    name: product.value.productName || '',
    description: product.value.description || '',
    quantity: product.value.quantity.toString() || '',
    price: product.value.price.toString() || '',
    category: product.value.categoryId || '',
    imagesToRemove: [],
    newImages: [],
  });
};

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;

  // Append new files to existing ones
  selectedImages.value.push(...Array.from(files));

  // Update the VeeValidate form field
  setValues({ newImages: selectedImages.value });
};

const removeSelectedImage = (index: number) => {
  selectedImages.value.splice(index, 1);
  setValues({ newImages: selectedImages.value });
};

const updateProductMutation = useMutation({
  mutationKey: ['updateStoreProduct', productId.value],
  mutationFn: async (formData: FormData) => {
    return await sellerStore.updateStoreProduct(productId.value, formData);
  },
  onSuccess: async (data) => {
    toast.success(data.message, {
      duration: 3000,
    });
    resetForm();
    await router.push(`/seller/product/${productId.value}`);
  },
  onError: (error) => {
    let message = 'Product Updating Failed';
    if (error instanceof AxiosError) {
      message = error.response?.data.message;
    }
    toast.error('Updating Failed', {
      description: message,
      duration: 3000,
    });
  },
});

const updateProduct = handleSubmit((values: UpdateProductSchema) => {
  const formData = new FormData();

  if (values.name) formData.append('name', values.name);
  if (values.category) formData.append('category', values.category);
  if (values.description) formData.append('description', values.description);
  if (values.price) formData.append('price', values.price);
  if (values.quantity) formData.append('quantity', values.quantity.toString());

  // Correct image removal handling from form state:
  if (values.imagesToRemove?.length) {
    formData.append('imagesToRemove', JSON.stringify(values.imagesToRemove));
  }

  // Correct new image upload handling from manually tracked files:
  const files = values.newImages;
  if (files && files.length > 0) {
    const fileList = files instanceof FileList ? Array.from(files) : files;
    fileList.forEach((file: File) => {
      formData.append('images', file);
    });
  }

  updateProductMutation.mutate(formData);
});

onMounted(() => {
  resetFormWithCurrentData();
});
</script>

<template>
  <div class="w-5/6 mx-auto py-6 sm:p-6">
    <CardHeader class="mb-4">
      <CardTitle class="text-2xl"> Edit Product {{ productId }} </CardTitle>
    </CardHeader>
    <CardContent class="sm:w-1/2 grid gap-4">
      <form
        v-if="product"
        id="createRequestForm"
        :validate-on-blur="!isFieldDirty"
        class="space-y-4"
        @submit="updateProduct"
      >
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                :disabled="!updateProductMutation.isPending"
                aria-required="true"
                placeholder="Product Name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="price">
            <FormItem v-auto-animate>
              <FormLabel>Product Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  :disabled="!updateProductMutation.isPending"
                  aria-required="true"
                  placeholder="Product Price"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="quantity">
            <FormItem v-auto-animate>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  v-bind="componentField"
                  :disabled="!updateProductMutation.isPending"
                  aria-required="true"
                  placeholder="Available Quantity"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="category">
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="category in categories" :key="category.id" :value="category.id"
                    >{{ category.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem v-auto-animate>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                :disabled="!updateProductMutation.isPending"
                placeholder="Product description"
                rows="4"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="imagesToRemove">
          <FormItem>
            <div class="mb-4">
              <FormLabel class="text-base"> Images </FormLabel>
              <FormDescription>Select Images to remove</FormDescription>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FormField
                v-for="image in product.images"
                v-slot="{ value, handleChange }"
                :key="image.id"
                type="checkbox"
                :value="image.id"
                name="imagesToRemove"
              >
                <FormItem class="flex flex-row items-start gap-2 sm:space-x-3 space-6">
                  <FormControl>
                    <Checkbox
                      :model-value="value?.includes(image.id)"
                      @update:model-value="handleChange"
                    />
                  </FormControl>
                  <NuxtImg
                    :src="image.imageUrl"
                    :alt="`Image of ${product.productName}`"
                    width="100"
                    height="100"
                    class="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md bg-secondary-foreground"
                    loading="lazy"
                  />
                </FormItem>
              </FormField>
            </div>
          </FormItem>
        </FormField>

        <FormField v-slot="{ errorMessage: errMsg }" name="newImages">
          <FormItem v-auto-animate>
            <FormLabel>Upload Images</FormLabel>
            <FormControl>
              <Input
                ref="fileInput"
                type="file"
                multiple
                :disabled="!updateProductMutation.isPending"
                @change="handleFileSelect"
              />
            </FormControl>
            <FormMessage>{{ errMsg }}</FormMessage>
          </FormItem>
        </FormField>

        <div v-if="selectedImages.length" class="mt-2 space-y-2">
          <p class="font-medium">Selected Images:</p>
          <ul class="list-disc list-inside space-y-1">
            <li
              v-for="(file, index) in selectedImages"
              :key="index"
              class="flex items-center space-x-2"
            >
              <span>{{ file.name }}</span>
              <button
                type="button"
                class="text-red-500 hover:underline text-sm"
                @click="removeSelectedImage(index)"
              >
                Remove
              </button>
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          form="createRequestForm"
          class="w-full"
          :disabled="!updateProductMutation.isPending || Object.keys(errors).length > 0"
        >
          <span v-if="!updateProductMutation.isPending" class="flex items-center">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Updating Product...
          </span>
          <span v-else>Save Changes</span>
        </Button>
      </form>
    </CardContent>
  </div>
</template>

<style scoped></style>
