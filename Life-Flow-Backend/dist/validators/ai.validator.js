"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScenariosRequestSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for incoming AI scenario generation requests.
 */
exports.generateScenariosRequestSchema = zod_1.z.object({
    decisionTitle: zod_1.z
        .string()
        .trim()
        .min(1, "Decision title is required and cannot be empty")
        .max(200, "Decision title cannot exceed 200 characters"),
    category: zod_1.z
        .string()
        .trim()
        .min(1, "Category is required and cannot be empty")
        .max(100, "Category cannot exceed 100 characters"),
    goal: zod_1.z
        .string()
        .trim()
        .min(1, "Goal is required and cannot be empty")
        .max(1000, "Goal cannot exceed 1000 characters"),
    currentSituation: zod_1.z
        .string()
        .trim()
        .max(2000, "Current situation cannot exceed 2000 characters")
        .optional(),
    timeAvailable: zod_1.z
        .number()
        .min(0, "Time available must be a valid non-negative number")
        .optional(),
    budget: zod_1.z
        .number()
        .min(0, "Budget must be a valid non-negative number")
        .optional(),
    additionalContext: zod_1.z
        .string()
        .trim()
        .max(2000, "Additional context cannot exceed 2000 characters")
        .optional(),
});
