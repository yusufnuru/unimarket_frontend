<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { type ForgotPasswordSchema, forgotPasswordSchema } from '@/types/auth';
import { useForm } from 'vee-validate';
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { AxiosError } from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth',
});

const authStore = useAuthStore();
const formSchema = toTypedSchema(forgotPasswordSchema);

const { handleSubmit, errors, resetForm, isFieldDirty } = useForm({
  validationSchema: formSchema,
});

const forgotPasswordMutation = useMutation({
  mutationFn: async (values: ForgotPasswordSchema) => {
    return await authStore.forgotPassword(values);
  },
  onSuccess: (data) => {
    resetForm();
    toast.success(data.message, {
      duration: 3000,
    });
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
const onSubmit = handleSubmit(async (values: ForgotPasswordSchema) => {
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
