import { z } from 'zod';

const phoneRegex = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/);

export const verificationCodeSchema = z.string().length(36);

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }).trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(128, { message: 'Password too long' }),
});

export const registerSchema = loginSchema
  .extend({
    phoneNumber: z
      .string()
      .regex(phoneRegex, { message: 'Please enter a valid phone number' })
      .trim(),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(),
    role: z.enum(['buyer', 'seller']),
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }).max(50),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }).max(50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type loginSchema = z.infer<typeof loginSchema>;
export type registerSchema = z.infer<typeof registerSchema>;
export type verificationCodeSchema = z.infer<typeof verificationCodeSchema>;
