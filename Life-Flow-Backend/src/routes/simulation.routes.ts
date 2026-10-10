
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

            const simulation = await getSimulationById(userId, id);

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

            const simulation = await updateSimulation(userId, id, req.body);

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

            await deleteSimulation(userId, id);

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
