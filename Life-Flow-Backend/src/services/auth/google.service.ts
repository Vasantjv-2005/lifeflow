import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { env } from "../../config/env";
import User, { type IUser } from "../../models/User";
import { generateToken } from "../../utils/jwt";
import { AppError } from "../../middleware/error.middleware";
import type { AuthServiceResult } from "./auth.service";

/**
 * Returns a configured Google OAuth2Client.
 */
export const getGoogleOAuthClient = (): OAuth2Client => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw new AppError(
            "Google OAuth is not configured on this server. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
            500
        );
    }

    return new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_CALLBACK_URL
    );
};

/**
 * Generates Google's authorization URL with minimum required scopes
 * and a cryptographically secure random state parameter for CSRF prevention.
 */
export const generateGoogleAuthUrl = (
    promptSelect: boolean = true
): { url: string; state: string } => {
    const client = getGoogleOAuthClient();
    const state = crypto.randomBytes(32).toString("hex");

    const url = client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "email", "profile"],
        state,
        prompt: promptSelect ? "select_account" : undefined,
    });

    return { url, state };
};

/**
 * Exchanges Google authorization code, verifies the ID token with Google's official library,
 * checks token claims (audience, issuer, verified email), and finds or creates the user in MongoDB.
 */
export const handleGoogleCallbackService = async (
    code: string
): Promise<AuthServiceResult> => {
    const client = getGoogleOAuthClient();

    let tokens;
    try {
        const tokenRes = await client.getToken(code);
        tokens = tokenRes.tokens;
    } catch (err: unknown) {
        const msg = (err as Error)?.message || "Token exchange failed";
        console.error("❌ Google token exchange error:", msg);
        throw new AppError(`Failed to exchange authorization code with Google: ${msg}`, 400);
    }

    if (!tokens.id_token) {
        throw new AppError("Google authentication failed: no ID token returned.", 400);
    }

    // Verify ID token server-side using Google's official verifyIdToken
    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: env.GOOGLE_CLIENT_ID,
        });
    } catch (err: unknown) {
        const msg = (err as Error)?.message || "Token verification failed";
        console.error("❌ Google ID token verification error:", msg);
        throw new AppError(`Invalid Google ID token: ${msg}`, 401);
    }

    const payload = ticket.getPayload();
    if (!payload) {
        throw new AppError("Invalid Google ID token payload.", 401);
    }

    // Validate claims
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!googleId || !email) {
        throw new AppError("Google profile is missing essential identity information.", 400);
    }

    if (!email_verified) {
        throw new AppError("Your Google email address is not verified by Google.", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = name?.trim() || normalizedEmail.split("@")[0] || "LifeFlow User";

    // 1. Check if user already exists by googleId
    let user: IUser | null = await User.findOne({ googleId });

    if (!user) {
        // 2. Check if user exists by verified email (secure account linking)
        const existingByEmail = await User.findOne({ email: normalizedEmail });

        if (existingByEmail) {
            // Link Google identity to existing account
            existingByEmail.googleId = googleId;
            if (!existingByEmail.profilePicture && picture) {
                existingByEmail.profilePicture = picture;
            }
            existingByEmail.emailVerified = true;
            user = await existingByEmail.save();
        } else {
            // 3. Create a brand new Google user in MongoDB
            user = await User.create({
                name: displayName,
                email: normalizedEmail,
                googleId,
                profilePicture: picture || "",
                authProvider: "google",
                emailVerified: true,
            });
        }
    } else {
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
    const token = generateToken(user._id.toString());

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
