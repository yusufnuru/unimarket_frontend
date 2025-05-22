<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Heart, Send, LayoutGrid, Settings } from 'lucide-vue-next';
import AppSidebar from '@/components/AppSidebar.vue';

const buyerSidebaritems = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Categories',
    url: '/categories',
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
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];
</script>

<template>
  <SidebarProvider>
    <AppSidebar title="Unimarket" :items="buyerSidebaritems" />
    <SidebarTrigger />
    <slot />
  </SidebarProvider>
</template>
