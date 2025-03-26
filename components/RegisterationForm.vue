<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/toast/use-toast';
import { useApi } from '@/composables/useApi';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-vue-next';
import { registerSchema } from '@/schemas/auth';
import { AxiosError } from 'axios';

const api = useApi();
const { toast } = useToast();
const isLoading = ref(false);
const showPassword = ref(false);
const serverResponse = ref<unknown>(null);
const formSchema = toTypedSchema(registerSchema);

const { isFieldDirty, handleSubmit, errors, resetForm } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    isLoading.value = true;

    if (!values.userAgent) {
      values.userAgent = navigator.userAgent;
    }

    const response = await api.post('/auth/register', values);

    serverResponse.value = response;

    toast({
      title: 'Registration Successful',
      description: `Welcome to the platform! Response: ${JSON.stringify(response)}`,
      variant: 'default',
      duration: 3000,
    });

    resetForm();
    await navigateTo('/login');
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong';
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    toast({
      title: 'Registration Failed',
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
      <CardTitle class="text-xl"> Create Account </CardTitle>
      <CardDescription> Enter your information to create an account </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="grid gap-4" aria-label="Sign Up Form" autocomplete="off" @submit="onSubmit">
        <!-- Your existing form fields -->
        <div class="grid grid-cols-2 gap-4">
          <FormField
            v-slot="{ componentField }"
            name="firstName"
            class="grid gap-1"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem v-auto-animate>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Salam"
                  v-bind="componentField"
                  :disabled="isLoading"
                  autocomplete="given-name"
                  aria-required="true"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="lastName"
            class="grid gap-1"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem v-auto-animate>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Salam"
                  v-bind="componentField"
                  :disabled="isLoading"
                  autocomplete="family-name"
                  aria-required="true"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <FormField v-slot="{ componentField }" name="phoneNumber" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="+1234567890"
                v-bind="componentField"
                :disabled="isLoading"
                autocomplete="tel"
                aria-required="true"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="salam@example.com"
                v-bind="componentField"
                :disabled="isLoading"
                autocomplete="username"
                aria-required="true"
              />
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

        <FormField
          v-slot="{ componentField }"
          name="confirmPassword"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Confirm Password</FormLabel>
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

        <FormField v-slot="{ componentField }" name="role">
          <FormItem v-auto-animate class="space-y-3">
            <FormLabel>Account Type</FormLabel>
            <FormControl>
              <RadioGroup
                class="flex flex-col space-y-1"
                v-bind="componentField"
                :disabled="isLoading"
              >
                <FormItem class="flex items-center space-y-0 gap-x-3">
                  <FormControl>
                    <RadioGroupItem value="buyer" />
                  </FormControl>
                  <FormLabel class="font-normal">Buyer</FormLabel>
                </FormItem>
                <FormItem class="flex items-center space-y-0 gap-x-3">
                  <FormControl>
                    <RadioGroupItem value="seller" />
                  </FormControl>
                  <FormLabel class="font-normal">Seller</FormLabel>
                </FormItem>
              </RadioGroup>
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
            Creating Account...
          </span>
          <span v-else>Create Account</span>
        </Button>
      </form>
      <!-- Display server response for debugging -->
      <div v-if="serverResponse" class="mt-4 text-sm">
        Server Response: {{ JSON.stringify(serverResponse) }}
      </div>
      <div class="mt-4 text-center text-sm">
        Already have an account?
        <NuxtLink to="/login" class="underline"> Login in </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
