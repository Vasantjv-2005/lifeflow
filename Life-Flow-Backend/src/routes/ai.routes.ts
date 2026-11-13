
import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { aiRateLimiter } from "../middleware/rateLimit.middleware";
import {
    generateScenariosController,
} from "../controllers/ai.controller";

const router = Router();

// Require authentication for AI requests.
router.use(authMiddleware);

// POST /api/ai/generate-scenarios (rate-limited)
router.post("/generate-scenarios", aiRateLimiter, generateScenariosController);

export default router;
