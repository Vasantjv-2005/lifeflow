"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = exports.changeUserPassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../../models/User"));
const Decision_1 = __importDefault(require("../../models/Decision"));
const Simulation_1 = __importDefault(require("../../models/Simulation"));
const Scenario_1 = __importDefault(require("../../models/Scenario"));
const password_1 = require("../../utils/password");
const error_middleware_1 = require("../../middleware/error.middleware");
const user_validator_1 = require("../../validators/user.validator");
const toPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const validateUserId = (userId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        throw new error_middleware_1.AppError("Invalid user ID.", 400);
    }
};
/**
 * Retrieves a user's public profile by ID.
 */
const getUserProfile = async (userId) => {
    validateUserId(userId);
    const user = await User_1.default.findById(userId).exec();
    if (!user) {
        throw new error_middleware_1.AppError("User not found.", 404);
    }
    return toPublicUser(user);
};
exports.getUserProfile = getUserProfile;
/**
 * Updates a user's profile details.
 */
const updateUserProfile = async (userId, input) => {
    validateUserId(userId);
    const validation = user_validator_1.updateProfileSchema.safeParse(input);
    if (!validation.success) {
        const errorMsg = validation.error.issues
            .map((i) => i.message)
            .join("; ");
        throw new error_middleware_1.AppError(errorMsg || "Invalid update data.", 400);
    }
    const updatedUser = await User_1.default.findByIdAndUpdate(userId, { $set: validation.data }, { new: true, runValidators: true }).exec();
    if (!updatedUser) {
        throw new error_middleware_1.AppError("User not found.", 404);
    }
    return toPublicUser(updatedUser);
};
exports.updateUserProfile = updateUserProfile;
/**
 * Changes a user's password after verifying the existing password.
 */
const changeUserPassword = async (userId, input) => {
    validateUserId(userId);
    const validation = user_validator_1.changePasswordSchema.safeParse(input);
    if (!validation.success) {
        const errorMsg = validation.error.issues
            .map((i) => i.message)
            .join("; ");
        throw new error_middleware_1.AppError(errorMsg || "Invalid password data.", 400);
    }
    const { currentPassword, newPassword } = validation.data;
    const user = await User_1.default.findById(userId).select("+password").exec();
    if (!user) {
        throw new error_middleware_1.AppError("User not found.", 404);
    }
    const passwordMatches = await (0, password_1.comparePassword)(currentPassword, user.password);
    if (!passwordMatches) {
        throw new error_middleware_1.AppError("Current password is incorrect.", 401);
    }
    user.password = await (0, password_1.hashPassword)(newPassword);
    await user.save();
};
exports.changeUserPassword = changeUserPassword;
/**
 * Deletes a user account and cascades deletion to their simulations, scenarios, and decisions.
 */
const deleteUserAccount = async (userId) => {
    validateUserId(userId);
    const user = await User_1.default.findByIdAndDelete(userId).exec();
    if (!user) {
        throw new error_middleware_1.AppError("User not found.", 404);
    }
    // Cascade delete user data
    await Promise.all([
        Decision_1.default.deleteMany({ userId }).exec(),
        Simulation_1.default.deleteMany({ userId }).exec(),
        Scenario_1.default.deleteMany({ userId }).exec(),
    ]);
};
exports.deleteUserAccount = deleteUserAccount;
