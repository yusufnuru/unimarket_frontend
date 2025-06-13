<script lang="ts"></script>
<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { Loader2 } from 'lucide-vue-next';
import { AxiosError } from 'axios';
import { useApi } from '@/composables/useApi';
import { type CreateStoreSchema, createStoreSchema } from '@/types/store';
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

const api = useApi();
const sellerStore = useSellerStore();
const formSchema = toTypedSchema(createStoreSchema);

const { isFieldDirty, handleSubmit, errors, resetForm } = useForm({
  validationSchema: formSchema,
});

const createStoreMutation = useMutation({
  mutationFn: async (values: CreateStoreSchema) => {
    return await sellerStore.createStore(values);
  },
  onSuccess: (data) => {
    toast.success(data.message, {
      duration: 3000,
    });
    resetForm();
  },
  onError: (error) => {
    let message = 'Failed to create store';
    if (error instanceof AxiosError) {
      message = error.response?.data?.message || message;
    }
    toast.error('Store Creation Failed', {
      description: message,
      duration: 3000,
    });
  },
});

const isLoading = createStoreMutation.isPending;
const onSubmit = handleSubmit(async (values) => {
  createStoreMutation.mutate(values);
});
</script>

<template>
  <Card class="mx-auto w-full max-w-lg">
    <CardHeader>
      <CardTitle class="text-2xl"> Create Store </CardTitle>
      <CardDescription> Enter Store Details Below </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <form
        class="max-w-md space-y-6"
        aria-label="Store Register Form"
        autocomplete="off"
        @submit="onSubmit"
      >
        <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Store Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Enter your store name"
                v-bind="componentField"
                :disabled="isLoading"
                aria-required="true"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="address" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Store Address</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Enter your store address"
                v-bind="componentField"
                :disabled="isLoading"
                aria-required="true"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="requestMessage"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Request Message</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell us the about your store and what you sell"
                class="resize bg-secondary p-2 rounded-sm"
                v-bind="componentField"
                :disabled="isLoading"
                aria-required="true"
              />
            </FormControl>
            <FormDescription> This message will be sent to the admin for review. </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="description" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Store Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell us a little bit about your shop"
                class="resize bg-secondary p-2 rounded-sm"
                v-bind="componentField"
                :disabled="isLoading"
                aria-required="true"
              />
            </FormControl>
            <FormDescription> Tell people about your shop </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button
          type="submit"
          class="w-full"
          :disabled="isLoading || Object.keys(errors).length > 0"
        >
          <span v-if="isLoading" class="flex items-center">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Creating Store...
          </span>
          <span v-else>Create Store</span>
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
