<template>
  <div class="flex min-h-screen justify-center mt-12">
    <div class="container mx-auto max-w-md py-12 px-6 text-center">
      <div v-if="loading" class="flex justify-center">
        <Spinner />
      </div>
      <div v-else class="space-y-6">
        <Alert :variant="success ? 'default' : 'destructive'" class="w-fit mx-auto rounded-xl">
          <AlertCircle v-if="!success" class="h-4 w-4" />
          <CheckCircle2 v-else class="h-4 w-4" />
          <AlertDescription class="ml-2">
            {{ success ? 'Email Verified!' : errorMessage }}
          </AlertDescription>
        </Alert>

        <p v-if="!success" class="text-muted-foreground">
          The link is either invalid or expired.
          <NuxtLink to="/password/forgot" class="text-primary hover:underline">
            Get a new link
          </NuxtLink>
        </p>

        <NuxtLink to="/" class="text-primary hover:underline"> Back to home </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from '@/components/ui/toast';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/useAuthStore';
import { AxiosError } from 'axios';

definePageMeta({
  layout: 'auth',
  middleware: ['auth-redirect'],
});

const auth = useAuthStore();
const route = useRoute();
const code = route.params.code as string; // Dynamic route param
const loading = ref(true);
const success = ref(false);
const errorMessage = ref('Invalid Link');

const verify = async () => {
  try {
    await auth.verifyEmail(code); // Call the store method
    success.value = true;
    setTimeout(() => {
      void navigateTo('/');
    }, 3000);

    toast({
      title: 'Email Successfully Verified',
      description: 'You can now login to your account',
      variant: 'default',
      duration: 3000,
    });
  } catch (error: unknown) {
    success.value = false;

    let errorMessage = 'Account Verfication Failed';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    toast({
      title: 'Verification Failed',
      description: errorMessage,
      variant: 'destructive',
      duration: 3000,
    });
    // Customize error message based on backend response if possible
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await verify();
});
</script>
