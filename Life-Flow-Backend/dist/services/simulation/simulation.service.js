"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAdHocSimulation = exports.executeSimulation = exports.deleteSimulation = exports.updateSimulation = exports.getSimulationById = exports.getUserSimulations = exports.createSimulation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Simulation_1 = __importDefault(require("../../models/Simulation"));
const simulation_validator_1 = require("../../validators/simulation.validator");
const error_middleware_1 = require("../../middleware/error.middleware");
const simulation_engine_1 = require("./simulation.engine");
/**
 * Converts validation failures into client-friendly application errors.
 */
const validateInput = (schema, input) => {
    const result = schema.safeParse(input);
    if (!result.success) {
        const message = result.error?.issues
            .map((issue) => {
            const field = issue.path.map(String).join(".");
            return field ? `${field}: ${issue.message}` : issue.message;
        })
            .join("; ");
        throw new error_middleware_1.AppError(message || "Invalid request data.", 400);
    }
    return result.data;
};
/**
 * Ensures the supplied MongoDB ID has a valid ObjectId format.
 */
const validateSimulationId = (simulationId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(simulationId)) {
        throw new error_middleware_1.AppError("Invalid simulation ID.", 400);
    }
};
/**
 * Creates a simulation belonging to the authenticated user.
 */
const createSimulation = async (userId, input) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        throw new error_middleware_1.AppError("Invalid authenticated user ID.", 401);
    }
    const data = validateInput(simulation_validator_1.createSimulationSchema, input);
    const simulation = await Simulation_1.default.create({
        ...data,
        userId,
    });
    return simulation;
};
exports.createSimulation = createSimulation;
/**
 * Retrieves all simulations belonging to the authenticated user.
 */
const getUserSimulations = async (userId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        throw new error_middleware_1.AppError("Invalid authenticated user ID.", 401);
    }
    return Simulation_1.default.find({ userId })
        .sort({ createdAt: -1 })
        .exec();
};
exports.getUserSimulations = getUserSimulations;
/**
 * Retrieves one simulation only if it belongs to the user.
 */
const getSimulationById = async (userId, simulationId) => {
    validateSimulationId(simulationId);
    const simulation = await Simulation_1.default.findOne({
        _id: simulationId,
        userId,
    }).exec();
    if (!simulation) {
        throw new error_middleware_1.AppError("Simulation not found.", 404);
    }
    return simulation;
};
exports.getSimulationById = getSimulationById;
/**
 * Updates a simulation owned by the authenticated user.
 */
const updateSimulation = async (userId, simulationId, input) => {
    validateSimulationId(simulationId);
    const data = validateInput(simulation_validator_1.updateSimulationSchema, input);
    const simulation = await Simulation_1.default.findOneAndUpdate({
        _id: simulationId,
        userId,
    }, {
        $set: data,
    }, {
        new: true,
        runValidators: true,
    }).exec();
    if (!simulation) {
        throw new error_middleware_1.AppError("Simulation not found.", 404);
    }
    return simulation;
};
exports.updateSimulation = updateSimulation;
/**
 * Deletes a simulation owned by the authenticated user.
 */
const deleteSimulation = async (userId, simulationId) => {
    validateSimulationId(simulationId);
    const simulation = await Simulation_1.default.findOneAndDelete({
        _id: simulationId,
        userId,
    }).exec();
    if (!simulation) {
        throw new error_middleware_1.AppError("Simulation not found.", 404);
    }
};
exports.deleteSimulation = deleteSimulation;
/**
 * Executes graph traversal and path discovery on an existing saved simulation.
 */
const executeSimulation = async (userId, simulationId, options) => {
    validateSimulationId(simulationId);
    const simulation = await Simulation_1.default.findOne({
        _id: simulationId,
        userId,
    }).lean().exec();
    if (!simulation) {
        throw new error_middleware_1.AppError("Simulation not found.", 404);
    }
    if (!simulation.nodes || simulation.nodes.length === 0) {
        throw new error_middleware_1.AppError("Simulation contains no nodes. Please add nodes before running the simulation.", 400);
    }
    try {
        const nodes = simulation.nodes.map((node) => ({
            nodeId: node.nodeId,
            type: node.type,
            title: node.title,
            description: node.description,
            position: node.position,
        }));
        const edges = (simulation.edges || []).map((edge) => ({
            edgeId: edge.edgeId,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            condition: edge.condition,
        }));
        return (0, simulation_engine_1.runSimulation)({ nodes, edges }, options);
    }
    catch (engineError) {
        const message = engineError instanceof Error
            ? engineError.message
            : "Simulation evaluation failed.";
        throw new error_middleware_1.AppError(message, 400);
    }
};
exports.executeSimulation = executeSimulation;
/**
 * Executes graph traversal on raw nodes and edges without requiring persistence.
 */
const runAdHocSimulation = (input, options) => {
    if (!input || !Array.isArray(input.nodes) || input.nodes.length === 0) {
        throw new error_middleware_1.AppError("A simulation requires a non-empty nodes array.", 400);
    }
    try {
        return (0, simulation_engine_1.runSimulation)({
            nodes: input.nodes,
            edges: input.edges || [],
        }, options);
    }
    catch (engineError) {
        const message = engineError instanceof Error
            ? engineError.message
            : "Simulation evaluation failed.";
        throw new error_middleware_1.AppError(message, 400);
    }
};
exports.runAdHocSimulation = runAdHocSimulation;
