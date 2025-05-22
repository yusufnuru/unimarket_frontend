import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500).optional(),
  address: z.string().min(1).max(500),
  requestMessage: z
    .string()
    .min(30)
    .max(500, 'Request message must be between 30 and 500 characters')
    .nonempty('Request message is required'),
});

export const updateStoreSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(500).optional(),
    address: z.string().min(1).max(500).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0, // Ensure at least one field is present
    {
      message: 'At least one field (name, description, or address) must be provided',
      path: [], // Empty path applies to the whole object
    },
  );

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().uuid('Invalid category id').nonempty('Category id is required'),
  description: z.string().min(1).max(500).optional(),
  price: z
    .string()
    .min(0)
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Price must be a valid number with up to 2 decimal places',
      path: ['price'],
    }),
  quantity: z
    .string()
    .refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
      message: 'Quantity must be a valid positive integer',
      path: ['quantity'],
    })
    .transform((val) => parseInt(val.trim(), 10)),
});

export const addImageSchema = z.any().superRefine(async (files: Express.Multer.File[], ctx) => {
  if (!files || files.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one image file is required.',
      path: ['images'], // top-level key
    });
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(file.buffer);
    const filePath = ['images', i]; // helps identify which file index had a problem

    const mimeCheck = await validateBufferMIMEType(buffer, {
      allowMimeTypes: ACCEPTED_IMAGE_MIME_TYPES,
    });

    if (!mimeCheck.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File "${file.originalname}" has an unsupported format or is corrupted.`,
        path: filePath,
      });
      continue;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File "${file.originalname}" exceeds the maximum size of 5MB.`,
        path: filePath,
      });
    }
  }
});

export type createStoreSchema = z.infer<typeof createStoreSchema>;
export type updateStoreSchema = z.infer<typeof updateStoreSchema>;
