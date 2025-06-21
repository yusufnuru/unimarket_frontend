import type { ColumnDef } from '@tanstack/vue-table';
import type { StoreRequest } from '@/types/store';
import { Button } from '@/components/ui/button';
import { RouterLink } from 'vue-router';
import ActionButton from '@/components/ActionButton.vue';

export const storeRequestColumns: ColumnDef<StoreRequest>[] = [
  {
    accessorKey: 'store.storeName',
    header: () => h('div', { class: 'text-left font-semibold' }, 'Store Name'),
    cell: ({ row }) => {
      const store = row.original.store;
      return h('div', { class: 'text-left' }, store.storeName);
    },
  },
  {
    accessorKey: 'requestMessage',
    header: () => h('div', { class: 'text-left font-semibold' }, 'Request Message'),
    cell: ({ row }) => {
      const requestMessage: string = row.getValue('requestMessage');
      return h('div', { class: 'text-left text-wrap w-11/12 min-w-80' }, requestMessage);
    },
  },
  {
    accessorKey: 'requestStatus',
    header: () => h('div', {}, 'Status'),
    cell: ({ row }) => {
      const status: string = row.getValue('requestStatus');
      const colorClass = {
        pending: 'text-yellow-600',
        approved: 'text-green-600',
        rejected: 'text-red-600',
      }[status];

      return h('div', { class: `font-medium ${colorClass}` }, status);
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
  {
    id: 'actions',
    header: () => h('div', { class: 'font-semibold' }, 'Actions'),
    cell: ({ row }) => {
      const request = row.original;

      // Create NuxtLink as a button
      return h(ActionButton, { requestId: request.id });
    },
  },
];
