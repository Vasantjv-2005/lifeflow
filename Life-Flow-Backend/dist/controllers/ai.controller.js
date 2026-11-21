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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCareerJobsController = exports.generateScenariosController = void 0;
const ai_service_1 = require("../services/ai/ai.service");
const ai_validator_1 = require("../validators/ai.validator");
// POST /api/ai/generate-scenarios
const generateScenariosController = async (req, res, next) => {
    try {
        const authenticatedReq = req;
        const userId = authenticatedReq.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
            return;
        }
        const validation = ai_validator_1.generateScenariosRequestSchema.safeParse(req.body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            const errorMessage = firstIssue?.message || "Invalid request parameters.";
            res.status(400).json({
                success: false,
                message: errorMessage,
                errors: validation.error.issues,
            });
            return;
        }
        const result = await (0, ai_service_1.generateScenarios)(validation.data);
        res.status(200).json({
            success: true,
            message: "Scenarios generated successfully.",
            data: {
                decisionOverview: result.decisionOverview,
                scenarios: result.scenarios,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateScenariosController = generateScenariosController;
// GET /api/ai/career-jobs
const getCareerJobsController = async (req, res, next) => {
    try {
        const role = String(req.query.role || "Software Engineer");
        const location = req.query.location ? String(req.query.location) : undefined;
        const skills = req.query.skills ? String(req.query.skills) : undefined;
        const { getJobResearchForRole, getMarketAnalysis } = await Promise.resolve().then(() => __importStar(require("../services/jobResearch.service")));
        const jobs = getJobResearchForRole(role, location, skills);
        const marketAnalysis = getMarketAnalysis(role, skills);
        res.status(200).json({
            success: true,
            data: {
                role,
                location,
                jobs,
                marketAnalysis,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCareerJobsController = getCareerJobsController;
