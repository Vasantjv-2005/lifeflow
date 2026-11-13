"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScenario = exports.updateScenario = exports.getScenarioById = exports.getScenariosBySimulation = exports.createBatchScenarios = exports.createScenario = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Scenario_1 = __importDefault(require("../../models/Scenario"));
const Simulation_1 = __importDefault(require("../../models/Simulation"));
const scenario_validator_1 = require("../../validators/scenario.validator");
const error_middleware_1 = require("../../middleware/error.middleware");
/**
 * Validates a MongoDB ObjectId.
 */
const validateObjectId = (id, fieldName) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_middleware_1.AppError(`Invalid ${fieldName}.`, 400);
    }
};
/**
 * Validates scenario input using the existing Zod schema.
 */
const validateScenarioInput = (input, mode) => {
    const schema = mode === "create"
        ? scenario_validator_1.createScenarioSchema
        : scenario_validator_1.updateScenarioSchema;
    const result = schema.safeParse(input);
    if (!result.success) {
        const messages = result.error.issues.map((issue) => {
            const field = issue.path.map(String).join(".");
            return field
                ? `${field}: ${issue.message}`
                : issue.message;
        });
        throw new error_middleware_1.AppError(messages.join("; ") || "Invalid scenario data.", 400);
    }
    return result.data;
};
/**
 * Confirms that a simulation exists and belongs to the user.
 */
const ensureSimulationOwnership = async (simulationId, userId) => {
    validateObjectId(simulationId, "simulation ID");
    const simulation = await Simulation_1.default.exists({
        _id: simulationId,
        userId,
    });
    if (!simulation) {
        throw new error_middleware_1.AppError("Simulation not found.", 404);
    }
};
/**
 * Creates a scenario for a simulation owned by the user.
 *
 * The userId is supplied by authenticated application logic,
 * never trusted from the request body.
 */
const createScenario = async (userId, input) => {
    validateObjectId(userId, "authenticated user ID");
    const data = validateScenarioInput(input, "create");
    const simulationId = data.simulationId;
    if (typeof simulationId !== "string" ||
        simulationId.length === 0) {
        throw new error_middleware_1.AppError("A valid simulation ID is required.", 400);
    }
    await ensureSimulationOwnership(simulationId, userId);
    const scenario = await Scenario_1.default.create({
        ...data,
        userId,
    });
    return scenario;
};
exports.createScenario = createScenario;
/**
 * Creates multiple scenarios in batch for a given simulation.
 */
const createBatchScenarios = async (userId, simulationId, scenarios) => {
    validateObjectId(userId, "authenticated user ID");
    validateObjectId(simulationId, "simulation ID");
    if (!Array.isArray(scenarios) || scenarios.length === 0) {
        throw new error_middleware_1.AppError("A non-empty array of scenarios is required.", 400);
    }
    await ensureSimulationOwnership(simulationId, userId);
    const docsToInsert = scenarios.map((item) => {
        const validated = validateScenarioInput({ ...item, simulationId }, "create");
        return {
            ...validated,
            simulationId,
            userId,
        };
    });
    return Scenario_1.default.insertMany(docsToInsert);
};
exports.createBatchScenarios = createBatchScenarios;
/**
 * Lists scenarios belonging to a simulation owned by the user.
 */
const getScenariosBySimulation = async (userId, simulationId) => {
    validateObjectId(userId, "authenticated user ID");
    await ensureSimulationOwnership(simulationId, userId);
    return Scenario_1.default.find({
        userId,
        simulationId,
    })
        .sort({ createdAt: -1 })
        .exec();
};
exports.getScenariosBySimulation = getScenariosBySimulation;
/**
 * Retrieves one scenario belonging to the authenticated user.
 */
const getScenarioById = async (userId, scenarioId) => {
    validateObjectId(userId, "authenticated user ID");
    validateObjectId(scenarioId, "scenario ID");
    const scenario = await Scenario_1.default.findOne({
        _id: scenarioId,
        userId,
    }).exec();
    if (!scenario) {
        throw new error_middleware_1.AppError("Scenario not found.", 404);
    }
    return scenario;
};
exports.getScenarioById = getScenarioById;
/**
 * Updates a scenario owned by the authenticated user.
 */
const updateScenario = async (userId, scenarioId, input) => {
    validateObjectId(userId, "authenticated user ID");
    validateObjectId(scenarioId, "scenario ID");
    const data = validateScenarioInput(input, "update");
    // If the update changes the associated simulation,
    // verify that the target simulation belongs to the user.
    if (typeof data.simulationId === "string") {
        await ensureSimulationOwnership(data.simulationId, userId);
    }
    const scenario = await Scenario_1.default.findOneAndUpdate({
        _id: scenarioId,
        userId,
    }, {
        $set: data,
    }, {
        new: true,
        runValidators: true,
    }).exec();
    if (!scenario) {
        throw new error_middleware_1.AppError("Scenario not found.", 404);
    }
    return scenario;
};
exports.updateScenario = updateScenario;
/**
 * Deletes a scenario owned by the authenticated user.
 */
const deleteScenario = async (userId, scenarioId) => {
    validateObjectId(userId, "authenticated user ID");
    validateObjectId(scenarioId, "scenario ID");
    const scenario = await Scenario_1.default.findOneAndDelete({
        _id: scenarioId,
        userId,
    }).exec();
    if (!scenario) {
        throw new error_middleware_1.AppError("Scenario not found.", 404);
    }
};
exports.deleteScenario = deleteScenario;
