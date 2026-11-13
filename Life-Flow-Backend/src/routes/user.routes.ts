import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
} from "../controllers/user.controller";

const router = Router();

// All user routes require authentication.
router.use(authMiddleware);

// GET /api/users/me - Get current user profile
router.get("/me", getProfile);

// PATCH /api/users/me - Update user profile
router.patch("/me", updateProfile);

// PATCH /api/users/me/password - Change user password
router.patch("/me/password", changePassword);

// DELETE /api/users/me - Delete user account and cascade delete their data
router.delete("/me", deleteAccount);

export default router;
