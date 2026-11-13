"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarioOutcomeSchema = exports.scenarioStepSchema = exports.updateScenarioSchema = exports.createScenarioSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for a scenario step.
 */
const scenarioStepSchema = zod_1.z.object({
    stepNumber: zod_1.z
        .number()
        .int("Step number must be an integer")
        .min(1, "Step number must be at least 1"),
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Step title cannot be empty")
        .max(200, "Step title cannot exceed 200 characters"),
    description: zod_1.z
        .string()
        .trim()
        .min(1, "Step description cannot be empty")
        .max(1000, "Step description cannot exceed 1000 characters"),
    timeframe: zod_1.z
        .string()
        .trim()
        .max(100, "Timeframe cannot exceed 100 characters")
        .optional(),
});
exports.scenarioStepSchema = scenarioStepSchema;
/**
 * Validation schema for a scenario outcome.
 */
const scenarioOutcomeSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Outcome title cannot be empty")
        .max(200, "Outcome title cannot exceed 200 characters"),
    description: zod_1.z
        .string()
        .trim()
        .min(1, "Outcome description cannot be empty")
        .max(1000, "Outcome description cannot exceed 1000 characters"),
    probability: zod_1.z
        .number()
        .min(0, "Probability cannot be less than 0")
        .max(100, "Probability cannot be greater than 100")
        .optional(),
    impact: zod_1.z.enum(["low", "medium", "high"]),
});
exports.scenarioOutcomeSchema = scenarioOutcomeSchema;
/**
 * Validation schema for creating a scenario.
 */
exports.createScenarioSchema = zod_1.z.object({
    simulationId: zod_1.z
        .string()
        .trim()
        .min(1, "Simulation ID is required"),
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Scenario name must be at least 2 characters")
        .max(100, "Scenario name cannot exceed 100 characters"),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "Scenario description cannot exceed 1000 characters")
        .optional(),
    type: zod_1.z
        .enum([
        "optimistic",
        "realistic",
        "pessimistic",
        "custom",
    ])
        .optional(),
    score: zod_1.z
        .number()
        .min(0, "Score cannot be less than 0")
        .max(100, "Score cannot be greater than 100")
        .optional(),
    riskLevel: zod_1.z
        .enum(["low", "medium", "high"])
        .optional(),
    steps: zod_1.z
        .array(scenarioStepSchema)
        .optional(),
    outcomes: zod_1.z
        .array(scenarioOutcomeSchema)
        .optional(),
    isSelected: zod_1.z
        .boolean()
        .optional(),
});
/**
 * Validation schema for updating a scenario.
 *
 * All fields are optional because an update may modify
 * only selected properties.
 */
exports.updateScenarioSchema = exports.createScenarioSchema.partial();
