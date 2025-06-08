export default defineNuxtRouteMiddleware(async (to) => {
  const router = useRouter();
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return router.push('/login');
  }

  const requiredRoles = to.meta.roles as string[] | undefined;

  if (requiredRoles && !requiredRoles.includes(authStore.role as string)) {
    return router.push('/unauthorized');
  }
});
