import { z } from 'zod';

const phoneRegex = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/);

export const verificationCodeSchema = z
  .string()
  .uuid('Invalid verification code')
  .nonempty('Verification code is required');
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email-verify' }).trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(255, { message: 'Password too long' }),
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

export const forgotPasswordSchema = z.object({
  email: z.string().email().min(3).max(255),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(255, { message: 'Password too long' }),
  verificationCode: verificationCodeSchema,
});
export type Role = 'buyer' | 'seller' | 'admin';
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type VerificationCodeSchema = z.infer<typeof verificationCodeSchema>;
export interface AuthResponseMessage {
  message: string;
}
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
