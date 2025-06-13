import { createApi } from '@/lib/api';

export function useApi() {
  const config = useRuntimeConfig();
  return createApi(`${config.public.apiBase}/api`);
}
