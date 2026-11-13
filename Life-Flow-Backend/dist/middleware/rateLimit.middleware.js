"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRateLimiter = exports.authRateLimiter = exports.createRateLimiter = void 0;
/**
 * Lightweight, dependency-free in-memory rate limiter middleware.
 */
const createRateLimiter = (options) => {
    const { windowMs, max, message = "Too many requests, please try again later.", } = options;
    const clients = new Map();
    // Cleanup expired records periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of clients.entries()) {
            if (now > record.resetTime) {
                clients.delete(key);
            }
        }
    }, windowMs).unref();
    return (req, res, next) => {
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            "unknown-ip";
        const now = Date.now();
        const record = clients.get(ip);
        if (!record || now > record.resetTime) {
            clients.set(ip, {
                count: 1,
                resetTime: now + windowMs,
            });
            next();
            return;
        }
        record.count += 1;
        if (record.count > max) {
            res.status(429).json({
                success: false,
                message,
                retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
            });
            return;
        }
        next();
    };
};
exports.createRateLimiter = createRateLimiter;
/** Pre-configured limiter for authentication endpoints: 20 requests per 15 minutes */
exports.authRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
});
/** Pre-configured limiter for AI endpoints: 20 requests per minute */
exports.aiRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 60 * 1000,
    max: 20,
    message: "AI rate limit reached. Please wait before making more AI requests.",
});
