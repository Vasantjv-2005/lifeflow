"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGithubCallbackService = exports.generateGithubAuthUrl = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const User_1 = __importDefault(require("../../models/User"));
const jwt_1 = require("../../utils/jwt");
const error_middleware_1 = require("../../middleware/error.middleware");
/**
 * Validates that GitHub OAuth is properly configured in environment variables.
 */
const assertGithubConfigured = () => {
    if (!env_1.env.GITHUB_CLIENT_ID || !env_1.env.GITHUB_CLIENT_SECRET) {
        throw new error_middleware_1.AppError("GitHub OAuth is not configured on this server. Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.", 500);
    }
};
/**
 * Generates GitHub's authorization URL with scopes `read:user user:email`
 * and a cryptographically secure random state parameter for CSRF prevention.
 */
const generateGithubAuthUrl = (_promptSelect = true) => {
    assertGithubConfigured();
    const state = crypto_1.default.randomBytes(32).toString("hex");
    const params = new URLSearchParams({
        client_id: env_1.env.GITHUB_CLIENT_ID,
        redirect_uri: env_1.env.GITHUB_CALLBACK_URL,
        scope: "read:user user:email",
        state,
        allow_signup: "true",
    });
    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    return { url, state };
};
exports.generateGithubAuthUrl = generateGithubAuthUrl;
/**
 * Handles the GitHub OAuth 2.0 authorization code exchange, profile & verified email retrieval,
 * and finds or creates the corresponding user in MongoDB.
 */
const handleGithubCallbackService = async (code) => {
    assertGithubConfigured();
    // 1. Exchange authorization code for GitHub access token
    let tokenData;
    try {
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "User-Agent": "LifeFlow-App",
            },
            body: JSON.stringify({
                client_id: env_1.env.GITHUB_CLIENT_ID,
                client_secret: env_1.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: env_1.env.GITHUB_CALLBACK_URL,
            }),
        });
        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            throw new Error(`GitHub token exchange responded with HTTP ${tokenRes.status}: ${errText}`);
        }
        tokenData = (await tokenRes.json());
    }
    catch (err) {
        const msg = err?.message || "Token exchange failed";
        console.error("❌ GitHub token exchange error:", msg);
        throw new error_middleware_1.AppError(`Failed to exchange authorization code with GitHub: ${msg}`, 400);
    }
    if (tokenData.error || !tokenData.access_token) {
        const reason = tokenData.error_description || tokenData.error || "No access token received";
        console.error("❌ GitHub OAuth token error:", reason);
        throw new error_middleware_1.AppError(`GitHub authentication failed: ${reason}`, 400);
    }
    const accessToken = tokenData.access_token;
    // 2. Fetch authenticated GitHub user's profile
    let profile;
    try {
        const profileRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "LifeFlow-App",
            },
        });
        if (!profileRes.ok) {
            throw new Error(`GitHub user API returned HTTP ${profileRes.status}`);
        }
        profile = (await profileRes.json());
    }
    catch (err) {
        const msg = err?.message || "Profile fetch failed";
        console.error("❌ GitHub user profile fetch error:", msg);
        throw new error_middleware_1.AppError(`Failed to fetch user profile from GitHub: ${msg}`, 400);
    }
    if (!profile.id) {
        throw new error_middleware_1.AppError("GitHub profile is missing a stable account identifier.", 400);
    }
    const githubId = String(profile.id);
    // 3. Retrieve user's emails via GitHub email API (handles private emails)
    let verifiedEmail = null;
    try {
        const emailRes = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "LifeFlow-App",
            },
        });
        if (emailRes.ok) {
            const emails = (await emailRes.json());
            if (Array.isArray(emails) && emails.length > 0) {
                // Prefer primary verified email
                const primaryVerified = emails.find((e) => e.verified && e.primary);
                if (primaryVerified) {
                    verifiedEmail = primaryVerified.email.toLowerCase().trim();
                }
                else {
                    // Fallback to any verified email
                    const anyVerified = emails.find((e) => e.verified);
                    if (anyVerified) {
                        verifiedEmail = anyVerified.email.toLowerCase().trim();
                    }
                }
            }
        }
    }
    catch (emailErr) {
        console.warn("⚠️ Warning: Failed to fetch emails from GitHub emails endpoint:", emailErr?.message);
    }
    // Fallback: If emails endpoint wasn't accessible but profile has a public email
    if (!verifiedEmail && profile.email) {
        verifiedEmail = profile.email.toLowerCase().trim();
    }
    if (!verifiedEmail) {
        throw new error_middleware_1.AppError("No verified email address found on your GitHub account. Please make a verified email available on GitHub before signing in.", 400);
    }
    const normalizedEmail = verifiedEmail;
    const displayName = profile.name?.trim() ||
        profile.login ||
        normalizedEmail.split("@")[0] ||
        "LifeFlow User";
    const avatarUrl = profile.avatar_url || "";
    // 4. Find or create user in MongoDB
    let user = await User_1.default.findOne({ githubId });
    if (!user) {
        // Safe account linking: Check if an account already exists with this verified email
        const existingByEmail = await User_1.default.findOne({ email: normalizedEmail });
        if (existingByEmail) {
            // Safely link the verified GitHub identity to the existing verified email account
            existingByEmail.githubId = githubId;
            if (!existingByEmail.profilePicture && avatarUrl) {
                existingByEmail.profilePicture = avatarUrl;
            }
            existingByEmail.emailVerified = true;
            user = await existingByEmail.save();
        }
        else {
            // Create a brand new GitHub user in MongoDB
            user = await User_1.default.create({
                name: displayName,
                email: normalizedEmail,
                githubId,
                profilePicture: avatarUrl,
                authProvider: "github",
                emailVerified: true,
            });
        }
    }
    else {
        // User already exists with this githubId: update profile details if changed on GitHub
        let changed = false;
        if (avatarUrl && user.profilePicture !== avatarUrl) {
            user.profilePicture = avatarUrl;
            changed = true;
        }
        if (displayName && user.name !== displayName && user.authProvider === "github") {
            user.name = displayName;
            changed = true;
        }
        if (changed) {
            await user.save();
        }
    }
    // 5. Generate LifeFlow session JWT using existing utility
    const token = (0, jwt_1.generateToken)(user._id.toString());
    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            authProvider: user.authProvider,
            googleId: user.googleId,
            githubId: user.githubId,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        token,
    };
};
exports.handleGithubCallbackService = handleGithubCallbackService;
