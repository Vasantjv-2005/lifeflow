"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// All user routes require authentication.
router.use(auth_middleware_1.authMiddleware);
// GET /api/users/me - Get current user profile
router.get("/me", user_controller_1.getProfile);
// PATCH /api/users/me - Update user profile
router.patch("/me", user_controller_1.updateProfile);
// PATCH /api/users/me/password - Change user password
router.patch("/me/password", user_controller_1.changePassword);
// DELETE /api/users/me - Delete user account and cascade delete their data
router.delete("/me", user_controller_1.deleteAccount);
exports.default = router;
