<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Heart, Send, LayoutGrid, Settings } from 'lucide-vue-next';
import AppSidebar from '@/components/AppSidebar.vue';

const buyerSidebarItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Categories',
    url: '/category',
    icon: LayoutGrid,
  },
  {
    title: 'Messages',
    url: '/message',
    icon: Send,
  },
  {
    title: 'Wishlists',
    url: '/wishlist',
    icon: Heart,
  },
  // {
  //   title: 'Settings',
  //   url: '/settings',
  //   icon: Settings,
  // },
];
</script>

<template>
  <SidebarProvider>
    <ClientOnly>
      <AppSidebar title="UniMarket" :items="buyerSidebarItems" />
    </ClientOnly>
    <SidebarTrigger />
    <slot />
  </SidebarProvider>
</template>
