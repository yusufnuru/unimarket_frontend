<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Store, ShoppingBasket, Send, Settings, LayoutDashboard } from 'lucide-vue-next';
import AppSidebar from '@/components/AppSidebar.vue';

const sellerSidebarItems = [
  {
    title: 'Dashboard',
    url: '/seller/dashboard/',
    icon: LayoutDashboard,
  },
  {
    title: 'Store',
    url: '/seller/store/',
    icon: Store,
  },
  {
    title: 'Products',
    url: '/seller/product/',
    icon: ShoppingBasket,
  },
  {
    title: 'Messages',
    url: '/seller/message/',
    icon: Send,
  },
  // {
  //   title: 'Settings',
  //   url: '/seller/setting/',
  //   icon: Settings,
  // },
];
</script>

<template>
  <SidebarProvider>
    <ClientOnly>
      <AppSidebar title="Seller DashBoard" :items="sellerSidebarItems" />
    </ClientOnly>
    <SidebarTrigger />
    <slot />
  </SidebarProvider>
</template>
