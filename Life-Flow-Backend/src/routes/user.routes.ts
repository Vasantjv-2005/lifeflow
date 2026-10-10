
import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { getUserProfile } from "../services/auth/auth.service";

const router = Router();

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

// All user profile routes require authentication.
router.use(authMiddleware);

// GET /api/users/me
router.get(
    "/me",
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
                return;
            }

            const user = await getUserProfile(userId);

            res.status(200).json({
                success: true,
                message: "User profile retrieved successfully.",
                data: { user },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

export default router;
