import { Router } from "express";

import {
    register,
    login,
    logout,
    getCurrentUser,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// POST /api/auth/register (rate-limited)
router.post("/register", authRateLimiter, register);

// POST /api/auth/login (rate-limited)
router.post("/login", authRateLimiter, login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", authMiddleware, getCurrentUser);

export default router;
