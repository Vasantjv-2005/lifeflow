
import {
    type Request,
    type Response,
    type NextFunction,
} from "express";

import {
    createScenario as createScenarioService,
    getScenariosBySimulation,
    getScenarioById,
    updateScenario as updateScenarioService,
    deleteScenario as deleteScenarioService,
} from "../services/scenario/scenario.service";

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

// POST /api/scenarios
export const createScenario = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        const scenario = await createScenarioService(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Scenario created successfully.",
            data: { scenario },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// GET /api/scenarios/simulation/:simulationId
export const getScenariosForSimulation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        const scenarios = await getScenariosBySimulation(userId, simulationId);

        res.status(200).json({
            success: true,
            message: "Scenarios retrieved successfully.",
            data: { scenarios },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// GET /api/scenarios/:id
export const getScenario = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        const scenario = await getScenarioById(userId, id);

        res.status(200).json({
            success: true,
            message: "Scenario retrieved successfully.",
            data: { scenario },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// PATCH /api/scenarios/:id
export const updateScenario = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        const scenario = await updateScenarioService(userId, id, req.body);

        res.status(200).json({
            success: true,
            message: "Scenario updated successfully.",
            data: { scenario },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// DELETE /api/scenarios/:id
export const deleteScenario = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        await deleteScenarioService(userId, id);

        res.status(200).json({
            success: true,
            message: "Scenario deleted successfully.",
        });
    } catch (error: unknown) {
        next(error);
    }
};
