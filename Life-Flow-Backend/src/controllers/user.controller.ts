import type { Request, Response, NextFunction } from "express";

import {
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
} from "../services/user/user.service";

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

const getUserId = (req: Request): string | undefined => {
    return (req as AuthenticatedRequest).user?.userId;
};

// GET /api/users/me
export const getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

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

// PATCH /api/users/me
export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        const updatedUser = await updateUserProfile(userId, req.body);

        res.status(200).json({
            success: true,
            message: "User profile updated successfully.",
            data: { user: updatedUser },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// PATCH /api/users/me/password
export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        await changeUserPassword(userId, req.body);

        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error: unknown) {
        next(error);
    }
};

// DELETE /api/users/me
export const deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        await deleteUserAccount(userId);

        // Clear auth cookie
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });

        res.status(200).json({
            success: true,
            message: "User account and all associated data deleted successfully.",
        });
    } catch (error: unknown) {
        next(error);
    }
};

