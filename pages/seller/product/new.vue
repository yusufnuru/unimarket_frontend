<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { toTypedSchema } from '@vee-validate/zod';
import { type CreateProductSchema, createProductSchema } from '@/types/product';
import { useForm } from 'vee-validate';
import { useMutation } from '@tanstack/vue-query';
import { useSellerStore } from '@/stores/sellerStore';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { useCategory } from '@/composables/useCategory';
import { Loader2 } from 'lucide-vue-next';
import { CardTitle } from '@/components/ui/card';

definePageMeta({
  layout: 'seller',
  middleware: ['auth'],
  roles: ['seller'],
});

const sellerStore = useSellerStore();
const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);
const createProductFormSchema = toTypedSchema(createProductSchema);
const { categories } = useCategory();
const selectedImages = ref<File[]>([]);
const { handleSubmit, errors, resetForm, isFieldDirty, setValues, setErrors } = useForm({
  validationSchema: createProductFormSchema,
  initialValues: {
    newImages: [],
  },
});

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

const createProductMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    return await sellerStore.createStoreProduct(formData);
  },
  onSuccess: async (data) => {
    console.log(data);
    toast.success(data.message, {
      duration: 3000,
    });
    resetForm();
    await router.push(`/seller/product/${data.product.id}`);
  },
  onError: (error) => {
    let message = 'Create Product Failed';
    if (error instanceof AxiosError) {
      message = error.response?.data.message;
    }
    toast.error('Create Product Failed', {
      description: message,
      duration: 3000,
    });
  },
});

const createProduct = handleSubmit((values: CreateProductSchema) => {
  const formData = new FormData();

  if (values.name) formData.append('name', values.name);
  if (values.category) formData.append('category', values.category);
  if (values.description) formData.append('description', values.description);
  if (values.price) formData.append('price', values.price);
  if (values.quantity) formData.append('quantity', values.quantity.toString());

  // Correct new image upload handling from manually tracked files:
  const files = values.newImages;
  if (files && files.length > 0) {
    const fileList = files instanceof FileList ? Array.from(files) : files;
    fileList.forEach((file: File) => {
      formData.append('images', file);
    });
  } else {
    setErrors({
      newImages: 'Please upload at least one image.',
    });
    return;
  }

  createProductMutation.mutate(formData);
});
const isPending = createProductMutation.isPending;
</script>

<template>
  <div class="w-5/6 mx-auto py-6 sm:p-6">
    <CardHeader class="mb-4">
      <CardTitle class="text-2xl">Add Product</CardTitle>
      <CardDescription>
        Fill in the details below to add a new product to your store.
      </CardDescription>
    </CardHeader>
    <CardContent class="sm:w-1/2 grid gap-4">
      <form :validate-on-blur="!isFieldDirty" class="space-y-4" @submit="createProduct">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                :disabled="isPending"
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
                  :disabled="isPending"
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
                  :disabled="isPending"
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
                :disabled="isPending"
                placeholder="Product description"
                rows="4"
              />
            </FormControl>
            <FormMessage />
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
                :disabled="isPending"
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
          :disabled="isPending || Object.keys(errors).length > 0"
          class="w-full"
        >
          <span v-if="isPending" class="flex items-center">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Adding Product...
          </span>
          <span v-else>Add Product</span>
        </Button>
      </form>
    </CardContent>
  </div>
</template>
