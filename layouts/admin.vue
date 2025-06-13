<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Settings,
  LayoutDashboard,
  Store,
  ShoppingBasket,
  MessageCircleWarning,
  ClipboardMinus,
  GitPullRequestDraft,
} from 'lucide-vue-next';
import AppSidebar from '@/components/AppSidebar.vue';

const AdminSidebarItems = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard/',
    icon: LayoutDashboard,
  },
  {
    title: 'Stores',
    url: '/admin/store/',
    icon: Store,
  },
  {
    title: 'Products',
    url: '/admin/product/',
    icon: ShoppingBasket,
  },
  {
    title: 'Requests',
    url: '/admin/request/',
    icon: GitPullRequestDraft,
  },
  {
    title: 'Reports',
    url: '/admin/report/',
    icon: ClipboardMinus,
  },
  {
    title: 'Warnings',
    url: '/admin/warning/',
    icon: MessageCircleWarning,
  },
  {
    title: 'Settings',
    url: '/admin/setting/',
    icon: Settings,
  },
];
</script>

<template>
  <SidebarProvider>
    <AppSidebar :items="AdminSidebarItems" />
    <SidebarTrigger />
    <slot />
  </SidebarProvider>
</template>
