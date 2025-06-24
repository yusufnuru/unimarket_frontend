<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { useQuery, useMutation } from '@tanstack/vue-query';
import type { StoreRequest, StoreRequestParamSchema, RejectRequestSchema } from '@/types/store';
import { AxiosError } from 'axios';
import { useApi } from '@/composables/useApi';
import { useAdminStore } from '@/stores/adminStore';
import { toast } from 'vue-sonner';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { rejectRequestSchema } from '@/types/store';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  roles: ['admin'],
});

interface StoreRequestResponse {
  message: string;
  storeRequest: StoreRequest;
}

const api = useApi();
const router = useRouter();
const adminStore = useAdminStore();
const adminId = computed(() => adminStore.adminId);
const route = useRoute();
const requestId = computed(() => route.params.id as string);

const fetchStoreRequest = async (
  requestId: StoreRequestParamSchema,
): Promise<StoreRequestResponse> => {
  if (!adminId.value) {
    throw new AxiosError('Admin ID is not available');
  }
  const response = await api.get(`/admin/${adminId.value}/store-requests/${requestId}`);

  return response.data as StoreRequestResponse;
};

const { data, isError, error, isLoading } = useQuery({
  queryKey: ['storeRequest', requestId.value],
  queryFn: async () => {
    return fetchStoreRequest(requestId.value);
  },
});

const storeRequest = computed(() => data.value?.storeRequest);

const approveStoreMutation = useMutation({
  mutationFn: async (requestId: string) => {
    if (!adminId.value) {
      throw new AxiosError('Admin ID is not available');
    }
    const response = await api.patch(`/admin/${adminId.value}/store-requests/${requestId}/approve`);
    return response.data as Partial<StoreRequestResponse>;
  },
  onSuccess: async (data) => {
    toast.success(data?.message as string, {
      duration: 3000,
    });
    await router.push(`/admin/store/${storeRequest.value?.storeId}`);
  },
  onError: (error) => {
    let message = 'Failed to approve store request';
    if (error instanceof AxiosError) {
      message = error.response?.data.message || message;
    }
    toast.error('Approval Failed', {
      description: message,
      duration: 3000,
    });
  },
});

const approveStoreRequest = async () => {
  if (!storeRequest.value) return;
  await approveStoreMutation.mutateAsync(storeRequest.value.id);
};

const { handleSubmit, errors, isFieldDirty, resetForm } = useForm({
  validationSchema: toTypedSchema(rejectRequestSchema),
});

const rejectStoreMutation = useMutation({
  mutationFn: async ({ requestId, values }: { requestId: string; values: RejectRequestSchema }) => {
    if (!adminId.value) {
      throw new AxiosError('Admin ID is not available');
    }
    const response = await api.patch(
      `/admin/${adminId.value}/store-requests/${requestId}/reject`,
      values,
    );
    return response.data as Partial<StoreRequestResponse>;
  },
  onSuccess: async (data) => {
    toast.success(data?.message as string, {
      duration: 3000,
    });

    await router.push(`/admin/store/${storeRequest.value?.storeId}`);
    resetForm();
  },
  onError: (error) => {
    let message = 'Failed to reject store request';
    if (error instanceof AxiosError) {
      message = error.response?.data.message || message;
    }
    toast.error('Rejection Failed', {
      description: message,
      duration: 3000,
    });
  },
});

const handleRejectStoreRequest = handleSubmit(async (values: RejectRequestSchema) => {
  if (!storeRequest.value) return;
  await rejectStoreMutation.mutateAsync({
    requestId: storeRequest.value.id,
    values,
  });
});
</script>

<template>
  <div class="w-5/6 py-6 sm:p-6 mx-auto">
    <h1 class="not-sm:text-lg text-2xl font-bold mb-4">Store Request Details</h1>
    <div v-if="isLoading">
      <p class="text-center text-lg">Loading...</p>
    </div>

    <div v-else-if="isError">
      <p class="text-red-500 text-center">Error: {{ error?.message }}</p>
    </div>

    <div v-else class="w-full p-4 rounded-2xl shadow-md border">
      <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-4">
        Request ID: {{ storeRequest?.id }}
      </h2>
      <p>
        <strong>Store Id:</strong>
        {{ storeRequest?.storeId }}
      </p>

      <p>
        <strong>Store Name: </strong>
        <NuxtLink :to="`/admin/store/${storeRequest?.store.id}`"
          >{{ storeRequest?.store.storeName }}
        </NuxtLink>
      </p>
      <p
        :class="{
          'text-yellow-600': storeRequest?.requestStatus === 'pending',
          'text-green-600': storeRequest?.requestStatus === 'approved',
          'text-red-600': storeRequest?.requestStatus === 'rejected',
        }"
      >
        <strong class="text-primary">Status:</strong> {{ storeRequest?.requestStatus }}
      </p>
      <p>
        <strong>Created At:</strong>
        {{ new Date(storeRequest?.createdAt as string).toLocaleString() }}
      </p>
      <p>
        <strong>Updated At:</strong>
        {{ new Date(storeRequest?.updatedAt as string).toLocaleString() }}
      </p>
      <p>
        <strong>Rejection Reason:</strong>
        {{ storeRequest?.rejectionReason ? storeRequest?.rejectionReason : '-' }}
      </p>
      <div class="mt-4 flex flex-col sm:flex-row gap-2">
        <AlertDialog>
          <AlertDialogTrigger :disabled="storeRequest?.requestStatus !== 'pending'"
            ><Button :disabled="storeRequest?.requestStatus !== 'pending'"
              >Approve Request</Button
            ></AlertDialogTrigger
          >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product and all of
                its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel class="hover:cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                class="bg-primary hover:bg-primary/90 hover:cursor-pointer"
                @click="approveStoreRequest"
                >Approve</AlertDialogAction
              >
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog>
          <DialogTrigger as-child>
            <Button
              :disabled="storeRequest?.requestStatus !== 'pending'"
              class="bg-red-600 hover:bg-red-600/80 hover:cursor-pointer"
              variant="default"
            >
              Reject Request
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this store request. This information will be
                shared with the store owner.
              </DialogDescription>
            </DialogHeader>
            <form
              id="rejectRequestForm"
              :validate-on-blur="!isFieldDirty"
              class="space-y-4"
              @submit="handleRejectStoreRequest"
            >
              <FormField v-slot="{ componentField }" name="rejectionReason">
                <FormItem>
                  <FormLabel> Rejection Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      v-bind="componentField"
                      :disabled="!rejectStoreMutation.isPending"
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
                  form="rejectRequestForm"
                  class="w-full"
                  :disabled="!rejectStoreMutation.isPending || Object.keys(errors).length > 0"
                >
                  <span v-if="!rejectStoreMutation.isPending" class="flex items-center">
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Rejecting....
                  </span>
                  <span v-else>Reject</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
</template>
