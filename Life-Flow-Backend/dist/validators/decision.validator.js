"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionOptionSchema = exports.decisionFactorSchema = exports.updateDecisionSchema = exports.createDecisionSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for a decision factor.
 */
const decisionFactorSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "Factor name is required")
        .max(100, "Factor name cannot exceed 100 characters"),
    description: zod_1.z
        .string()
        .trim()
        .max(500, "Factor description cannot exceed 500 characters")
        .optional(),
    importance: zod_1.z.enum(["low", "medium", "high"]),
});
exports.decisionFactorSchema = decisionFactorSchema;
/**
 * Validation schema for a decision option.
 */
const decisionOptionSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "Option name is required")
        .max(100, "Option name cannot exceed 100 characters"),
    description: zod_1.z
        .string()
        .trim()
        .max(500, "Option description cannot exceed 500 characters")
        .optional(),
    pros: zod_1.z
        .array(zod_1.z
        .string()
        .trim()
        .min(1, "Pros cannot contain an empty value")
        .max(500, "Each pro cannot exceed 500 characters"))
        .optional(),
    cons: zod_1.z
        .array(zod_1.z
        .string()
        .trim()
        .min(1, "Cons cannot contain an empty value")
        .max(500, "Each con cannot exceed 500 characters"))
        .optional(),
});
exports.decisionOptionSchema = decisionOptionSchema;
/**
 * Validation schema for creating a decision.
 */
exports.createDecisionSchema = zod_1.z.object({
    simulationId: zod_1.z
        .string()
        .trim()
        .min(1, "Simulation ID cannot be empty")
        .optional(),
    title: zod_1.z
        .string()
        .trim()
        .min(2, "Decision title must be at least 2 characters")
        .max(150, "Decision title cannot exceed 150 characters"),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "Decision description cannot exceed 1000 characters")
        .optional(),
    category: zod_1.z
        .string()
        .trim()
        .min(1, "Decision category is required")
        .max(50, "Decision category cannot exceed 50 characters"),
    goal: zod_1.z
        .string()
        .trim()
        .min(2, "Decision goal must be at least 2 characters")
        .max(500, "Decision goal cannot exceed 500 characters"),
    currentSituation: zod_1.z
        .string()
        .trim()
        .max(1000, "Current situation cannot exceed 1000 characters")
        .optional(),
    timeAvailable: zod_1.z
        .preprocess((val) => {
        if (val === "" || val === undefined || val === null)
            return undefined;
        if (typeof val === "string") {
            const parsed = Number(val.replace(/[^0-9.-]+/g, ""));
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, zod_1.z.number().min(0, "Time available cannot be negative").optional())
        .optional(),
    budget: zod_1.z
        .preprocess((val) => {
        if (val === "" || val === undefined || val === null)
            return undefined;
        if (typeof val === "string") {
            const parsed = Number(val.replace(/[^0-9.-]+/g, ""));
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, zod_1.z.number().min(0, "Budget cannot be negative").optional())
        .optional(),
    factors: zod_1.z
        .array(decisionFactorSchema)
        .optional(),
    options: zod_1.z
        .array(decisionOptionSchema)
        .optional(),
    status: zod_1.z
        .enum(["draft", "active", "completed"])
        .optional(),
});
/**
 * Validation schema for updating a decision.
 *
 * Every field is optional because an update may modify
 * only selected properties.
 */
exports.updateDecisionSchema = exports.createDecisionSchema.partial();
