"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
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
const authMiddleware = (req, res, next) => {
    try {
        const bearerHeader = req.headers.authorization;
        const bearerToken = bearerHeader && bearerHeader.startsWith("Bearer ")
            ? bearerHeader.substring(7).trim()
            : undefined;
        const token = req.cookies?.accessToken || bearerToken;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
            return;
        }
        const jwtSecret = env_1.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (typeof decoded !== "object" ||
            decoded === null ||
            !("userId" in decoded) ||
            typeof decoded.userId !== "string") {
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: "Authentication token has expired. Please log in again.",
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
exports.authMiddleware = authMiddleware;
