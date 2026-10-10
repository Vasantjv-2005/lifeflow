
import { Router, type Request, type Response, type NextFunction } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    createScenario,
    getScenariosBySimulation,
    getScenarioById,
    updateScenario,
    deleteScenario,
} from "../services/scenario/scenario.service";

const router = Router();

type AuthenticatedUserRequest = Request & {
    user?: {
        userId: string;
    };
};

const getUserId = (req: Request): string | undefined => {
    return (req as AuthenticatedUserRequest).user?.userId;
};

// All scenario endpoints require authentication.
router.use(authMiddleware);

// POST /api/scenarios
router.post(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
                return;
            }

            const scenario = await createScenario(userId, req.body);

            res.status(201).json({
                success: true,
                message: "Scenario created successfully.",
                data: { scenario },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// GET /api/scenarios/simulation/:simulationId
// Keep this route before /:id to avoid route conflicts.
router.get(
    "/simulation/:simulationId",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
                return;
            }

            const scenarios = await getScenariosBySimulation(
                userId,
                req.params.simulationId
            );

            res.status(200).json({
                success: true,
                message: "Scenarios retrieved successfully.",
                data: { scenarios },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// GET /api/scenarios/:id
router.get(
    "/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
                return;
            }

            const scenario = await getScenarioById(userId, req.params.id);

            res.status(200).json({
                success: true,
                message: "Scenario retrieved successfully.",
                data: { scenario },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// PATCH /api/scenarios/:id
router.patch(
    "/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
                return;
            }

            const scenario = await updateScenario(
                userId,
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Scenario updated successfully.",
                data: { scenario },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// DELETE /api/scenarios/:id
router.delete(
    "/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
                return;
            }

            await deleteScenario(userId, req.params.id);

            res.status(200).json({
                success: true,
                message: "Scenario deleted successfully.",
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

export default router;
