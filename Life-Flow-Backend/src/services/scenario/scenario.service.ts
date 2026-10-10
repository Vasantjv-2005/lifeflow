
import mongoose from "mongoose";

import Scenario from "../../models/Scenario";
import Simulation from "../../models/Simulation";
import {
    createScenarioSchema,
    updateScenarioSchema,
} from "../../validators/scenario.validator";
import { AppError } from "../../middleware/error.middleware";

/**
 * Validates a MongoDB ObjectId.
 */
const validateObjectId = (
    id: string,
    fieldName: string
): void => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(`Invalid ${fieldName}.`, 400);
    }
};

/**
 * Validates scenario input using the existing Zod schema.
 */
const validateScenarioInput = (
    input: unknown,
    mode: "create" | "update"
): Record<string, unknown> => {
    const schema =
        mode === "create"
            ? createScenarioSchema
            : updateScenarioSchema;

    const result = schema.safeParse(input);

    if (!result.success) {
        const messages = result.error.issues.map((issue) => {
            const field = issue.path.map(String).join(".");
            return field
                ? `${field}: ${issue.message}`
                : issue.message;
        });

        throw new AppError(
            messages.join("; ") || "Invalid scenario data.",
            400
        );
    }

    return result.data as Record<string, unknown>;
};

/**
 * Confirms that a simulation exists and belongs to the user.
 */
const ensureSimulationOwnership = async (
    simulationId: string,
    userId: string
): Promise<void> => {
    validateObjectId(simulationId, "simulation ID");

    const simulation = await Simulation.exists({
        _id: simulationId,
        userId,
    });

    if (!simulation) {
        throw new AppError("Simulation not found.", 404);
    }
};

/**
 * Creates a scenario for a simulation owned by the user.
 *
 * The userId is supplied by authenticated application logic,
 * never trusted from the request body.
 */
export const createScenario = async (
    userId: string,
    input: unknown
) => {
    validateObjectId(userId, "authenticated user ID");

    const data = validateScenarioInput(input, "create");
    const simulationId = data.simulationId;

    if (
        typeof simulationId !== "string" ||
        simulationId.length === 0
    ) {
        throw new AppError("A valid simulation ID is required.", 400);
    }

    await ensureSimulationOwnership(simulationId, userId);

    const scenario = await Scenario.create({
        ...data,
        userId,
    });

    return scenario;
};

/**
 * Lists scenarios belonging to a simulation owned by the user.
 */
export const getScenariosBySimulation = async (
    userId: string,
    simulationId: string
) => {
    validateObjectId(userId, "authenticated user ID");

    await ensureSimulationOwnership(simulationId, userId);

    return Scenario.find({
        userId,
        simulationId,
    })
        .sort({ createdAt: -1 })
        .exec();
};

/**
 * Retrieves one scenario belonging to the authenticated user.
 */
export const getScenarioById = async (
    userId: string,
    scenarioId: string
) => {
    validateObjectId(userId, "authenticated user ID");
    validateObjectId(scenarioId, "scenario ID");

    const scenario = await Scenario.findOne({
        _id: scenarioId,
        userId,
    }).exec();

    if (!scenario) {
        throw new AppError("Scenario not found.", 404);
    }

    return scenario;
};

/**
 * Updates a scenario owned by the authenticated user.
 */
export const updateScenario = async (
    userId: string,
    scenarioId: string,
    input: unknown
) => {
    validateObjectId(userId, "authenticated user ID");
    validateObjectId(scenarioId, "scenario ID");

    const data = validateScenarioInput(input, "update");

    // If the update changes the associated simulation,
    // verify that the target simulation belongs to the user.
    if (typeof data.simulationId === "string") {
        await ensureSimulationOwnership(data.simulationId, userId);
    }

    const scenario = await Scenario.findOneAndUpdate(
        {
            _id: scenarioId,
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

    if (!scenario) {
        throw new AppError("Scenario not found.", 404);
    }

    return scenario;
};

/**
 * Deletes a scenario owned by the authenticated user.
 */
export const deleteScenario = async (
    userId: string,
    scenarioId: string
): Promise<void> => {
    validateObjectId(userId, "authenticated user ID");
    validateObjectId(scenarioId, "scenario ID");

    const scenario = await Scenario.findOneAndDelete({
        _id: scenarioId,
        userId,
    }).exec();

    if (!scenario) {
        throw new AppError("Scenario not found.", 404);
    }
};
