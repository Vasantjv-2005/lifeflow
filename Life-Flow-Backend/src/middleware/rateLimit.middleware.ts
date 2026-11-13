import type { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}

interface ClientRecord {
    count: number;
    resetTime: number;
}

/**
 * Lightweight, dependency-free in-memory rate limiter middleware.
 */
export const createRateLimiter = (options: RateLimitOptions) => {
    const {
        windowMs,
        max,
        message = "Too many requests, please try again later.",
    } = options;

    const clients = new Map<string, ClientRecord>();

    // Cleanup expired records periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of clients.entries()) {
            if (now > record.resetTime) {
                clients.delete(key);
            }
        }
    }, windowMs).unref();

    return (req: Request, res: Response, next: NextFunction): void => {
        const ip =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
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

/** Pre-configured limiter for authentication endpoints: 20 requests per 15 minutes */
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
});

/** Pre-configured limiter for AI endpoints: 20 requests per minute */
export const aiRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: "AI rate limit reached. Please wait before making more AI requests.",
});

