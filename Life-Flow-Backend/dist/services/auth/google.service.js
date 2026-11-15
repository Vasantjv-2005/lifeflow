"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGoogleCallbackService = exports.generateGoogleAuthUrl = exports.getGoogleOAuthClient = void 0;
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const User_1 = __importDefault(require("../../models/User"));
const jwt_1 = require("../../utils/jwt");
const error_middleware_1 = require("../../middleware/error.middleware");
/**
 * Returns a configured Google OAuth2Client.
 */
const getGoogleOAuthClient = () => {
    if (!env_1.env.GOOGLE_CLIENT_ID || !env_1.env.GOOGLE_CLIENT_SECRET) {
        throw new error_middleware_1.AppError("Google OAuth is not configured on this server. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.", 500);
    }
    return new google_auth_library_1.OAuth2Client(env_1.env.GOOGLE_CLIENT_ID, env_1.env.GOOGLE_CLIENT_SECRET, env_1.env.GOOGLE_CALLBACK_URL);
};
exports.getGoogleOAuthClient = getGoogleOAuthClient;
/**
 * Generates Google's authorization URL with minimum required scopes
 * and a cryptographically secure random state parameter for CSRF prevention.
 */
const generateGoogleAuthUrl = (promptSelect = true) => {
    const client = (0, exports.getGoogleOAuthClient)();
    const state = crypto_1.default.randomBytes(32).toString("hex");
    const url = client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "email", "profile"],
        state,
        prompt: promptSelect ? "select_account" : undefined,
    });
    return { url, state };
};
exports.generateGoogleAuthUrl = generateGoogleAuthUrl;
/**
 * Exchanges Google authorization code, verifies the ID token with Google's official library,
 * checks token claims (audience, issuer, verified email), and finds or creates the user in MongoDB.
 */
const handleGoogleCallbackService = async (code) => {
    const client = (0, exports.getGoogleOAuthClient)();
    let tokens;
    try {
        const tokenRes = await client.getToken(code);
        tokens = tokenRes.tokens;
    }
    catch (err) {
        const msg = err?.message || "Token exchange failed";
        console.error("❌ Google token exchange error:", msg);
        throw new error_middleware_1.AppError(`Failed to exchange authorization code with Google: ${msg}`, 400);
    }
    if (!tokens.id_token) {
        throw new error_middleware_1.AppError("Google authentication failed: no ID token returned.", 400);
    }
    // Verify ID token server-side using Google's official verifyIdToken
    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: env_1.env.GOOGLE_CLIENT_ID,
        });
    }
    catch (err) {
        const msg = err?.message || "Token verification failed";
        console.error("❌ Google ID token verification error:", msg);
        throw new error_middleware_1.AppError(`Invalid Google ID token: ${msg}`, 401);
    }
    const payload = ticket.getPayload();
    if (!payload) {
        throw new error_middleware_1.AppError("Invalid Google ID token payload.", 401);
    }
    // Validate claims
    const { sub: googleId, email, name, picture, email_verified } = payload;
    if (!googleId || !email) {
        throw new error_middleware_1.AppError("Google profile is missing essential identity information.", 400);
    }
    if (!email_verified) {
        throw new error_middleware_1.AppError("Your Google email address is not verified by Google.", 400);
    }
    const normalizedEmail = email.toLowerCase().trim();
    const displayName = name?.trim() || normalizedEmail.split("@")[0] || "LifeFlow User";
    // 1. Check if user already exists by googleId
    let user = await User_1.default.findOne({ googleId });
    if (!user) {
        // 2. Check if user exists by verified email (secure account linking)
        const existingByEmail = await User_1.default.findOne({ email: normalizedEmail });
        if (existingByEmail) {
            // Link Google identity to existing account
            existingByEmail.googleId = googleId;
            if (!existingByEmail.profilePicture && picture) {
                existingByEmail.profilePicture = picture;
            }
            existingByEmail.emailVerified = true;
            user = await existingByEmail.save();
        }
        else {
            // 3. Create a brand new Google user in MongoDB
            user = await User_1.default.create({
                name: displayName,
                email: normalizedEmail,
                googleId,
                profilePicture: picture || "",
                authProvider: "google",
                emailVerified: true,
            });
        }
    }
    else {
        // Update profile picture or display name if updated on Google
        let changed = false;
        if (picture && user.profilePicture !== picture) {
            user.profilePicture = picture;
            changed = true;
        }
        if (displayName && user.name !== displayName && user.authProvider === "google") {
            user.name = displayName;
            changed = true;
        }
        if (changed) {
            await user.save();
        }
    }
    // Generate LifeFlow session JWT using existing utility
    const token = (0, jwt_1.generateToken)(user._id.toString());
    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture || "",
            authProvider: user.authProvider,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        token,
    };
};
exports.handleGoogleCallbackService = handleGoogleCallbackService;
