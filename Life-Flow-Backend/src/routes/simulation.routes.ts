
import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    createSimulation,
    getUserSimulations,
    getSimulationById,
    updateSimulation,
    deleteSimulation,
} from "../services/simulation/simulation.service";

const router = Router();

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
    };
};

const getUserId = (req: Request): string | undefined => {
    return (req as AuthenticatedRequest).user?.userId;
};

// All simulation endpoints require authentication.
router.use(authMiddleware);

// POST /api/simulations
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

            const simulation = await createSimulation(userId, req.body);

            res.status(201).json({
                success: true,
                message: "Simulation created successfully.",
                data: { simulation },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// GET /api/simulations
router.get(
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

            const simulations = await getUserSimulations(userId);

            res.status(200).json({
                success: true,
                message: "Simulations retrieved successfully.",
                data: { simulations },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// GET /api/simulations/:id
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

            const simulation = await getSimulationById(userId, req.params.id);

            res.status(200).json({
                success: true,
                message: "Simulation retrieved successfully.",
                data: { simulation },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// PATCH /api/simulations/:id
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

            const simulation = await updateSimulation(
                userId,
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Simulation updated successfully.",
                data: { simulation },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// DELETE /api/simulations/:id
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

            await deleteSimulation(userId, req.params.id);

            res.status(200).json({
                success: true,
                message: "Simulation deleted successfully.",
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

export default router;
