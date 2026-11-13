"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScenario = exports.updateScenario = exports.getScenario = exports.getScenariosForSimulation = exports.createBatchScenarios = exports.createScenario = void 0;
const scenario_service_1 = require("../services/scenario/scenario.service");
const getUserId = (req) => {
    return req.user?.userId;
};
const getStringParam = (value) => {
    return typeof value === "string" ? value : undefined;
};
// POST /api/scenarios
const createScenario = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const scenario = await (0, scenario_service_1.createScenario)(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Scenario created successfully.",
            data: { scenario },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createScenario = createScenario;
// POST /api/scenarios/batch
const createBatchScenarios = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const { simulationId, scenarios } = req.body;
        if (!simulationId) {
            res.status(400).json({
                success: false,
                message: "simulationId is required for batch creation.",
            });
            return;
        }
        const createdScenarios = await (0, scenario_service_1.createBatchScenarios)(userId, simulationId, scenarios);
        res.status(201).json({
            success: true,
            message: "Scenarios created in batch successfully.",
            data: { scenarios: createdScenarios },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBatchScenarios = createBatchScenarios;
// GET /api/scenarios/simulation/:simulationId
const getScenariosForSimulation = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const simulationId = getStringParam(req.params.simulationId);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!simulationId) {
            res.status(400).json({
                success: false,
                message: "Invalid simulation ID.",
            });
            return;
        }
        const scenarios = await (0, scenario_service_1.getScenariosBySimulation)(userId, simulationId);
        res.status(200).json({
            success: true,
            message: "Scenarios retrieved successfully.",
            data: { scenarios },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getScenariosForSimulation = getScenariosForSimulation;
// GET /api/scenarios/:id
const getScenario = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const id = getStringParam(req.params.id);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Invalid scenario ID.",
            });
            return;
        }
        const scenario = await (0, scenario_service_1.getScenarioById)(userId, id);
        res.status(200).json({
            success: true,
            message: "Scenario retrieved successfully.",
            data: { scenario },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getScenario = getScenario;
// PATCH /api/scenarios/:id
const updateScenario = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const id = getStringParam(req.params.id);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Invalid scenario ID.",
            });
            return;
        }
        const scenario = await (0, scenario_service_1.updateScenario)(userId, id, req.body);
        res.status(200).json({
            success: true,
            message: "Scenario updated successfully.",
            data: { scenario },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateScenario = updateScenario;
// DELETE /api/scenarios/:id
const deleteScenario = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const id = getStringParam(req.params.id);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Invalid scenario ID.",
            });
            return;
        }
        await (0, scenario_service_1.deleteScenario)(userId, id);
        res.status(200).json({
            success: true,
            message: "Scenario deleted successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteScenario = deleteScenario;
