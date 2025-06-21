<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { onMounted, ref } from 'vue';
import { useSellerStore } from '@/stores/sellerStore';
import { AxiosError } from 'axios';
import { toTypedSchema } from '@vee-validate/zod';
import { type UpdateStoreSchema, updateStoreSchema } from '@/types/store';
import { useForm } from 'vee-validate';
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { storeRequestColumns } from '@/components/data-table/StoreRequestColumns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import DataTable from '@/components/data-table/DataTable.vue';

const sellerStore = useSellerStore();
const error = ref<unknown>(null);
const storeId = computed(() => sellerStore.storeId);
const isLoading = ref(false);
const storeStatus = computed(() => sellerStore.storeStatus);
const storeName = computed(() => sellerStore.storeName);
const storeOwnerId = computed(() => sellerStore.storeOwnerId);
const storeOwnerName = computed(() => sellerStore.storeOwnerName);
const storeDescription = computed(() => sellerStore.storeDescription);
const storeAddress = computed(() => sellerStore.storeAddress);
const storeRequest = computed(() => sellerStore.storeRequest);
const updateFormSchema = toTypedSchema(updateStoreSchema);

const {
  isFieldDirty: isUpdateStoreFieldDirty,
  handleSubmit: handleUpdateStore,
  errors: updateStoreErrors,
  resetForm: resetUpdateStoreForm,
  setValues: setValuesUpdateStore,
} = useForm({
  validationSchema: updateFormSchema,
});

const resetFormWithCurrentData = () => {
  setValuesUpdateStore({
    name: storeName.value || '',
    description: storeDescription.value || '',
    address: storeAddress.value || '',
  });
};

const updateStoreMutation = useMutation({
  mutationFn: async (values: UpdateStoreSchema) => {
    return await sellerStore.updateStore(values);
  },
  onSuccess: async (data) => {
    toast.success(data.message, {
      duration: 3000,
    });
    resetUpdateStoreForm();
    await sellerStore.fetchStore();
  },
  onError: (error) => {
    let message = 'Failed to update store';
    if (error instanceof AxiosError) {
      message = error.response?.data.message || message;
    }
    toast.error('Update Failed', {
      description: message,
      duration: 3000,
    });
  },
});

const updateStore = handleUpdateStore((values: UpdateStoreSchema) => {
  const currentValues = {
    name: storeName.value || '',
    description: storeDescription.value || '',
    address: storeAddress.value || '',
  };

  const filteredValues: Partial<typeof values> = {};

  for (const key in values) {
    const newValue = values[key as keyof typeof currentValues]?.trim();
    const oldValue = currentValues[key as keyof typeof currentValues]?.trim();

    if (newValue !== oldValue) {
      filteredValues[key as keyof typeof currentValues] = values[key as keyof typeof currentValues];
    }
  }

  if (Object.keys(filteredValues).length === 0) {
    toast.info('No changes detected', {
      description: 'Please modify at least one field before saving.',
      duration: 3000,
    });
    return;
  }

  updateStoreMutation.mutate(filteredValues as UpdateStoreSchema);
});

onMounted(async () => {
  try {
    isLoading.value = true;
    if (!storeId.value) {
      await sellerStore.fetchStore();
    }
    await sellerStore.fetchStoreRequest();
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load store data.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="w-5/6 mx-auto p-6">
    <h1 class="not-sm:text-lg text-2xl font-bold mb-4">Store Dashboard</h1>
    <ClientOnly>
      <div v-if="storeId" class="flex flex-col gap-3">
        <div class="w-11/12 p-6 rounded-2xl shadow-md border">
          <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-4">Store Details</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 text-gray-700">
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Store Name</span>
              <p class="not-sm:text-sm text-md">{{ storeName }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Store ID</span>
              <p class="not-sm:text-sm text-md">{{ storeId }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Owner ID</span>
              <p class="not-sm:text-sm text-md">{{ storeOwnerId }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Owner Name</span>
              <p class="not-sm:text-sm text-md">{{ storeOwnerName }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Description</span>
              <p class="not-sm:text-sm text-lg">
                {{ storeDescription || 'No description available' }}
              </p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Address</span>
              <p class="not-sm:text-sm text-lg">{{ storeAddress }}</p>
            </div>
            <div>
              <span class="not-sm:text-sm font-bold text-foreground">Status</span>
              <p
                class="not-sm:text-sm text-lg"
                :class="{
                  'text-green-500': storeStatus === 'active',
                  'text-yellow-500': storeStatus === 'incomplete',
                  'text-red-500': storeStatus === 'inactive' || storeStatus === 'suspended',
                }"
              >
                {{ storeStatus }}
              </p>
            </div>
            <div>
              <Dialog>
                <DialogTrigger as-child>
                  <Button variant="default" @click="resetFormWithCurrentData"> Edit Store </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Store</DialogTitle>
                    <DialogDescription>
                      Make changes to your Store Details here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    id="dialogForm"
                    :validate-on-blur="!isUpdateStoreFieldDirty"
                    class="space-y-4"
                    @submit="updateStore"
                  >
                    <FormField v-slot="{ componentField }" name="name">
                      <FormItem v-auto-animate>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            v-bind="componentField"
                            aria-required="true"
                            :disabled="!updateStoreMutation.isPending"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="description">
                      <FormItem v-auto-animate>
                        <FormLabel>Store Address</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            v-bind="componentField"
                            :disabled="!updateStoreMutation.isPending"
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="address">
                      <FormItem v-auto-animate>
                        <FormLabel>Store Address</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            v-bind="componentField"
                            :disabled="!updateStoreMutation.isPending"
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <DialogFooter>
                      <Button
                        type="submit"
                        form="dialogForm"
                        class="w-full"
                        :disabled="
                          !updateStoreMutation.isPending ||
                          Object.keys(updateStoreErrors).length > 0
                        "
                      >
                        <span v-if="!updateStoreMutation.isPending" class="flex items-center">
                          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </span>
                        <span v-else>Save Changes</span>
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div class="w-11/12 p-6 rounded-2xl shadow-md border">
          <h2 class="not-sm:text-xl text-2xl font-semibold text-g mb-4">Store Requests</h2>
          <div v-if="storeRequest && storeRequest.length > 0" class="w-full flex flex-wrap gap-4">
            <ScrollArea class="w-full border rounded-md">
              <DataTable :columns="storeRequestColumns" :data="storeRequest" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div>
              <CreateRequest />
            </div>
          </div>
          <div v-else>
            <p>No requests available for this store.</p>
          </div>
        </div>
      </div>

      <div v-else-if="isLoading">
        <p>Loading...</p>
      </div>

      <div v-else>
        <p>You don't have a store yet. Please register a store to continue.</p>
        <RegisterStore />
      </div>
      <template #fallback>
        <div class="flex flex-col gap-3">
          <div class="w-11/12 p-6 rounded-2xl shadow-md border">
            <p>Loading...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
