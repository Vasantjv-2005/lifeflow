import { Router } from "express";

import {
    register,
    login,
    logout,
    getCurrentUser,
    googleAuth,
    googleCallback,
    githubAuth,
    githubCallback,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// GET /api/auth/google (initiates Google OAuth)
router.get("/google", googleAuth);

// GET /api/auth/google/callback (Google OAuth callback)
router.get("/google/callback", googleCallback);

// GET /api/auth/github (initiates GitHub OAuth)
router.get("/github", githubAuth);

// GET /api/auth/github/callback (GitHub OAuth callback)
router.get("/github/callback", githubCallback);

// POST /api/auth/register (rate-limited)
router.post("/register", authRateLimiter, register);

// POST /api/auth/login (rate-limited)
router.post("/login", authRateLimiter, login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", authMiddleware, getCurrentUser);

export default router;
