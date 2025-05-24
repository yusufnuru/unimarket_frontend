<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div v-for="n in 8" :key="n" class="rounded-lg shadow-md overflow-hidden animate-pulse">
      <div class="h-64 bg-muted"></div>
      <div class="p-4 space-y-4">
        <div class="h-6 bg-muted rounded w-3/4"></div>
        <div class="flex justify-between">
          <div class="h-6 bg-muted rounded w-1/4"></div>
          <div class="h-6 bg-muted rounded w-1/4"></div>
        </div>
        <div class="h-10 bg-muted rounded"></div>
      </div>
    </div>
  </div>
</template>
