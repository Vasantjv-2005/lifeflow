"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
/**
 * Handles requests made to routes that do not exist.
 *
 * This middleware should be registered after all application routes
 * and before the global error-handling middleware.
 */
const notFoundMiddleware = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};
exports.notFoundMiddleware = notFoundMiddleware;
