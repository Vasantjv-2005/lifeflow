
import { Router, type Request, type Response, type NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth/auth.service";

const router = Router();

const COOKIE_NAME = "accessToken";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
};

// POST /api/auth/register
router.post(
    "/register",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await registerUser(req.body);

            res.cookie(COOKIE_NAME, result.token, cookieOptions);

            res.status(201).json({
                success: true,
                message: "Account created successfully.",
                data: {
                    user: result.user,
                },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// POST /api/auth/login
router.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await loginUser(req.body);

            res.cookie(COOKIE_NAME, result.token, cookieOptions);

            res.status(200).json({
                success: true,
                message: "Login successful.",
                data: {
                    user: result.user,
                },
            });
        } catch (error: unknown) {
            next(error);
        }
    }
);

// POST /api/auth/logout
router.post(
    "/logout",
    (_req: Request, res: Response): void => {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    }
);

export default router;
