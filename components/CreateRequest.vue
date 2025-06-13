<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { useMutation } from '@tanstack/vue-query';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { createStoreRequestSchema, type CreateStoreRequestSchema } from '@/types/store';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';
import { toTypedSchema } from '@vee-validate/zod';
const requestFormSchema = toTypedSchema(createStoreRequestSchema);

const sellerStore = useSellerStore();
const {
  handleSubmit: handleCreateRequest,
  errors: createRequestErrors,
  resetForm: createRequestResetForm,
  isFieldDirty: isCreateRequestFieldDirty,
} = useForm({
  validationSchema: requestFormSchema,
});

const createStoreRequestMutation = useMutation({
  mutationFn: async (values: CreateStoreRequestSchema) => {
    return await sellerStore.createStoreRequest(values);
  },
  onSuccess: async (data) => {
    toast.success(data.message, {
      duration: 3000,
    });
    createRequestResetForm();
    await sellerStore.fetchStoreRequest();
  },
  onError: (error) => {
    let message = 'Failed to create store request';
    if (error instanceof AxiosError) {
      message = error.response?.data.message || message;
    }
    toast.error('Request Failed', {
      description: message,
      duration: 3000,
    });
  },
});

const createRequest = handleCreateRequest((values: CreateStoreRequestSchema) => {
  createStoreRequestMutation.mutate(values);
});
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="default"> Send Request </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle></DialogTitle>
        <DialogDescription>
          Create a request to issues related to your store. Click create when you're done.
        </DialogDescription>
      </DialogHeader>
      <form
        id="createRequestForm"
        :validate-on-blur="!isCreateRequestFieldDirty"
        class="space-y-4"
        @submit="createRequest"
      >
        <FormField v-slot="{ componentField }" name="requestMessage">
          <FormItem v-auto-animate>
            <FormLabel>Request Message</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                :disabled="!createStoreRequestMutation.isPending"
                aria-required="true"
                placeholder="Describe your issue or request here..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button
            type="submit"
            form="createRequestForm"
            class="w-full"
            :disabled="
              !createStoreRequestMutation.isPending || Object.keys(createRequestErrors).length > 0
            "
          >
            <span v-if="!createStoreRequestMutation.isPending" class="flex items-center">
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              Creating Request....
            </span>
            <span v-else>Create Request</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
