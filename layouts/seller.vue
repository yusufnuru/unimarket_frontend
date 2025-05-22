<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Store, ShoppingBasket, Send, Settings, LayoutDashboard } from 'lucide-vue-next';
import AppSidebar from '@/components/AppSidebar.vue';

const buyerSidebaritems = [
  {
    title: 'Dashboard',
    url: '/seller/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Store',
    url: '/seller/store',
    icon: Store,
  },
  {
    title: 'Products',
    url: '/seller/products',
    icon: ShoppingBasket,
  },
  {
    title: 'Messages',
    url: '/seller/message/',
    icon: Send,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];
</script>

<template>
  <SidebarProvider>
    <AppSidebar title="Seller DashBoard" :items="buyerSidebaritems" />
    <SidebarTrigger />
    <slot />
  </SidebarProvider>
</template>
