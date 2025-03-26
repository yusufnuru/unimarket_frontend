export default defineNuxtRouteMiddleware(async (to) => {
  console.log('Middleware triggered');
  console.log('Route:', to.path);

  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  const requiredRoles = to.meta.roles as string[] | undefined;

  if (requiredRoles && !requiredRoles.includes(authStore.role as string)) {
    return navigateTo('/unauthorized');
  }
});
