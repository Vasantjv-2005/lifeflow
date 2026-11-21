"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDecision = exports.updateDecision = exports.getDecisionById = exports.getDecisions = exports.createDecision = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Decision_1 = __importDefault(require("../models/Decision"));
const decision_validator_1 = require("../validators/decision.validator");
const getUserId = (req) => {
    return req.user?.userId;
};
const getStringParam = (value) => {
    return typeof value === "string" ? value : undefined;
};
// POST /api/decisions
const createDecision = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const validation = decision_validator_1.createDecisionSchema.safeParse(req.body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            const errorMessage = firstIssue?.message || "Invalid decision data.";
            res.status(400).json({
                success: false,
                message: errorMessage,
                errors: validation.error.issues,
            });
            return;
        }
        const decision = await Decision_1.default.create({
            ...validation.data,
            userId,
        });
        res.status(201).json({
            success: true,
            message: "Decision created successfully.",
            data: { decision },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDecision = createDecision;
// GET /api/decisions
const getDecisions = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const decisions = await Decision_1.default.find({ userId }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            message: "Decisions retrieved successfully.",
            data: { decisions },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDecisions = getDecisions;
// GET /api/decisions/:id
const getDecisionById = async (req, res, next) => {
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
        if (!id || !mongoose_1.default.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID.",
            });
            return;
        }
        const decision = await Decision_1.default.findOne({ _id: id, userId });
        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Decision retrieved successfully.",
            data: { decision },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDecisionById = getDecisionById;
// PATCH /api/decisions/:id
const updateDecision = async (req, res, next) => {
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
        if (!id || !mongoose_1.default.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID.",
            });
            return;
        }
        const validation = decision_validator_1.updateDecisionSchema.safeParse(req.body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            const errorMessage = firstIssue?.message || "Invalid decision update data.";
            res.status(400).json({
                success: false,
                message: errorMessage,
                errors: validation.error.issues,
            });
            return;
        }
        const decision = await Decision_1.default.findOneAndUpdate({ _id: id, userId }, { $set: validation.data }, { new: true, runValidators: true });
        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Decision updated successfully.",
            data: { decision },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDecision = updateDecision;
// DELETE /api/decisions/:id
const deleteDecision = async (req, res, next) => {
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
        if (!id || !mongoose_1.default.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID.",
            });
            return;
        }
        const decision = await Decision_1.default.findOneAndDelete({
            _id: id,
            userId,
        });
        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Decision deleted successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDecision = deleteDecision;
