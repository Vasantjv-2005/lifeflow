
import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    generateScenariosController,
} from "../controllers/ai.controller";

const router = Router();

// Require authentication for AI requests.
router.use(authMiddleware);

// POST /api/ai/generate-scenarios
router.post("/generate-scenarios", generateScenariosController);

export default router;
