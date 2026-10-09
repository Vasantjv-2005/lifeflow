
import type { JwtPayload } from "jsonwebtoken";

/**
 * Represents the authenticated user's identity.
 *
 * Attach this information to the request after verifying
 * the user's authentication token.
 */
export interface AuthenticatedUserInfo {
    userId: string;
}

/**
 * Defines the expected claims in a LifeFlow JWT.
 *
 * The userId identifies the authenticated user.
 * JwtPayload provides standard JWT claims such as issuer,
 * subject, and expiration time.
 */
export interface AuthTokenClaims extends JwtPayload {
    userId: string;
}

/**
 * Represents safe user information that can be returned
 * to the frontend.
 *
 * Passwords and password hashes must never be included.
 */
export interface PublicUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Standard data returned after successful authentication.
 *
 * Authentication tokens should be stored in the configured
 * HTTP-only cookie rather than exposed in this response.
 */
export interface AuthResponseData {
    user: PublicUser;
}

/**
 * Represents the expected registration request body.
 */
export interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
}

/**
 * Represents the expected login request body.
 */
export interface LoginRequestBody {
    email: string;
    password: string;
}

/**
 * Represents the authenticated user context available
 * to protected application logic.
 */
export interface AuthContext {
    userId: string;
}
