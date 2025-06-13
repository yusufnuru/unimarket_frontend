import { type ComputedRef } from 'vue';

export interface PaginationOptions {
  totalPages: ComputedRef<number>;
  currentPage: ComputedRef<number>;
  goToPage: (page: number) => void;
}

export function usePagination({ totalPages, currentPage, goToPage }: PaginationOptions) {
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages.value);
  const goToNextPage = () => goToPage(currentPage.value + 1);
  const goToPreviousPage = () => goToPage(currentPage.value - 1);

  const getPageNumbers = () => {
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];

    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return {
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    getPageNumbers,
  };
}
