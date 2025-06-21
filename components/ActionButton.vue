<template>
  <Button size="sm" as-child>
    <NuxtLink :to="goToRequest(requestId)" class="inline-flex items-center">
      View Details
    </NuxtLink>
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';

interface Props {
  requestId: string;
}

defineProps<Props>();

const route = useRoute();
const authStore = useAuthStore();

const goToRequest = (id: string) => {
  if (authStore.role === 'admin' && route.path.includes('/admin')) {
    return `/admin/request/${id}`;
  } else if (authStore.role === 'seller' && route.path.includes('/seller')) {
    return `/seller/request/${id}`;
  }
};
</script>
