"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
// Require authentication for AI requests.
router.use(auth_middleware_1.authMiddleware);
// POST /api/ai/generate-scenarios (rate-limited)
router.post("/generate-scenarios", rateLimit_middleware_1.aiRateLimiter, ai_controller_1.generateScenariosController);
exports.default = router;
