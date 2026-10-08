import { z } from "zod";

/**
 * Validation schema for a scenario step.
 */
const scenarioStepSchema = z.object({
    stepNumber: z
        .number()
        .int("Step number must be an integer")
        .min(1, "Step number must be at least 1"),

    title: z
        .string()
        .trim()
        .min(1, "Step title cannot be empty")
        .max(200, "Step title cannot exceed 200 characters"),

    description: z
        .string()
        .trim()
        .min(1, "Step description cannot be empty")
        .max(1000, "Step description cannot exceed 1000 characters"),

    timeframe: z
        .string()
        .trim()
        .max(100, "Timeframe cannot exceed 100 characters")
        .optional(),
});

/**
 * Validation schema for a scenario outcome.
 */
const scenarioOutcomeSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Outcome title cannot be empty")
        .max(200, "Outcome title cannot exceed 200 characters"),

    description: z
        .string()
        .trim()
        .min(1, "Outcome description cannot be empty")
        .max(1000, "Outcome description cannot exceed 1000 characters"),

    probability: z
        .number()
        .min(0, "Probability cannot be less than 0")
        .max(100, "Probability cannot be greater than 100")
        .optional(),

    impact: z.enum(["low", "medium", "high"]),
});

/**
 * Validation schema for creating a scenario.
 */
export const createScenarioSchema = z.object({
    simulationId: z
        .string()
        .trim()
        .min(1, "Simulation ID is required"),

    name: z
        .string()
        .trim()
        .min(2, "Scenario name must be at least 2 characters")
        .max(100, "Scenario name cannot exceed 100 characters"),

    description: z
        .string()
        .trim()
        .max(1000, "Scenario description cannot exceed 1000 characters")
        .optional(),

    type: z
        .enum([
            "optimistic",
            "realistic",
            "pessimistic",
            "custom",
        ])
        .optional(),

    score: z
        .number()
        .min(0, "Score cannot be less than 0")
        .max(100, "Score cannot be greater than 100")
        .optional(),

    riskLevel: z
        .enum(["low", "medium", "high"])
        .optional(),

    steps: z
        .array(scenarioStepSchema)
        .optional(),

    outcomes: z
        .array(scenarioOutcomeSchema)
        .optional(),

    isSelected: z
        .boolean()
        .optional(),
});

/**
 * Validation schema for updating a scenario.
 *
 * All fields are optional because an update may modify
 * only selected properties.
 */
export const updateScenarioSchema =
    createScenarioSchema.partial();

/**
 * TypeScript type for creating a scenario.
 */
export type CreateScenarioInput = z.infer<
    typeof createScenarioSchema
>;

/**
 * TypeScript type for updating a scenario.
 */
export type UpdateScenarioInput = z.infer<
    typeof updateScenarioSchema
>;

/**
 * Export nested schemas for reuse.
 */
export {
    scenarioStepSchema,
    scenarioOutcomeSchema,
};