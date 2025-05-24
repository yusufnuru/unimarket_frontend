<script setup lang="ts">
import { Input } from '@/components/ui/input';

defineProps<{
  sortValue: string;
  minPriceValue: string;
  maxPriceValue: string;
  searchValue: string;
  handleSortChange: (value: SortOption) => void;
  resetFilters: () => void;
}>();

const emit = defineEmits<{
  updateSearch: [value: string];
  updateMinPrice: [value: string];
  updateMaxPrice: [value: string];
}>();
</script>

<template>
  <div class="flex flex-col sticky top-0 z-10 xl:flex-row gap-4">
    <div class="flex flex-col sm:flex-row gap-4 w-full :flex-1">
      <!-- Search Input -->
      <div class="relative w-full sm:w-1/2 max-w-2xs">
        <Input
          :model-value="searchValue"
          type="text"
          placeholder="Search products..."
          class="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Search products"
          @update:model-value="(val) => emit('updateSearch', val as string)"
        />
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
      </div>

      <!-- Sort Select -->
      <div class="w-full sm:w-48">
        <Select
          :model-value="sortValue"
          @update:model-value="(val) => handleSortChange(val as SortOption)"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="latest">Sort by: Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Price Filter & Reset -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <Input
          :model-value="minPriceValue"
          type="number"
          placeholder="Min price"
          class="w-full sm:w-28"
          min="0"
          step="0.01"
          @update:model-value="(val) => emit('updateMinPrice', val as string)"
        />
        <span class="text-muted-foreground">to</span>
        <Input
          :model-value="maxPriceValue"
          type="number"
          placeholder="Max price"
          class="w-full sm:w-28"
          min="0"
          step="0.01"
          @update:model-value="(val) => emit('updateMaxPrice', val as string)"
        />
      </div>
      <Button variant="outline" size="sm" class="whitespace-nowrap" @click="resetFilters"
        >Reset Filters</Button
      >
    </div>
  </div>
</template>
