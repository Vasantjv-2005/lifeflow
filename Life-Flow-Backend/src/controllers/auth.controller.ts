import type { Request, Response, NextFunction } from "express";

import { env, getAllowedClientOrigins, getPrimaryClientUrl } from "../config/env";
import {
    registerUser,
    loginUser,
    getUserProfile,
} from "../services/auth/auth.service";
import {
    generateGoogleAuthUrl,
    handleGoogleCallbackService,
} from "../services/auth/google.service";
import {
    generateGithubAuthUrl,
    handleGithubCallbackService,
} from "../services/auth/github.service";

const COOKIE_NAME = "accessToken";
const OAUTH_ORIGIN_COOKIE = "oauth_client_origin";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const isProduction = env.NODE_ENV === "production" || process.env.RENDER === "true";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: COOKIE_MAX_AGE,
};

const oauthCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: 10 * 60 * 1000,
};

const clearCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
};

const validateAllowedOrigin = (candidate?: string): string | null => {
    if (!candidate) return null;
    try {
        const parsedOrigin = new URL(candidate).origin;
        const allowed = getAllowedClientOrigins();
        return allowed.includes(parsedOrigin) ? parsedOrigin : null;
    } catch {
        return null;
    }
};

const resolveOAuthClientOrigin = (req: Request): string => {
    const queryOrigin =
        typeof req.query.redirect_origin === "string"
            ? validateAllowedOrigin(req.query.redirect_origin)
            : null;
    if (queryOrigin) return queryOrigin;

    const headerOrigin = validateAllowedOrigin(
        typeof req.headers.origin === "string" ? req.headers.origin : req.headers.referer
    );
    if (headerOrigin) return headerOrigin;

    return getPrimaryClientUrl();
};

const consumeOAuthClientOrigin = (req: Request, res: Response): string => {
    const cookieOrigin = validateAllowedOrigin(req.cookies?.[OAUTH_ORIGIN_COOKIE]);
    res.clearCookie(OAUTH_ORIGIN_COOKIE, clearCookieOptions);
    return cookieOrigin || getPrimaryClientUrl();
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

// GET /api/auth/google
export const googleAuth = (
    req: Request,
    res: Response
): void => {
    const clientUrl = resolveOAuthClientOrigin(req);
    try {
        const isSwitch = req.query.switch === "1" || req.query.prompt === "select_account";

        // If user is switching accounts, clear the active LifeFlow session cookie first
        if (isSwitch) {
            res.clearCookie(COOKIE_NAME, clearCookieOptions);
        }

        const { url, state } = generateGoogleAuthUrl(true);

        // Store CSRF state & validated client origin in secure httpOnly cookies (valid for 10 minutes)
        res.cookie("oauth_state", state, oauthCookieOptions);
        res.cookie(OAUTH_ORIGIN_COOKIE, clientUrl, oauthCookieOptions);

        res.redirect(url);
    } catch (error: unknown) {
        console.error("❌ Google auth initiation error:", (error as Error)?.message || error);
        res.redirect(`${clientUrl}/login?error=google_disabled`);
    }
};

// GET /api/auth/google/callback
export const googleCallback = async (
    req: Request,
    res: Response
): Promise<void> => {
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

        const result = await handleGoogleCallbackService(code);

        // Set the LifeFlow JWT in the secure HTTP-only cookie
        res.cookie(COOKIE_NAME, result.token, cookieOptions);

        // Redirect directly to the dashboard
        res.redirect(`${clientUrl}/dashboard`);
    } catch (error: unknown) {
        const msg = (error as Error)?.message || "Google authentication failed";
        console.error("❌ Google callback error:", msg);
        res.redirect(`${clientUrl}/login?error=${encodeURIComponent(msg)}`);
    }
};

// GET /api/auth/github
export const githubAuth = (
    req: Request,
    res: Response
): void => {
    const clientUrl = resolveOAuthClientOrigin(req);
    try {
        const isSwitch = req.query.switch === "1" || req.query.prompt === "select_account";

        // If user is switching accounts, clear the active LifeFlow session cookie first
        if (isSwitch) {
            res.clearCookie(COOKIE_NAME, clearCookieOptions);
        }

        const { url, state } = generateGithubAuthUrl(true);

        // Store CSRF state & validated client origin in secure httpOnly cookies (valid for 10 minutes)
        res.cookie("oauth_state", state, oauthCookieOptions);
        res.cookie(OAUTH_ORIGIN_COOKIE, clientUrl, oauthCookieOptions);

        res.redirect(url);
    } catch (error: unknown) {
        console.error("❌ GitHub auth initiation error:", (error as Error)?.message || error);
        res.redirect(`${clientUrl}/login?error=github_disabled`);
    }
};

// GET /api/auth/github/callback
export const githubCallback = async (
    req: Request,
    res: Response
): Promise<void> => {
    const clientUrl = consumeOAuthClientOrigin(req, res);
    try {
        const { code, state, error: ghError, error_description } = req.query;

        // If user cancelled or GitHub returned an error
        if (ghError) {
            const errParam =
                typeof error_description === "string"
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

        const result = await handleGithubCallbackService(code);

        // Set the LifeFlow JWT in the secure HTTP-only cookie
        res.cookie(COOKIE_NAME, result.token, cookieOptions);

        // Redirect directly to the dashboard
        res.redirect(`${clientUrl}/dashboard`);
    } catch (error: unknown) {
        const msg = (error as Error)?.message || "GitHub authentication failed";
        console.error("❌ GitHub callback error:", msg);
        res.redirect(`${clientUrl}/login?error=${encodeURIComponent(msg)}`);
    }
};
