<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

defineProps<{
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  getPageNumbers: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;
}>();
</script>

<template>
  <Pagination class="mt-4" :items-per-page="itemsPerPage" :total="totalItems">
    <PaginationContent>
      <PaginationPrevious @click="goToPreviousPage" />

      <PaginationItem v-if="currentPage > 3" :value="1" @click="goToFirstPage">
        <PaginationFirst />
      </PaginationItem>

      <PaginationEllipsis v-if="currentPage > 4" />

      <template v-for="pageNum in getPageNumbers()" :key="pageNum">
        <PaginationItem
          :value="Number(pageNum)"
          :is-active="pageNum === currentPage"
          @click="goToPage(Number(pageNum))"
        >
          {{ pageNum }}
        </PaginationItem>
      </template>

      <PaginationEllipsis v-if="currentPage < totalPages - 3" />

      <PaginationItem v-if="currentPage < totalPages - 2" :value="totalPages" @click="goToLastPage">
        <PaginationLast />
      </PaginationItem>

      <PaginationNext @click="goToNextPage" />
    </PaginationContent>
  </Pagination>

  <div v-if="totalItems > 0" class="text-center text-sm text-muted-foreground mt-4">
    Showing {{ (currentPage - 1) * itemsPerPage + 1 }} -
    {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} items
  </div>
</template>
