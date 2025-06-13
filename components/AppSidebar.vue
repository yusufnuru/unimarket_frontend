<script setup lang="ts">
import { Sidebar, SidebarContent, SidebarGroup } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/authStore';
import { LogOut } from 'lucide-vue-next';

const authStore = useAuthStore();

defineProps<{
  title?: string;
  items: {
    title: string;
    url: string;
    icon: Component;
  }[];
}>();

const footerItems = [
  {
    title: 'Logout',
    url: '/logout',
    icon: LogOut,
  },
];

const logout = async () => {
  await authStore.logout();
  await nextTick();
  await navigateTo('/login');
};
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel class="text-xl sm:text-2xl font-semibold text-foreground"
          >UniMarket</SidebarGroupLabel
        >
        <SidebarGroupContent class="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span class="text-lg">{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarGroupContent class="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem v-for="item in footerItems" :key="item.title">
            <SidebarMenuButton as-child>
              <NuxtLink @click="logout">
                <component :is="item.icon" />
                <span class="text-lg">{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarFooter>
  </Sidebar>
</template>
