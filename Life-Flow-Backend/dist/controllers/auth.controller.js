"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubCallback = exports.githubAuth = exports.googleCallback = exports.googleAuth = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const env_1 = require("../config/env");
const auth_service_1 = require("../services/auth/auth.service");
const google_service_1 = require("../services/auth/google.service");
const github_service_1 = require("../services/auth/github.service");
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
// GET /api/auth/google
const googleAuth = (req, res, next) => {
    try {
        const isSwitch = req.query.switch === "1" || req.query.prompt === "select_account";
        // If user is switching accounts, clear the active LifeFlow session cookie first
        if (isSwitch) {
            res.clearCookie(COOKIE_NAME, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                path: "/",
            });
        }
        const { url, state } = (0, google_service_1.generateGoogleAuthUrl)(true);
        // Store CSRF state in secure httpOnly cookie (valid for 10 minutes)
        res.cookie("oauth_state", state, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 10 * 60 * 1000,
        });
        res.redirect(url);
    }
    catch (error) {
        next(error);
    }
};
exports.googleAuth = googleAuth;
// GET /api/auth/google/callback
const googleCallback = async (req, res, next) => {
    try {
        const { code, state, error: googleError } = req.query;
        // If user cancelled or Google returned an error
        if (googleError) {
            const errParam = typeof googleError === "string" ? googleError : "access_denied";
            res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent(errParam)}`);
            return;
        }
        // Validate state for CSRF protection
        const cookieState = req.cookies?.oauth_state;
        res.clearCookie("oauth_state", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });
        if (!state || !cookieState || state !== cookieState) {
            res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent("Authentication state mismatch. Possible CSRF attack.")}`);
            return;
        }
        if (!code || typeof code !== "string") {
            res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent("Authorization code missing from Google.")}`);
            return;
        }
        const result = await (0, google_service_1.handleGoogleCallbackService)(code);
        // Set the LifeFlow JWT in the secure HTTP-only cookie
        res.cookie(COOKIE_NAME, result.token, cookieOptions);
        // Redirect directly to the dashboard
        res.redirect(`${env_1.env.CLIENT_URL}/dashboard`);
    }
    catch (error) {
        const msg = error?.message || "Google authentication failed";
        console.error("❌ Google callback error:", msg);
        res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
    }
};
exports.googleCallback = googleCallback;
// GET /api/auth/github
const githubAuth = (req, res, next) => {
    try {
        const isSwitch = req.query.switch === "1" || req.query.prompt === "select_account";
        // If user is switching accounts, clear the active LifeFlow session cookie first
        if (isSwitch) {
            res.clearCookie(COOKIE_NAME, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                path: "/",
            });
        }
        const { url, state } = (0, github_service_1.generateGithubAuthUrl)(true);
        // Store CSRF state in secure httpOnly cookie (valid for 10 minutes)
        res.cookie("oauth_state", state, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 10 * 60 * 1000,
        });
        res.redirect(url);
    }
    catch (error) {
        next(error);
    }
};
exports.githubAuth = githubAuth;
// GET /api/auth/github/callback
const githubCallback = async (req, res, next) => {
    try {
        const { code, state, error: ghError, error_description } = req.query;
        // If user cancelled or GitHub returned an error
        if (ghError) {
            const errParam = typeof error_description === "string"
                ? error_description
                : typeof ghError === "string"
                    ? ghError
                    : "access_denied";
            res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent(errParam)}`);
            return;
        }
        // Validate state for CSRF protection
        const cookieState = req.cookies?.oauth_state;
        res.clearCookie("oauth_state", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });
        if (!state || !cookieState || state !== cookieState) {
            res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent("Authentication state mismatch. Possible CSRF attack.")}`);
            return;
        }
        if (!code || typeof code !== "string") {
            res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent("Authorization code missing from GitHub.")}`);
            return;
        }
        const result = await (0, github_service_1.handleGithubCallbackService)(code);
        // Set the LifeFlow JWT in the secure HTTP-only cookie
        res.cookie(COOKIE_NAME, result.token, cookieOptions);
        // Redirect directly to the dashboard
        res.redirect(`${env_1.env.CLIENT_URL}/dashboard`);
    }
    catch (error) {
        const msg = error?.message || "GitHub authentication failed";
        console.error("❌ GitHub callback error:", msg);
        res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
    }
};
exports.githubCallback = githubCallback;
