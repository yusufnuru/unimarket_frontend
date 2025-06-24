import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500).optional(),
  address: z.string().min(20).max(500),
  requestMessage: z
    .string()
    .min(30)
    .max(500, 'Request message must be between 30 and 500 characters')
    .nonempty('Request message is required'),
});

export const createStoreRequestSchema = z.object({
  requestMessage: z
    .string()
    .min(30)
    .max(500, 'Request message must be between 30 and 500 characters')
    .nonempty('Request message is required'),
});

export const updateStoreSchema = z
  .object({
    name: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    address: z.string().max(500).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0, // Ensure at least one field is present
    {
      message: 'At least one field (name, description, or address) must be provided',
      path: [],
    },
  );

export const storeRequestParamSchema = z
  .string()
  .uuid('Invalid store request id')
  .nonempty('Store Request id is required');

export interface StoreRequest {
  id: string;
  storeId: string;
  requestMessage: string;
  requestStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  store: {
    id: string;
    storeName: string;
  };
}

export interface StoreWarnings {
  id: string;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  productId: string;
  reason: string;
  actionTaken: 'product_deleted' | 'product_hidden';
  store: {
    id: string;
    storeName: string;
  };
  product: {
    id: string;
    storeId: string;
    productName: string;
  };
}

export interface StoreReports {
  reports: {
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    buyerId: string;
    productId: string;
    reason: 'spam' | 'scam' | 'offensive' | 'other';
  };
  product: {
    id: string;
    storeId: string;
    productName: string;
  };
}

export const rejectRequestSchema = z.object({
  rejectionReason: z
    .string()
    .min(30)
    .max(500, 'Rejection reason must be between 30 and 500 characters'),
});

export const createStoreWarningSchema = z.object({
  actionTaken: z.enum(['product_deleted', 'product_hidden'], {
    errorMap: () => ({ message: 'Invalid action taken' }),
  }),

  reason: z
    .string()
    .min(30, 'Reason must be at least 30 characters long')
    .max(255, 'Reason must be at most 255 characters long')
    .nonempty('Reason is required'),
});

export type CreateStoreWarningSchema = z.infer<typeof createStoreWarningSchema>;
export type RejectRequestSchema = z.infer<typeof rejectRequestSchema>;
export type StoreRequestParamSchema = z.infer<typeof storeRequestParamSchema>;
export type CreateStoreSchema = z.infer<typeof createStoreSchema>;
export type UpdateStoreSchema = z.infer<typeof updateStoreSchema>;
export type CreateStoreRequestSchema = z.infer<typeof createStoreRequestSchema>;
