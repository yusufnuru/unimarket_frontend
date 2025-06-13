<script lang="ts" setup>
import { useCategory } from '@/composables/useCategory';

const { loading, error, errorMessage, categories } = useCategory();
</script>
<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Categories</h1>
    <!-- Error or Loading -->
    <div v-if="loading" class="text-gray-500">Loading categories...</div>
    <div v-else-if="error" class="text-red-500">Error: {{ errorMessage }}</div>

    <!-- Category Grid -->
    <div
      v-else-if="categories.length"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/category/${category.id}`"
        class="bg-white shadow rounded-xl p-4 hover:shadow-lg transition duration-300"
      >
        <NuxtLink :to="`/category/${category.id}`" class="w-full h-full">
          <h2 class="text-lg font-semibold text-gray-800">{{ category.name }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ category.description }}</p>
          <p class="text-xs text-gray-400 mt-2">
            Products: <span class="font-medium">{{ category.productCount }}</span>
          </p>
        </NuxtLink>
      </NuxtLink>
    </div>
  </div>
</template>
