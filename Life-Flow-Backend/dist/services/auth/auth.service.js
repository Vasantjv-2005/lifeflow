"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../../models/User"));
const auth_validator_1 = require("../../validators/auth.validator");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const error_middleware_1 = require("../../middleware/error.middleware");
/**
 * Converts a Mongoose user document into a safe public object.
 * Passwords and password hashes are never returned.
 */
const toPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || "",
    authProvider: user.authProvider || "local",
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
/**
 * Registers a new LifeFlow user.
 *
 * Validates the input, checks for an existing account,
 * hashes the password, saves the user, and generates a JWT.
 */
const registerUser = async (input) => {
    const validatedData = auth_validator_1.registerSchema.parse(input);
    const existingUser = await User_1.default.findOne({
        email: validatedData.email,
    });
    if (existingUser) {
        throw new error_middleware_1.AppError("An account with this email already exists.", 409);
    }
    const hashedPassword = await (0, password_1.hashPassword)(validatedData.password);
    const user = await User_1.default.create({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
    });
    const token = (0, jwt_1.generateToken)(user._id.toString());
    return {
        user: toPublicUser(user),
        token,
    };
};
exports.registerUser = registerUser;
/**
 * Authenticates an existing user.
 *
 * Validates login input, retrieves the password hash,
 * compares the supplied password, and generates a JWT.
 */
const loginUser = async (input) => {
    const validatedData = auth_validator_1.loginSchema.parse(input);
    // Password is excluded by default in the User model.
    const user = await User_1.default.findOne({
        email: validatedData.email,
    }).select("+password");
    if (!user) {
        throw new error_middleware_1.AppError("Invalid email or password.", 401);
    }
    if (!user.password) {
        throw new error_middleware_1.AppError("This account uses Google Sign-In. Please sign in with Google.", 401);
    }
    const passwordMatches = await (0, password_1.comparePassword)(validatedData.password, user.password);
    if (!passwordMatches) {
        throw new error_middleware_1.AppError("Invalid email or password.", 401);
    }
    const token = (0, jwt_1.generateToken)(user._id.toString());
    return {
        user: toPublicUser(user),
        token,
    };
};
exports.loginUser = loginUser;
/**
 * Retrieves the authenticated user's public profile.
 *
 * The userId must come from verified authentication middleware,
 * never directly from an untrusted request body.
 */
const getUserProfile = async (userId) => {
    const user = await User_1.default.findById(userId);
    if (!user) {
        throw new error_middleware_1.AppError("User not found.", 404);
    }
    return toPublicUser(user);
};
exports.getUserProfile = getUserProfile;
