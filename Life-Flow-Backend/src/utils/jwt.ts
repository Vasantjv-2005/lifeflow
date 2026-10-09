
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

/**
 * Represents the payload stored inside a LifeFlow JWT.
 */
export interface AuthTokenPayload extends JwtPayload {
    userId: string;
}

/**
 * Reads and validates the JWT secret from environment variables.
 * Throws an error if the secret is missing.
 */
const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.trim().length === 0) {
        throw new Error("JWT_SECRET is missing from environment variables.");
    }

    return secret;
};

/**
 * Generates a signed JWT for an authenticated user.
 *
 * @param userId - MongoDB ID of the authenticated user.
 * @returns A signed JWT string.
 */
export const generateToken = (userId: string): string => {
    if (!userId || userId.trim().length === 0) {
        throw new Error("A valid user ID is required to generate a token.");
    }

    const secret = getJwtSecret();

    const options: SignOptions = {
        expiresIn: "7d",
        issuer: "lifeflow-api",
        subject: userId,
    };

    return jwt.sign({ userId }, secret, options);
};

/**
 * Verifies a JWT and validates its expected payload.
 *
 * @param token - JWT string received from the client.
 * @returns The validated authentication payload.
 * @throws If the token is invalid, expired, or has an unexpected payload.
 */
export const verifyToken = (token: string): AuthTokenPayload => {
    if (!token || token.trim().length === 0) {
        throw new Error("A token is required for verification.");
    }

    const secret = getJwtSecret();

    const decoded = jwt.verify(token, secret, {
        issuer: "lifeflow-api",
    });

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "string" ||
        decoded.userId.trim().length === 0
    ) {
        throw new Error("The token payload is invalid.");
    }

    if (decoded.sub !== decoded.userId) {
        throw new Error("The token subject does not match the user ID.");
    }

    return decoded as AuthTokenPayload;
};

/**
 * Decodes a JWT without verifying its signature.
 *
 * This function is for inspection only.
 * Never use its output alone to authenticate a user.
 *
 * @param token - JWT string to decode.
 * @returns The decoded payload, or null if decoding fails.
 */
export const decodeToken = (
    token: string
): AuthTokenPayload | null => {
    if (!token || token.trim().length === 0) {
        return null;
    }

    const decoded = jwt.decode(token);

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "string" ||
        decoded.userId.trim().length === 0
    ) {
        return null;
    }

    return decoded as AuthTokenPayload;
};
