"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const env_1 = require("../config/env");
const auth_service_1 = require("../services/auth/auth.service");
const COOKIE_NAME = "accessToken";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProduction = env_1.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
};
// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        res.cookie(COOKIE_NAME, result.token, cookieOptions);
        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: {
                user: result.user,
                token: result.token,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body);
        res.cookie(COOKIE_NAME, result.token, cookieOptions);
        res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                user: result.user,
                token: result.token,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// POST /api/auth/logout
const logout = (_req, res) => {
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
exports.logout = logout;
// GET /api/auth/me
const getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const user = await (0, auth_service_1.getUserProfile)(userId);
        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully.",
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentUser = getCurrentUser;
