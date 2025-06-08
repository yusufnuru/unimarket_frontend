import { toast } from 'vue-sonner';
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const router = useRouter();
  if (to.path === '/register' || to.path === '/login') {
    try {
      if (!authStore.isAuthenticated) {
        return;
      }

      // Show toast only when redirecting
      setTimeout(() => {
        toast('You are already logged in. Redirecting...');
      }, 3000);

      // Immediate redirect instead of setTimeout
      const redirectPath =
        authStore.role === 'admin'
          ? '/admin/dashboard'
          : authStore.role === 'seller'
            ? '/seller/dashboard'
            : '/';
      setTimeout(async () => {
        await router.push(redirectPath);
      }, 3000);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return router.push('/error');
    }
  }
});
