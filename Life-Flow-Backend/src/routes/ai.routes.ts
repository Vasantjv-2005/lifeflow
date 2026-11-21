
import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { aiRateLimiter } from "../middleware/rateLimit.middleware";
import {
    generateScenariosController,
    getCareerJobsController,
} from "../controllers/ai.controller";

const router = Router();

// Require authentication for AI requests.
router.use(authMiddleware);

// POST /api/ai/generate-scenarios (rate-limited)
router.post("/generate-scenarios", aiRateLimiter, generateScenariosController);

// GET /api/ai/career-jobs (research & refresh opportunities across LinkedIn, Naukri, Wellfound)
router.get("/career-jobs", getCareerJobsController);

export default router;
