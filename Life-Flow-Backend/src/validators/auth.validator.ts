import { z } from "zod";

/**
 * Validation schema for user registration.
 */
export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .max(100, "Email cannot exceed 100 characters")
        .transform((value) => value.toLowerCase()),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters"),
});

/**
 * Validation schema for user login.
 */
export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .max(100, "Email cannot exceed 100 characters")
        .transform((value) => value.toLowerCase()),

    password: z
        .string()
        .min(1, "Password is required")
        .max(100, "Password cannot exceed 100 characters"),
});

/**
 * TypeScript type for registration data.
 */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * TypeScript type for login data.
 */
export type LoginInput = z.infer<typeof loginSchema>;