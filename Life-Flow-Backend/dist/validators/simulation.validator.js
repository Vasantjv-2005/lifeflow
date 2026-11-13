"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationEdgeSchema = exports.simulationNodeSchema = exports.updateSimulationSchema = exports.createSimulationSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for a simulation node.
 */
const simulationNodeSchema = zod_1.z.object({
    nodeId: zod_1.z
        .string()
        .trim()
        .min(1, "Node ID is required"),
    type: zod_1.z.enum(["start", "decision", "action", "outcome"]),
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Node title cannot be empty")
        .max(200, "Node title cannot exceed 200 characters"),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "Node description cannot exceed 1000 characters")
        .optional(),
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
    }),
});
exports.simulationNodeSchema = simulationNodeSchema;
/**
 * Validation schema for a simulation edge.
 */
const simulationEdgeSchema = zod_1.z.object({
    edgeId: zod_1.z
        .string()
        .trim()
        .min(1, "Edge ID is required"),
    source: zod_1.z
        .string()
        .trim()
        .min(1, "Source node is required"),
    target: zod_1.z
        .string()
        .trim()
        .min(1, "Target node is required"),
    label: zod_1.z
        .string()
        .trim()
        .max(200, "Edge label cannot exceed 200 characters")
        .optional(),
    condition: zod_1.z
        .string()
        .trim()
        .max(500, "Edge condition cannot exceed 500 characters")
        .optional(),
});
exports.simulationEdgeSchema = simulationEdgeSchema;
/**
 * Validation schema for creating a simulation.
 */
exports.createSimulationSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(2, "Simulation title must be at least 2 characters")
        .max(100, "Simulation title cannot exceed 100 characters"),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "Simulation description cannot exceed 1000 characters")
        .optional(),
    category: zod_1.z
        .string()
        .trim()
        .min(1, "Simulation category is required")
        .max(50, "Simulation category cannot exceed 50 characters"),
    goal: zod_1.z
        .string()
        .trim()
        .min(2, "Simulation goal must be at least 2 characters")
        .max(500, "Simulation goal cannot exceed 500 characters"),
    status: zod_1.z
        .enum(["draft", "active", "completed"])
        .optional(),
    nodes: zod_1.z
        .array(simulationNodeSchema)
        .optional(),
    edges: zod_1.z
        .array(simulationEdgeSchema)
        .optional(),
});
/**
 * Validation schema for updating a simulation.
 *
 * All fields are optional because an update can modify
 * only selected properties.
 */
exports.updateSimulationSchema = exports.createSimulationSchema.partial();
