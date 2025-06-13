import { defineStore } from 'pinia';
export const useAdminStore = defineStore('admin', {
  getters: {
    adminId: () => {
      const authStore = useAuthStore();
      return authStore.role === 'admin' ? authStore.profileId : null;
    },
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
