import { NextFunction, Request, Response } from "express";

/**
 * Handles requests made to routes that do not exist.
 *
 * This middleware should be registered after all application routes
 * and before the global error-handling middleware.
 */
export const notFoundMiddleware = (
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};