"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScenarioComparison = exports.clearAdvisorHistory = exports.getAdvisorHistory = exports.chatWithAdvisor = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Decision_1 = __importDefault(require("../models/Decision"));
const Scenario_1 = __importDefault(require("../models/Scenario"));
const DecisionAdvisorMessage_1 = __importDefault(require("../models/DecisionAdvisorMessage"));
const decisionAdvisor_validator_1 = require("../validators/decisionAdvisor.validator");
const decisionAdvisor_ai_service_1 = require("../services/ai/decisionAdvisor.ai.service");
const getUserId = (req) => {
    return req.user?.userId;
};
const getStringParam = (value) => {
    return typeof value === "string" ? value : undefined;
};
/**
 * POST /api/decisions/:decisionId/advisor/chat
 * User sends a question to the AI Decision Advisor.
 */
const chatWithAdvisor = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const decisionId = getStringParam(req.params.decisionId);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!decisionId || !mongoose_1.default.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }
        const validation = decisionAdvisor_validator_1.advisorChatRequestSchema.safeParse(req.body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            res.status(400).json({
                success: false,
                message: firstIssue?.message || "Invalid message format.",
                errors: validation.error.issues,
            });
            return;
        }
        const decision = await Decision_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(decisionId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }
        // Fetch associated scenarios for this decision
        const queryFilter = {
            userId: new mongoose_1.Types.ObjectId(userId),
        };
        if (decision.simulationId) {
            queryFilter.$or = [
                { decisionId: decision._id },
                { simulationId: decision.simulationId },
            ];
        }
        else {
            queryFilter.decisionId = decision._id;
        }
        const scenarios = await Scenario_1.default.find(queryFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .exec();
        // Fetch past conversation messages
        const previousMessages = await DecisionAdvisorMessage_1.default.find({
            decisionId: decision._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        })
            .sort({ createdAt: 1 })
            .limit(20)
            .exec();
        const historyPayload = previousMessages.map((m) => ({
            role: m.role,
            content: m.content,
        }));
        const { message } = validation.data;
        // Save user message
        const userMsg = await DecisionAdvisorMessage_1.default.create({
            decisionId: decision._id,
            userId: new mongoose_1.Types.ObjectId(userId),
            role: "user",
            content: message,
        });
        // Generate response from AI Decision Advisor
        const { answer, suggestedQuestions } = await (0, decisionAdvisor_ai_service_1.chatWithDecisionAdvisorAI)({
            decision,
            scenarios,
            conversationHistory: historyPayload,
            userMessage: message,
        });
        // Save assistant response
        const assistantMsg = await DecisionAdvisorMessage_1.default.create({
            decisionId: decision._id,
            userId: new mongoose_1.Types.ObjectId(userId),
            role: "assistant",
            content: answer,
            suggestedQuestions,
        });
        res.status(200).json({
            success: true,
            data: {
                userMessage: userMsg,
                assistantMessage: assistantMsg,
                suggestedQuestions,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.chatWithAdvisor = chatWithAdvisor;
/**
 * GET /api/decisions/:decisionId/advisor/history
 * Retrieves full conversation history for this decision's advisor.
 */
const getAdvisorHistory = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const decisionId = getStringParam(req.params.decisionId);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!decisionId || !mongoose_1.default.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }
        const decision = await Decision_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(decisionId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }
        const messages = await DecisionAdvisorMessage_1.default.find({
            decisionId: decision._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        })
            .sort({ createdAt: 1 })
            .exec();
        res.status(200).json({
            success: true,
            data: { messages },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdvisorHistory = getAdvisorHistory;
/**
 * DELETE /api/decisions/:decisionId/advisor/history
 * Clears conversation history with the AI Decision Advisor.
 */
const clearAdvisorHistory = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const decisionId = getStringParam(req.params.decisionId);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!decisionId || !mongoose_1.default.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }
        const decision = await Decision_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(decisionId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }
        await DecisionAdvisorMessage_1.default.deleteMany({
            decisionId: decision._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        res.status(200).json({
            success: true,
            message: "Advisor conversation history cleared.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.clearAdvisorHistory = clearAdvisorHistory;
/**
 * GET /api/decisions/:decisionId/scenarios/comparison
 * Retrieves the 6-dimension comparison dashboard data.
 */
const getScenarioComparison = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const decisionId = getStringParam(req.params.decisionId);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        if (!decisionId || !mongoose_1.default.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }
        const decision = await Decision_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(decisionId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }
        const queryFilter = {
            userId: new mongoose_1.Types.ObjectId(userId),
        };
        if (decision.simulationId) {
            queryFilter.$or = [
                { decisionId: decision._id },
                { simulationId: decision.simulationId },
            ];
        }
        else {
            queryFilter.decisionId = decision._id;
        }
        const scenarios = await Scenario_1.default.find(queryFilter)
            .sort({ createdAt: -1 })
            .exec();
        const comparison = (0, decisionAdvisor_ai_service_1.buildScenarioComparisonMatrix)(decision, scenarios);
        res.status(200).json({
            success: true,
            data: { comparison },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getScenarioComparison = getScenarioComparison;
