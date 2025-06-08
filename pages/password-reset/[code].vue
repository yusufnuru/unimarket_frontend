<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { type ResetPasswordSchema, resetPasswordSchema } from '@/types/auth';
import { useForm } from 'vee-validate';
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth',
});

const showPassword = ref(false);
const router = useRouter();
const route = useRoute();
const verificationCode = (route.params.code as string).split(/[?&]/)[0];
const authStore = useAuthStore();
const formSchema = toTypedSchema(resetPasswordSchema);
const { handleSubmit, errors, resetForm, isFieldDirty } = useForm({
  validationSchema: formSchema,
  initialValues: {
    verificationCode: verificationCode.trim(),
  },
});

const forgotPasswordMutation = useMutation({
  mutationFn: async (values: ResetPasswordSchema) => {
    return await authStore.resetPassword(values);
  },
  onSuccess: async (data) => {
    resetForm();
    toast.success(data.message, {
      duration: 3000,
    });
    await router.push('/login');
  },
  onError: (error) => {
    let message = 'Failed to send password reset link';
    if (error instanceof AxiosError) {
      message = error.response?.data?.message || message;
    }
    toast.error(message, {
      duration: 3000,
    });
  },
});

const isLoading = forgotPasswordMutation.isPending;
const onSubmit = handleSubmit(async (values: ResetPasswordSchema) => {
  forgotPasswordMutation.mutate(values);
});
</script>

<template>
  <Card class="mx-auto w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl"> Forgot Password </CardTitle>
      <CardDescription> Enter your email below to reset your password </CardDescription>
    </CardHeader>
    <CardContent class="w-full">
      <form
        class="max-w-sm space-y-6"
        aria-label="Login Form"
        autocomplete="off"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="verificationCode"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Verification Code</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" aria-required="true" disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  :type="showPassword ? 'text' : 'password'"
                  v-bind="componentField"
                  :disabled="isLoading"
                  autocomplete="new-password"
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
            Sending...
          </span>
          <span v-else>Send</span>
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
