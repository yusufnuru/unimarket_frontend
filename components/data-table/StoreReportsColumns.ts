import type { ColumnDef } from '@tanstack/vue-table';
import type { StoreReports } from '@/types/store';
import { h } from 'vue';
import { RouterLink } from 'vue-router';

export const storeReportColumns: ColumnDef<StoreReports>[] = [
  {
    accessorKey: 'reports',
    header: () => h('div', { class: 'text-left font-semibold' }, 'Id'),
    cell: ({ row }) => {
      const report = row.original.reports;
      return h('div', { class: 'text-left' }, report.id);
    },
  },
  {
    accessorKey: 'product',
    header: () => h('div', { class: 'text-left font-semibold' }, 'Product'),
    cell: ({ row }) => {
      const product = row.original.product;
      return h(
        RouterLink,
        {
          to: `/admin/product/${product.id}`,
          class: 'px-2 py-1 rounded hover:bg-primary/90 hover:text-secondary',
        },
        { default: () => product.productName },
      );
    },
  },
  {
    accessorKey: 'reports',
    header: () => h('div', { class: 'text-left font-semibold' }, 'Description'),
    cell: ({ row }) => {
      const report = row.original.reports;
      return h('div', { class: 'text-left text-wrap w-11/12 min-w-80' }, report.description);
    },
  },
  {
    accessorKey: 'reports',
    header: () => h('div', {}, 'Reason'),
    cell: ({ row }) => {
      const report = row.original.reports;
      return h('div', { class: 'text-left' }, report.reason);
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => h('div', { class: 'not-sm:hidden' }, 'Created At'),
    cell: ({ row }) => {
      const date = new Date(row.original.reports.createdAt);
      return h('div', { class: 'not-sm:hidden' }, date.toLocaleDateString());
    },
  },
];
