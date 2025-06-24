import type { ColumnDef } from '@tanstack/vue-table';
import type { StoreWarnings } from '@/types/store';
import { h } from 'vue';
import { RouterLink } from 'vue-router';

export const storeWarningColumns: ColumnDef<StoreWarnings>[] = [
  {
    accessorKey: 'store',
    header: () => h('div', { class: 'text-left font-semibold' }, 'Store Id'),
    cell: ({ row }) => {
      const warningId = row.original.store.id;
      return h('div', { class: 'text-left' }, warningId);
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
    accessorKey: 'reason',
    header: () => h('div', { class: 'text-left font-semibold' }, 'Reason'),
    cell: ({ row }) => {
      const reason = row.original.reason;
      return h('div', { class: 'text-left text-wrap w-11/12 min-w-80' }, reason);
    },
  },
  {
    accessorKey: 'actionTaken',
    header: () => h('div', {}, 'Action'),
    cell: ({ row }) => {
      const actionTaken = row.original.actionTaken;
      return h('div', { class: 'text-left' }, actionTaken);
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => h('div', { class: 'not-sm:hidden' }, 'Created At'),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt')).toLocaleDateString();
      return h('div', { class: 'not-sm:hidden' }, date);
    },
  },
];
