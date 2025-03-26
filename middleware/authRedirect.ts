import { toast } from '@/components/ui/toast';
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Only apply this logic to signup and signin routes
  if (to.path === '/signup' || to.path === '/login') {
    try {
      // Check authentication status first
      if (!authStore.isAuthenticated) {
        return; // Allow access to signup/login pages if not authenticated
      }

      // Show toast only when redirecting
      toast({
        title: 'You are already logged in',
        variant: 'default',
        duration: 3000,
      });

      // Immediate redirect instead of setTimeout
      if (authStore.role === 'admin') {
        setTimeout(() => {
          void navigateTo('/dashboard/admin');
        }, 1000);
      } else if (authStore.role === 'seller') {
        setTimeout(() => {
          void navigateTo('/dashboard/seller');
        }, 1000);
      } else if (authStore.role === 'buyer') {
        setTimeout(() => {
          void navigateTo('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Optionally redirect to an error page
      return navigateTo('/error');
    }
  }
  // Continue to the requested route if not signup/login
});
