"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubCallback = exports.githubAuth = exports.googleCallback = exports.googleAuth = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const env_1 = require("../config/env");
const auth_service_1 = require("../services/auth/auth.service");
const google_service_1 = require("../services/auth/google.service");
const github_service_1 = require("../services/auth/github.service");
const COOKIE_NAME = "accessToken";
const OAUTH_ORIGIN_COOKIE = "oauth_client_origin";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProduction = env_1.env.NODE_ENV === "production" || process.env.RENDER === "true";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
};
const oauthCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 10 * 60 * 1000,
};
const clearCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
};
const validateAllowedOrigin = (candidate) => {
    if (!candidate)
        return null;
    try {
        const parsedOrigin = new URL(candidate).origin;
        const allowed = (0, env_1.getAllowedClientOrigins)();
        return allowed.includes(parsedOrigin) ? parsedOrigin : null;
    }
    catch {
        return null;
    }
};
const resolveOAuthClientOrigin = (req) => {
    const queryOrigin = typeof req.query.redirect_origin === "string"
        ? validateAllowedOrigin(req.query.redirect_origin)
        : null;
    if (queryOrigin)
        return queryOrigin;
    const headerOrigin = validateAllowedOrigin(typeof req.headers.origin === "string" ? req.headers.origin : req.headers.referer);
    if (headerOrigin)
        return headerOrigin;
    return (0, env_1.getPrimaryClientUrl)();
};
const consumeOAuthClientOrigin = (req, res) => {
    const cookieOrigin = validateAllowedOrigin(req.cookies?.[OAUTH_ORIGIN_COOKIE]);
    res.clearCookie(OAUTH_ORIGIN_COOKIE, clearCookieOptions);
    return cookieOrigin || (0, env_1.getPrimaryClientUrl)();
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
const googleAuth = (req, res) => {
    const clientUrl = resolveOAuthClientOrigin(req);
    try {
        const isSwitch = req.query.switch === "1" || req.query.prompt === "select_account";
        // If user is switching accounts, clear the active LifeFlow session cookie first
        if (isSwitch) {
            res.clearCookie(COOKIE_NAME, clearCookieOptions);
        }
        const { url, state } = (0, google_service_1.generateGoogleAuthUrl)(true);
        // Store CSRF state & validated client origin in secure httpOnly cookies (valid for 10 minutes)
        res.cookie("oauth_state", state, oauthCookieOptions);
        res.cookie(OAUTH_ORIGIN_COOKIE, clientUrl, oauthCookieOptions);
        res.redirect(url);
    }
    catch (error) {
        console.error("❌ Google auth initiation error:", error?.message || error);
        res.redirect(`${clientUrl}/login?error=google_disabled`);
    }
};
exports.googleAuth = googleAuth;
// GET /api/auth/google/callback
const googleCallback = async (req, res) => {
    const clientUrl = consumeOAuthClientOrigin(req, res);
    try {
        const { code, state, error: googleError } = req.query;
        // If user cancelled or Google returned an error
        if (googleError) {
            const errParam = typeof googleError === "string" ? googleError : "access_denied";
            res.redirect(`${clientUrl}/login?error=${encodeURIComponent(errParam)}`);
            return;
        }
        // Validate state for CSRF protection
        const cookieState = req.cookies?.oauth_state;
        res.clearCookie("oauth_state", clearCookieOptions);
        if (!state || !cookieState || state !== cookieState) {
            res.redirect(`${clientUrl}/login?error=state_mismatch`);
            return;
        }
        if (!code || typeof code !== "string") {
            res.redirect(`${clientUrl}/login?error=missing_code`);
            return;
        }
        const result = await (0, google_service_1.handleGoogleCallbackService)(code);
        // Set the LifeFlow JWT in the secure HTTP-only cookie
        res.cookie(COOKIE_NAME, result.token, cookieOptions);
        // Redirect directly to the dashboard
        res.redirect(`${clientUrl}/dashboard`);
    }
    catch (error) {
        const msg = error?.message || "Google authentication failed";
        console.error("❌ Google callback error:", msg);
        res.redirect(`${clientUrl}/login?error=${encodeURIComponent(msg)}`);
    }
};
exports.googleCallback = googleCallback;
// GET /api/auth/github
const githubAuth = (req, res) => {
    const clientUrl = resolveOAuthClientOrigin(req);
    try {
        const isSwitch = req.query.switch === "1" || req.query.prompt === "select_account";
        // If user is switching accounts, clear the active LifeFlow session cookie first
        if (isSwitch) {
            res.clearCookie(COOKIE_NAME, clearCookieOptions);
        }
        const { url, state } = (0, github_service_1.generateGithubAuthUrl)(true);
        // Store CSRF state & validated client origin in secure httpOnly cookies (valid for 10 minutes)
        res.cookie("oauth_state", state, oauthCookieOptions);
        res.cookie(OAUTH_ORIGIN_COOKIE, clientUrl, oauthCookieOptions);
        res.redirect(url);
    }
    catch (error) {
        console.error("❌ GitHub auth initiation error:", error?.message || error);
        res.redirect(`${clientUrl}/login?error=github_disabled`);
    }
};
exports.githubAuth = githubAuth;
// GET /api/auth/github/callback
const githubCallback = async (req, res) => {
    const clientUrl = consumeOAuthClientOrigin(req, res);
    try {
        const { code, state, error: ghError, error_description } = req.query;
        // If user cancelled or GitHub returned an error
        if (ghError) {
            const errParam = typeof error_description === "string"
                ? error_description
                : typeof ghError === "string"
                    ? ghError
                    : "access_denied";
            res.redirect(`${clientUrl}/login?error=${encodeURIComponent(errParam)}`);
            return;
        }
        // Validate state for CSRF protection
        const cookieState = req.cookies?.oauth_state;
        res.clearCookie("oauth_state", clearCookieOptions);
        if (!state || !cookieState || state !== cookieState) {
            res.redirect(`${clientUrl}/login?error=state_mismatch`);
            return;
        }
        if (!code || typeof code !== "string") {
            res.redirect(`${clientUrl}/login?error=missing_code`);
            return;
        }
        const result = await (0, github_service_1.handleGithubCallbackService)(code);
        // Set the LifeFlow JWT in the secure HTTP-only cookie
        res.cookie(COOKIE_NAME, result.token, cookieOptions);
        // Redirect directly to the dashboard
        res.redirect(`${clientUrl}/dashboard`);
    }
    catch (error) {
        const msg = error?.message || "GitHub authentication failed";
        console.error("❌ GitHub callback error:", msg);
        res.redirect(`${clientUrl}/login?error=${encodeURIComponent(msg)}`);
    }
};
exports.githubCallback = githubCallback;
