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

export interface StoreRequest {
  id: number;
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

export type CreateStoreSchema = z.infer<typeof createStoreSchema>;
export type UpdateStoreSchema = z.infer<typeof updateStoreSchema>;
export type CreateStoreRequestSchema = z.infer<typeof createStoreRequestSchema>;
