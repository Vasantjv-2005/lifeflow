import { z } from "zod";

/**
 * Validation schema for incoming AI scenario generation requests.
 */
export const generateScenariosRequestSchema = z.object({
    decisionTitle: z
        .string()
        .trim()
        .min(1, "Decision title is required and cannot be empty")
        .max(200, "Decision title cannot exceed 200 characters"),

    category: z
        .string()
        .trim()
        .min(1, "Category is required and cannot be empty")
        .max(100, "Category cannot exceed 100 characters"),

    goal: z
        .string()
        .trim()
        .min(1, "Goal is required and cannot be empty")
        .max(1000, "Goal cannot exceed 1000 characters"),

    currentSituation: z
        .string()
        .trim()
        .max(2000, "Current situation cannot exceed 2000 characters")
        .optional(),

    timeAvailable: z
        .number()
        .min(0, "Time available must be a valid non-negative number")
        .optional(),

    budget: z
        .number()
        .min(0, "Budget must be a valid non-negative number")
        .optional(),

    skills: z
        .string()
        .trim()
        .max(2000, "Skills cannot exceed 2000 characters")
        .optional(),

    experience: z
        .string()
        .trim()
        .max(2000, "Experience cannot exceed 2000 characters")
        .optional(),

    challenges: z
        .string()
        .trim()
        .max(2000, "Challenges cannot exceed 2000 characters")
        .optional(),

    additionalContext: z
        .string()
        .trim()
        .max(2000, "Additional context cannot exceed 2000 characters")
        .optional(),
});

export type GenerateScenariosRequestInput = z.infer<
    typeof generateScenariosRequestSchema
>;
