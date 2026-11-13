"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const user_service_1 = require("../services/user/user.service");
const getUserId = (req) => {
    return req.user?.userId;
};
// GET /api/users/me
const getProfile = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const user = await (0, user_service_1.getUserProfile)(userId);
        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully.",
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
// PATCH /api/users/me
const updateProfile = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const updatedUser = await (0, user_service_1.updateUserProfile)(userId, req.body);
        res.status(200).json({
            success: true,
            message: "User profile updated successfully.",
            data: { user: updatedUser },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
// PATCH /api/users/me/password
const changePassword = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        await (0, user_service_1.changeUserPassword)(userId, req.body);
        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
// DELETE /api/users/me
const deleteAccount = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        await (0, user_service_1.deleteUserAccount)(userId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAccount = deleteAccount;
