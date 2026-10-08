import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Represents the information stored inside our JWT.
 *
 * The userId is used to identify the authenticated user.
 */
export interface AuthenticatedUser {
    userId: string;
}

/**
 * Extends the Express Request object so that
 * protected controllers can access the authenticated user.
 */
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

/**
 * Authentication middleware.
 *
 * This middleware:
 * 1. Reads the JWT from the HTTP-only cookie.
 * 2. Verifies the JWT using JWT_SECRET.
 * 3. Extracts the user ID from the token.
 * 4. Attaches the user information to req.user.
 *
 * If authentication fails, the request is rejected with HTTP 401.
 *
 * Usage:
 *
 * router.get(
 *   "/profile",
 *   authMiddleware,
 *   getProfile
 * );
 */
export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured.");

            res.status(500).json({
                success: false,
                message: "Server authentication configuration is missing.",
            });
            return;
        }

        const decoded = jwt.verify(token, jwtSecret);

        if (
            typeof decoded !== "object" ||
            decoded === null ||
            !("userId" in decoded) ||
            typeof decoded.userId !== "string"
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
            return;
        }

        req.user = {
            userId: decoded.userId,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: "Authentication token has expired. Please log in again.",
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
            return;
        }

        console.error("Authentication middleware error:", error);

        res.status(500).json({
            success: false,
            message: "Authentication failed.",
        });
    }
};