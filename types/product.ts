import { z } from 'zod';

const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ProductImage {
  id: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  storeId: string;
  productName: string;
  description: string | null;
  categoryId: string;
  price: number;
  visibility?: boolean;
  quantity: number;
  wishlistCount: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}

export interface ProductCategory {
  id: string;
  name: string;
}

const imageSchema = z
  .any()
  .refine((files) => files instanceof FileList || Array.isArray(files), {
    message: 'Invalid image selection',
  })
  .refine(
    (files) => {
      const fileList = files instanceof FileList ? Array.from(files) : files;
      return fileList.every((file: File) => ACCEPTED_IMAGE_MIME_TYPES.includes(file.type));
    },
    { message: 'Only .jpeg, and .png formats are supported.' },
  )
  .refine(
    (files) => {
      const fileList = files instanceof FileList ? Array.from(files) : files;
      return fileList.every((file: File) => file.size <= MAX_IMAGE_SIZE);
    },
    { message: 'Each image must be less than 5MB.' },
  );

export const productParamSchema = z
  .string()
  .uuid({ message: 'Invalid product id' })
  .nonempty({ message: 'Product id is required' });

export const updateProductSchema = z.object({
  name: z.string().max(100).optional(),
  category: z.string().uuid('Invalid category id').optional(),
  description: z.string().max(500).optional(),
  price: z.optional(
    z.coerce.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Price must be a valid number with up to 2 decimal places',
      path: ['price'],
    }),
  ),

  quantity: z.optional(
    z.coerce
      .string()
      .refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
        message: 'Quantity must be a valid positive integer',
        path: ['quantity'],
      })
      .transform((val) => parseInt(val.trim(), 10)),
  ),
  imagesToRemove: z.array(z.string()).optional(),
  newImages: imageSchema.optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  category: z.string().uuid('Invalid category id').nonempty('Category id is required'),
  description: z.string().max(500).optional(),
  price: z.coerce.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
    message: 'Price must be a valid number with up to 2 decimal places',
    path: ['price'],
  }),

  quantity: z.coerce
    .string()
    .refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
      message: 'Quantity must be a valid positive integer',
      path: ['quantity'],
    })
    .transform((val) => parseInt(val.trim(), 10)),
  newImages: imageSchema.optional(),
});

export const productReportSchema = z.object({
  productId: productParamSchema,
  reason: z
    .enum(['spam', 'scam', 'offensive', 'other'], {
      errorMap: () => ({ message: 'Invalid report reason' }),
    })
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(500, 'Description must be less than 500 characters')
    .transform((val) => val.trim()),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type ProductParamSchema = z.infer<typeof productParamSchema>;
export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type ProductReportSchema = z.infer<typeof productReportSchema>;
