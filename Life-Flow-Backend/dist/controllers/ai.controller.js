"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScenariosController = void 0;
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
                scenarios: result.scenarios,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateScenariosController = generateScenariosController;
