import { z } from "zod";

/**
 * Validation schema for a decision factor.
 */
const decisionFactorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Factor name is required")
        .max(100, "Factor name cannot exceed 100 characters"),

    description: z
        .string()
        .trim()
        .max(500, "Factor description cannot exceed 500 characters")
        .optional(),

    importance: z.enum(["low", "medium", "high"]),
});

/**
 * Validation schema for a decision option.
 */
const decisionOptionSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Option name is required")
        .max(100, "Option name cannot exceed 100 characters"),

    description: z
        .string()
        .trim()
        .max(500, "Option description cannot exceed 500 characters")
        .optional(),

    pros: z
        .array(
            z
                .string()
                .trim()
                .min(1, "Pros cannot contain an empty value")
                .max(500, "Each pro cannot exceed 500 characters")
        )
        .optional(),

    cons: z
        .array(
            z
                .string()
                .trim()
                .min(1, "Cons cannot contain an empty value")
                .max(500, "Each con cannot exceed 500 characters")
        )
        .optional(),
});

/**
 * Validation schema for creating a decision.
 */
export const createDecisionSchema = z.object({
    simulationId: z
        .string()
        .trim()
        .min(1, "Simulation ID cannot be empty")
        .optional(),

    title: z
        .string()
        .trim()
        .min(2, "Decision title must be at least 2 characters")
        .max(150, "Decision title cannot exceed 150 characters"),

    description: z
        .string()
        .trim()
        .max(1000, "Decision description cannot exceed 1000 characters")
        .optional(),

    category: z
        .string()
        .trim()
        .min(1, "Decision category is required")
        .max(50, "Decision category cannot exceed 50 characters"),

    goal: z
        .string()
        .trim()
        .min(2, "Decision goal must be at least 2 characters")
        .max(500, "Decision goal cannot exceed 500 characters"),

    currentSituation: z
        .string()
        .trim()
        .max(1000, "Current situation cannot exceed 1000 characters")
        .optional(),

    timeAvailable: z
        .number()
        .min(0, "Time available cannot be negative")
        .optional(),

    budget: z
        .number()
        .min(0, "Budget cannot be negative")
        .optional(),

    factors: z
        .array(decisionFactorSchema)
        .optional(),

    options: z
        .array(decisionOptionSchema)
        .optional(),

    status: z
        .enum(["draft", "active", "completed"])
        .optional(),
});

/**
 * Validation schema for updating a decision.
 *
 * Every field is optional because an update may modify
 * only selected properties.
 */
export const updateDecisionSchema =
    createDecisionSchema.partial();

/**
 * TypeScript type for creating a decision.
 */
export type CreateDecisionInput = z.infer<
    typeof createDecisionSchema
>;

/**
 * TypeScript type for updating a decision.
 */
export type UpdateDecisionInput = z.infer<
    typeof updateDecisionSchema
>;

/**
 * Export nested schemas so they can be reused elsewhere.
 */
export {
    decisionFactorSchema,
    decisionOptionSchema,
};