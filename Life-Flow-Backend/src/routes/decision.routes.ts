
import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";
import mongoose from "mongoose";

import Decision from "../models/Decision";
import { authMiddleware } from "../middleware/auth.middleware";
import {
    createDecisionSchema,
    updateDecisionSchema,
} from "../validators/decision.validator";

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

// POST /api/decisions
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

            const validation = createDecisionSchema.safeParse(req.body);

            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid decision data.",
                    errors: validation.error.issues,
                });
                return;
            }

            const decision = await Decision.create({
                ...validation.data,
                userId,
            });

            res.status(201).json({
                success: true,
                message: "Decision created successfully.",
                data: { decision },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// GET /api/decisions
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

            const decisions = await Decision.find({ userId }).sort({
                createdAt: -1,
            });

            res.status(200).json({
                success: true,
                message: "Decisions retrieved successfully.",
                data: { decisions },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// GET /api/decisions/:id
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

            if (!id || !mongoose.isValidObjectId(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid decision ID.",
                });
                return;
            }

            const decision = await Decision.findOne({ _id: id, userId });

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
        } catch (error: unknown) {
            next(error);
        }
    }
);

// PATCH /api/decisions/:id
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

            if (!id || !mongoose.isValidObjectId(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid decision ID.",
                });
                return;
            }

            const validation = updateDecisionSchema.safeParse(req.body);

            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid decision update data.",
                    errors: validation.error.issues,
                });
                return;
            }

            const decision = await Decision.findOneAndUpdate(
                { _id: id, userId },
                { $set: validation.data },
                { new: true, runValidators: true }
            );

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
        } catch (error: unknown) {
            next(error);
        }
    }
);

// DELETE /api/decisions/:id
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

            if (!id || !mongoose.isValidObjectId(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid decision ID.",
                });
                return;
            }

            const decision = await Decision.findOneAndDelete({
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
        } catch (error: unknown) {
            next(error);
        }
    }
);

export default router;
