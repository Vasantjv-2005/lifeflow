import mongoose from "mongoose";

import Simulation from "../../models/Simulation";
import {
    createSimulationSchema,
    updateSimulationSchema,
} from "../../validators/simulation.validator";
import { AppError } from "../../middleware/error.middleware";
import type { ISimulation } from "../../models/Simulation";
import {
    runSimulation,
    type SimulationEngineOptions,
    type SimulationEngineResult,
} from "./simulation.engine";
import type { SimulationNode, SimulationEdge } from "../../types/simulation.types";

/**
 * Converts validation failures into client-friendly application errors.
 */
const validateInput = <T>(
    schema: { safeParse: (input: unknown) => { success: boolean; data?: T; error?: { issues: Array<{ message: string; path: PropertyKey[] }> } } },
    input: unknown
): T => {
    const result = schema.safeParse(input);

    if (!result.success) {
        const message = result.error?.issues
            .map((issue) => {
                const field = issue.path.map(String).join(".");
                return field ? `${field}: ${issue.message}` : issue.message;
            })
            .join("; ");

        throw new AppError(message || "Invalid request data.", 400);
    }

    return result.data as T;
};

/**
 * Ensures the supplied MongoDB ID has a valid ObjectId format.
 */
const validateSimulationId = (simulationId: string): void => {
    if (!mongoose.Types.ObjectId.isValid(simulationId)) {
        throw new AppError("Invalid simulation ID.", 400);
    }
};

/**
 * Creates a simulation belonging to the authenticated user.
 */
export const createSimulation = async (
    userId: string,
    input: unknown
): Promise<ISimulation> => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("Invalid authenticated user ID.", 401);
    }

    const data = validateInput(
        createSimulationSchema,
        input
    );

    const simulation = await Simulation.create({
        ...data,
        userId,
    });

    return simulation;
};

/**
 * Retrieves all simulations belonging to the authenticated user.
 */
export const getUserSimulations = async (
    userId: string
): Promise<ISimulation[]> => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("Invalid authenticated user ID.", 401);
    }

    return Simulation.find({ userId })
        .sort({ createdAt: -1 })
        .exec();
};

/**
 * Retrieves one simulation only if it belongs to the user.
 */
export const getSimulationById = async (
    userId: string,
    simulationId: string
): Promise<ISimulation> => {
    validateSimulationId(simulationId);

    const simulation = await Simulation.findOne({
        _id: simulationId,
        userId,
    }).exec();

    if (!simulation) {
        throw new AppError("Simulation not found.", 404);
    }

    return simulation;
};

/**
 * Updates a simulation owned by the authenticated user.
 */
export const updateSimulation = async (
    userId: string,
    simulationId: string,
    input: unknown
): Promise<ISimulation> => {
    validateSimulationId(simulationId);

    const data = validateInput(
        updateSimulationSchema,
        input
    );

    const simulation = await Simulation.findOneAndUpdate(
        {
            _id: simulationId,
            userId,
        },
        {
            $set: data,
        },
        {
            new: true,
            runValidators: true,
        }
    ).exec();

    if (!simulation) {
        throw new AppError("Simulation not found.", 404);
    }

    return simulation;
};

/**
 * Deletes a simulation owned by the authenticated user.
 */
export const deleteSimulation = async (
    userId: string,
    simulationId: string
): Promise<void> => {
    validateSimulationId(simulationId);

    const simulation = await Simulation.findOneAndDelete({
        _id: simulationId,
        userId,
    }).exec();

    if (!simulation) {
        throw new AppError("Simulation not found.", 404);
    }
};

/**
 * Executes graph traversal and path discovery on an existing saved simulation.
 */
export const executeSimulation = async (
    userId: string,
    simulationId: string,
    options?: SimulationEngineOptions
): Promise<SimulationEngineResult> => {
    validateSimulationId(simulationId);

    const simulation = await Simulation.findOne({
        _id: simulationId,
        userId,
    }).lean().exec();

    if (!simulation) {
        throw new AppError("Simulation not found.", 404);
    }

    if (!simulation.nodes || simulation.nodes.length === 0) {
        throw new AppError(
            "Simulation contains no nodes. Please add nodes before running the simulation.",
            400
        );
    }

    try {
        const nodes: SimulationNode[] = simulation.nodes.map((node) => ({
            nodeId: node.nodeId,
            type: node.type,
            title: node.title,
            description: node.description,
            position: node.position,
        }));

        const edges: SimulationEdge[] = (simulation.edges || []).map((edge) => ({
            edgeId: edge.edgeId,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            condition: edge.condition,
        }));

        return runSimulation({ nodes, edges }, options);
    } catch (engineError: unknown) {
        const message =
            engineError instanceof Error
                ? engineError.message
                : "Simulation evaluation failed.";
        throw new AppError(message, 400);
    }
};

/**
 * Executes graph traversal on raw nodes and edges without requiring persistence.
 */
export const runAdHocSimulation = (
    input: { nodes: SimulationNode[]; edges: SimulationEdge[] },
    options?: SimulationEngineOptions
): SimulationEngineResult => {
    if (!input || !Array.isArray(input.nodes) || input.nodes.length === 0) {
        throw new AppError("A simulation requires a non-empty nodes array.", 400);
    }

    try {
        return runSimulation(
            {
                nodes: input.nodes,
                edges: input.edges || [],
            },
            options
        );
    } catch (engineError: unknown) {
        const message =
            engineError instanceof Error
                ? engineError.message
                : "Simulation evaluation failed.";
        throw new AppError(message, 400);
    }
};
