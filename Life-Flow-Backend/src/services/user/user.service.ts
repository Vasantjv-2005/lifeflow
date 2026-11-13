import mongoose from "mongoose";

import User, { type IUser } from "../../models/User";
import Decision from "../../models/Decision";
import Simulation from "../../models/Simulation";
import Scenario from "../../models/Scenario";
import { hashPassword, comparePassword } from "../../utils/password";
import { AppError } from "../../middleware/error.middleware";
import type { PublicUser } from "../../types/auth.types";
import {
    updateProfileSchema,
    changePasswordSchema,
    type UpdateProfileInput,
    type ChangePasswordInput,
} from "../../validators/user.validator";

const toPublicUser = (user: IUser): PublicUser => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const validateUserId = (userId: string): void => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("Invalid user ID.", 400);
    }
};

/**
 * Retrieves a user's public profile by ID.
 */
export const getUserProfile = async (userId: string): Promise<PublicUser> => {
    validateUserId(userId);

    const user = await User.findById(userId).exec();

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    return toPublicUser(user);
};

/**
 * Updates a user's profile details.
 */
export const updateUserProfile = async (
    userId: string,
    input: unknown
): Promise<PublicUser> => {
    validateUserId(userId);

    const validation = updateProfileSchema.safeParse(input);

    if (!validation.success) {
        const errorMsg = validation.error.issues
            .map((i) => i.message)
            .join("; ");
        throw new AppError(errorMsg || "Invalid update data.", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: validation.data },
        { new: true, runValidators: true }
    ).exec();

    if (!updatedUser) {
        throw new AppError("User not found.", 404);
    }

    return toPublicUser(updatedUser);
};

/**
 * Changes a user's password after verifying the existing password.
 */
export const changeUserPassword = async (
    userId: string,
    input: unknown
): Promise<void> => {
    validateUserId(userId);

    const validation = changePasswordSchema.safeParse(input);

    if (!validation.success) {
        const errorMsg = validation.error.issues
            .map((i) => i.message)
            .join("; ");
        throw new AppError(errorMsg || "Invalid password data.", 400);
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await User.findById(userId).select("+password").exec();

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    const passwordMatches = await comparePassword(
        currentPassword,
        user.password
    );

    if (!passwordMatches) {
        throw new AppError("Current password is incorrect.", 401);
    }

    user.password = await hashPassword(newPassword);
    await user.save();
};

/**
 * Deletes a user account and cascades deletion to their simulations, scenarios, and decisions.
 */
export const deleteUserAccount = async (userId: string): Promise<void> => {
    validateUserId(userId);

    const user = await User.findByIdAndDelete(userId).exec();

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    // Cascade delete user data
    await Promise.all([
        Decision.deleteMany({ userId }).exec(),
        Simulation.deleteMany({ userId }).exec(),
        Scenario.deleteMany({ userId }).exec(),
    ]);
};

