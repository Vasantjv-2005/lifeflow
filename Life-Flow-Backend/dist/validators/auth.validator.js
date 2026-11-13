"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for user registration.
 */
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    email: zod_1.z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .max(100, "Email cannot exceed 100 characters")
        .transform((value) => value.toLowerCase()),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters"),
});
/**
 * Validation schema for user login.
 */
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .max(100, "Email cannot exceed 100 characters")
        .transform((value) => value.toLowerCase()),
    password: zod_1.z
        .string()
        .min(1, "Password is required")
        .max(100, "Password cannot exceed 100 characters"),
});
