import type { Request, Response, NextFunction } from "express";

import { env } from "../config/env";
import {
    registerUser,
    loginUser,
    getUserProfile,
} from "../services/auth/auth.service";

const COOKIE_NAME = "accessToken";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const isProduction = env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: COOKIE_MAX_AGE,
};

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

// POST /api/auth/register
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await registerUser(req.body);

        res.cookie(COOKIE_NAME, result.token, cookieOptions);

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: {
                user: result.user,
                token: result.token,
            },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// POST /api/auth/login
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await loginUser(req.body);

        res.cookie(COOKIE_NAME, result.token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                user: result.user,
                token: result.token,
            },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// POST /api/auth/logout
export const logout = (
    _req: Request,
    res: Response
): void => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
};

// GET /api/auth/me
export const getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user?.userId;

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
};
