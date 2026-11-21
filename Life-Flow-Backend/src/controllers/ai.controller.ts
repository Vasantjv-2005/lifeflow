import type { Request, Response, NextFunction } from "express";

import { generateScenarios } from "../services/ai/ai.service";
import { generateScenariosRequestSchema } from "../validators/ai.validator";

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

// POST /api/ai/generate-scenarios
export const generateScenariosController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authenticatedReq = req as AuthenticatedRequest;
        const userId = authenticatedReq.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
            return;
        }

        const validation = generateScenariosRequestSchema.safeParse(req.body);

        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            const errorMessage =
                firstIssue?.message || "Invalid request parameters.";

            res.status(400).json({
                success: false,
                message: errorMessage,
                errors: validation.error.issues,
            });
            return;
        }

        const result = await generateScenarios(validation.data);

        res.status(200).json({
            success: true,
            message: "Scenarios generated successfully.",
            data: {
                decisionOverview: result.decisionOverview,
                scenarios: result.scenarios,
            },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// GET /api/ai/career-jobs
export const getCareerJobsController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const role = String(req.query.role || "Software Engineer");
        const location = req.query.location ? String(req.query.location) : undefined;
        const skills = req.query.skills ? String(req.query.skills) : undefined;

        const { getJobResearchForRole, getMarketAnalysis } = await import("../services/jobResearch.service");
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
    } catch (error: unknown) {
        next(error);
    }
};
