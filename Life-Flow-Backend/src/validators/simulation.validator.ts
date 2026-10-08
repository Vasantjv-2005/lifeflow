import { z } from "zod";

/**
 * Validation schema for a simulation node.
 */
const simulationNodeSchema = z.object({
    nodeId: z
        .string()
        .trim()
        .min(1, "Node ID is required"),

    type: z.enum(["start", "decision", "action", "outcome"]),

    title: z
        .string()
        .trim()
        .min(1, "Node title cannot be empty")
        .max(200, "Node title cannot exceed 200 characters"),

    description: z
        .string()
        .trim()
        .max(1000, "Node description cannot exceed 1000 characters")
        .optional(),

    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
});

/**
 * Validation schema for a simulation edge.
 */
const simulationEdgeSchema = z.object({
    edgeId: z
        .string()
        .trim()
        .min(1, "Edge ID is required"),

    source: z
        .string()
        .trim()
        .min(1, "Source node is required"),

    target: z
        .string()
        .trim()
        .min(1, "Target node is required"),

    label: z
        .string()
        .trim()
        .max(200, "Edge label cannot exceed 200 characters")
        .optional(),

    condition: z
        .string()
        .trim()
        .max(500, "Edge condition cannot exceed 500 characters")
        .optional(),
});

/**
 * Validation schema for creating a simulation.
 */
export const createSimulationSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Simulation title must be at least 2 characters")
        .max(100, "Simulation title cannot exceed 100 characters"),

    description: z
        .string()
        .trim()
        .max(1000, "Simulation description cannot exceed 1000 characters")
        .optional(),

    category: z
        .string()
        .trim()
        .min(1, "Simulation category is required")
        .max(50, "Simulation category cannot exceed 50 characters"),

    goal: z
        .string()
        .trim()
        .min(2, "Simulation goal must be at least 2 characters")
        .max(500, "Simulation goal cannot exceed 500 characters"),

    status: z
        .enum(["draft", "active", "completed"])
        .optional(),

    nodes: z
        .array(simulationNodeSchema)
        .optional(),

    edges: z
        .array(simulationEdgeSchema)
        .optional(),
});

/**
 * Validation schema for updating a simulation.
 *
 * All fields are optional because an update can modify
 * only selected properties.
 */
export const updateSimulationSchema =
    createSimulationSchema.partial();

/**
 * TypeScript type for creating a simulation.
 */
export type CreateSimulationInput = z.infer<
    typeof createSimulationSchema
>;

/**
 * TypeScript type for updating a simulation.
 */
export type UpdateSimulationInput = z.infer<
    typeof updateSimulationSchema
>;

/**
 * Export the node and edge schemas for reuse.
 */
export {
    simulationNodeSchema,
    simulationEdgeSchema,
};