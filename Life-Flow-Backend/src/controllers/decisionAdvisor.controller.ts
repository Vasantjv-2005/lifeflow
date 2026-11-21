import { type Request, type Response, type NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import Decision from "../models/Decision";
import Scenario from "../models/Scenario";
import DecisionAdvisorMessage from "../models/DecisionAdvisorMessage";
import { advisorChatRequestSchema } from "../validators/decisionAdvisor.validator";
import {
    chatWithDecisionAdvisorAI,
    buildScenarioComparisonMatrix,
} from "../services/ai/decisionAdvisor.ai.service";

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

const getUserId = (req: Request): string | undefined => {
    return (req as AuthenticatedRequest).user?.userId;
};

const getStringParam = (value: unknown): string | undefined => {
    return typeof value === "string" ? value : undefined;
};

/**
 * POST /api/decisions/:decisionId/advisor/chat
 * User sends a question to the AI Decision Advisor.
 */
export const chatWithAdvisor = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        if (!decisionId || !mongoose.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }

        const validation = advisorChatRequestSchema.safeParse(req.body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            res.status(400).json({
                success: false,
                message: firstIssue?.message || "Invalid message format.",
                errors: validation.error.issues,
            });
            return;
        }

        const decision = await Decision.findOne({
            _id: new Types.ObjectId(decisionId),
            userId: new Types.ObjectId(userId),
        });

        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }

        // Fetch associated scenarios for this decision
        const queryFilter: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
        };
        if (decision.simulationId) {
            queryFilter.$or = [
                { decisionId: decision._id },
                { simulationId: decision.simulationId },
            ];
        } else {
            queryFilter.decisionId = decision._id;
        }

        const scenarios = await Scenario.find(queryFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .exec();

        // Fetch past conversation messages
        const previousMessages = await DecisionAdvisorMessage.find({
            decisionId: decision._id,
            userId: new Types.ObjectId(userId),
        })
            .sort({ createdAt: 1 })
            .limit(20)
            .exec();

        const historyPayload = previousMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));

        const { message } = validation.data;

        // Save user message
        const userMsg = await DecisionAdvisorMessage.create({
            decisionId: decision._id,
            userId: new Types.ObjectId(userId),
            role: "user",
            content: message,
        });

        // Generate response from AI Decision Advisor
        const { answer, suggestedQuestions } = await chatWithDecisionAdvisorAI({
            decision,
            scenarios,
            conversationHistory: historyPayload,
            userMessage: message,
        });

        // Save assistant response
        const assistantMsg = await DecisionAdvisorMessage.create({
            decisionId: decision._id,
            userId: new Types.ObjectId(userId),
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
    } catch (error: unknown) {
        next(error);
    }
};

/**
 * GET /api/decisions/:decisionId/advisor/history
 * Retrieves full conversation history for this decision's advisor.
 */
export const getAdvisorHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        if (!decisionId || !mongoose.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }

        const decision = await Decision.findOne({
            _id: new Types.ObjectId(decisionId),
            userId: new Types.ObjectId(userId),
        });

        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }

        const messages = await DecisionAdvisorMessage.find({
            decisionId: decision._id,
            userId: new Types.ObjectId(userId),
        })
            .sort({ createdAt: 1 })
            .exec();

        res.status(200).json({
            success: true,
            data: { messages },
        });
    } catch (error: unknown) {
        next(error);
    }
};

/**
 * DELETE /api/decisions/:decisionId/advisor/history
 * Clears conversation history with the AI Decision Advisor.
 */
export const clearAdvisorHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        if (!decisionId || !mongoose.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }

        const decision = await Decision.findOne({
            _id: new Types.ObjectId(decisionId),
            userId: new Types.ObjectId(userId),
        });

        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }

        await DecisionAdvisorMessage.deleteMany({
            decisionId: decision._id,
            userId: new Types.ObjectId(userId),
        });

        res.status(200).json({
            success: true,
            message: "Advisor conversation history cleared.",
        });
    } catch (error: unknown) {
        next(error);
    }
};

/**
 * GET /api/decisions/:decisionId/scenarios/comparison
 * Retrieves the 6-dimension comparison dashboard data.
 */
export const getScenarioComparison = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        if (!decisionId || !mongoose.isValidObjectId(decisionId)) {
            res.status(400).json({
                success: false,
                message: "Invalid decision ID format.",
            });
            return;
        }

        const decision = await Decision.findOne({
            _id: new Types.ObjectId(decisionId),
            userId: new Types.ObjectId(userId),
        });

        if (!decision) {
            res.status(404).json({
                success: false,
                message: "Decision not found or unauthorized.",
            });
            return;
        }

        const queryFilter: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
        };
        if (decision.simulationId) {
            queryFilter.$or = [
                { decisionId: decision._id },
                { simulationId: decision.simulationId },
            ];
        } else {
            queryFilter.decisionId = decision._id;
        }

        const scenarios = await Scenario.find(queryFilter)
            .sort({ createdAt: -1 })
            .exec();

        const comparison = buildScenarioComparisonMatrix(decision, scenarios);

        res.status(200).json({
            success: true,
            data: { comparison },
        });
    } catch (error: unknown) {
        next(error);
    }
};
