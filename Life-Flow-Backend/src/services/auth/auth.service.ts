
import User, { type IUser } from "../../models/User";
import { registerSchema, loginSchema } from "../../validators/auth.validator";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { AppError } from "../../middleware/error.middleware";
import type {
    PublicUser,
    RegisterRequestBody,
    LoginRequestBody,
} from "../../types/auth.types";

/**
 * Result returned by registration and login services.
 *
 * The token is intended for the authentication controller
 * to place in an HTTP-only cookie, not in the JSON response.
 */
export interface AuthServiceResult {
    user: PublicUser;
    token: string;
}

/**
 * Converts a Mongoose user document into a safe public object.
 * Passwords and password hashes are never returned.
 */
const toPublicUser = (user: IUser): PublicUser => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

/**
 * Registers a new LifeFlow user.
 *
 * Validates the input, checks for an existing account,
 * hashes the password, saves the user, and generates a JWT.
 */
export const registerUser = async (
    input: RegisterRequestBody
): Promise<AuthServiceResult> => {
    const validatedData = registerSchema.parse(input);

    const existingUser = await User.findOne({
        email: validatedData.email,
    });

    if (existingUser) {
        throw new AppError(
            "An account with this email already exists.",
            409
        );
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await User.create({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
    });

    const token = generateToken(user._id.toString());

    return {
        user: toPublicUser(user),
        token,
    };
};

/**
 * Authenticates an existing user.
 *
 * Validates login input, retrieves the password hash,
 * compares the supplied password, and generates a JWT.
 */
export const loginUser = async (
    input: LoginRequestBody
): Promise<AuthServiceResult> => {
    const validatedData = loginSchema.parse(input);

    // Password is excluded by default in the User model.
    const user = await User.findOne({
        email: validatedData.email,
    }).select("+password");

    if (!user) {
        throw new AppError("Invalid email or password.", 401);
    }

    const passwordMatches = await comparePassword(
        validatedData.password,
        user.password
    );

    if (!passwordMatches) {
        throw new AppError("Invalid email or password.", 401);
    }

    const token = generateToken(user._id.toString());

    return {
        user: toPublicUser(user),
        token,
    };
};

/**
 * Retrieves the authenticated user's public profile.
 *
 * The userId must come from verified authentication middleware,
 * never directly from an untrusted request body.
 */
export const getUserProfile = async (
    userId: string
): Promise<PublicUser> => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    return toPublicUser(user);
};
