import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/i, 'Use letters, numbers, hyphens or underscores');

export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128)
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({ token: z.string().min(10).max(200) });

export const onboardingSchema = z.object({
  experienceLevel: z.enum(['none', 'beginner', 'intermediate', 'advanced']),
  interests: z.array(z.string().max(60)).max(12).default([]),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  username: usernameSchema.optional(),
  avatarUrl: z.string().url().max(1000).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  profileVisibility: z.enum(['public', 'private']).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
