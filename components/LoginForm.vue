<script lang="ts"></script>
<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { toast } from '@/components/ui/toast';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-vue-next';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { loginSchema } from '@/schemas/auth';

const auth = useAuthStore();
const serverResponse = ref<unknown>(null);
const isLoading = ref(false);
const showPassword = ref(false);
const formSchema = toTypedSchema(loginSchema);

const { isFieldDirty, handleSubmit, errors, resetForm } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    isLoading.value = true;

    const response = await auth.login(values);

    serverResponse.value = response;
    console.log('response', response);
    toast({
      title: 'Login Successful',
      description: `${JSON.stringify(response.data.message)}`,
      variant: 'default',
      duration: 3000,
    });

    resetForm();
    await navigateTo('/');
  } catch (error: unknown) {
    let errorMessage = 'Login Failed';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    toast({
      title: 'Login Failed',
      description: errorMessage,
      variant: 'destructive',
      duration: 3000,
    });
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <Card class="mx-auto max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl"> Login </CardTitle>
      <CardDescription> Enter your email below to login to your account </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <form
        class="max-w-sm space-y-6"
        aria-label="Login Form"
        autocomplete="off"
        @submit="onSubmit"
      >
        <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="salam@example.com"
                v-bind="componentField"
                :disabled="isLoading"
                autocomplete="email"
                aria-required="true"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <div class="flex items-center">
              <FormLabel>Password</FormLabel>
              <a
                href="/forgot-password"
                class="ml-auto inline-block text-sm underline"
                :class="{ 'pointer-events-none opacity-50': isLoading }"
              >
                Forgot your password?
              </a>
            </div>
            <FormControl>
              <div class="relative">
                <Input
                  :type="showPassword ? 'text' : 'password'"
                  v-bind="componentField"
                  :disabled="isLoading"
                  autocomplete="current-password"
                  aria-required="true"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="absolute right-2 top-1/2 -translate-y-1/2"
                  :disabled="isLoading"
                  aria-label="Toggle password visibility"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="!showPassword" class="h-4 w-4" />
                  <EyeOffIcon v-else class="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
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
            Logging in...
          </span>
          <span v-else>Login</span>
        </Button>
      </form>

      <div class="mt-4 text-center text-sm">
        Don't have an account?
        <NuxtLink
          to="/register"
          class="underline"
          :class="{ 'pointer-events-none opacity-50': isLoading }"
        >
          Create Account
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
