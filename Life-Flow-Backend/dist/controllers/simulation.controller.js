"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulationAdHoc = exports.runSimulationById = exports.deleteSimulation = exports.updateSimulation = exports.getSimulation = exports.getSimulations = exports.createSimulation = void 0;
const simulation_service_1 = require("../services/simulation/simulation.service");
const getUserId = (req) => {
    return req.user?.userId;
};
const getStringParam = (value) => {
    return typeof value === "string" ? value : undefined;
};
// POST /api/simulations
const createSimulation = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const simulation = await (0, simulation_service_1.createSimulation)(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Simulation created successfully.",
            data: { simulation },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSimulation = createSimulation;
// GET /api/simulations
const getSimulations = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const simulations = await (0, simulation_service_1.getUserSimulations)(userId);
        res.status(200).json({
            success: true,
            message: "Simulations retrieved successfully.",
            data: { simulations },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSimulations = getSimulations;
// GET /api/simulations/:id
const getSimulation = async (req, res, next) => {
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
                message: "Invalid simulation ID.",
            });
            return;
        }
        const simulation = await (0, simulation_service_1.getSimulationById)(userId, id);
        res.status(200).json({
            success: true,
            message: "Simulation retrieved successfully.",
            data: { simulation },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSimulation = getSimulation;
// PATCH /api/simulations/:id
const updateSimulation = async (req, res, next) => {
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
                message: "Invalid simulation ID.",
            });
            return;
        }
        const simulation = await (0, simulation_service_1.updateSimulation)(userId, id, req.body);
        res.status(200).json({
            success: true,
            message: "Simulation updated successfully.",
            data: { simulation },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSimulation = updateSimulation;
// DELETE /api/simulations/:id
const deleteSimulation = async (req, res, next) => {
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
                message: "Invalid simulation ID.",
            });
            return;
        }
        await (0, simulation_service_1.deleteSimulation)(userId, id);
        res.status(200).json({
            success: true,
            message: "Simulation deleted successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSimulation = deleteSimulation;
// POST /api/simulations/:id/run
const runSimulationById = async (req, res, next) => {
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
                message: "Invalid simulation ID.",
            });
            return;
        }
        const options = {
            maxPaths: req.body?.maxPaths ? Number(req.body.maxPaths) : undefined,
            maxDepth: req.body?.maxDepth ? Number(req.body.maxDepth) : undefined,
        };
        const result = await (0, simulation_service_1.executeSimulation)(userId, id, options);
        res.status(200).json({
            success: true,
            message: "Simulation executed successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.runSimulationById = runSimulationById;
// POST /api/simulations/run
const runSimulationAdHoc = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const { nodes, edges, maxPaths, maxDepth } = req.body;
        const options = {
            maxPaths: maxPaths ? Number(maxPaths) : undefined,
            maxDepth: maxDepth ? Number(maxDepth) : undefined,
        };
        const result = (0, simulation_service_1.runAdHocSimulation)({ nodes, edges }, options);
        res.status(200).json({
            success: true,
            message: "Ad-hoc simulation executed successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.runSimulationAdHoc = runSimulationAdHoc;
