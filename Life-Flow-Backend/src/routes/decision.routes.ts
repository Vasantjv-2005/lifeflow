import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    createDecision,
    getDecisions,
    getDecisionById,
    updateDecision,
    deleteDecision,
} from "../controllers/decision.controller";
import {
    chatWithAdvisor,
    getAdvisorHistory,
    clearAdvisorHistory,
    getScenarioComparison,
} from "../controllers/decisionAdvisor.controller";

const router = Router();

// All decision routes require authentication
router.use(authMiddleware);

// POST /api/decisions - Create a new decision
router.post("/", createDecision);

// GET /api/decisions - Get all decisions for the authenticated user
router.get("/", getDecisions);

// GET /api/decisions/:id - Get a single decision by ID
router.get("/:id", getDecisionById);

// PATCH /api/decisions/:id - Update an existing decision
router.patch("/:id", updateDecision);

// DELETE /api/decisions/:id - Delete a decision
router.delete("/:id", deleteDecision);

// ==================== AI DECISION ADVISOR & SCENARIO COMPARISON ====================
// POST /api/decisions/:decisionId/advisor/chat - Send message to AI Advisor
router.post("/:decisionId/advisor/chat", chatWithAdvisor);

// GET /api/decisions/:decisionId/advisor/history - Get conversation history
router.get("/:decisionId/advisor/history", getAdvisorHistory);

// DELETE /api/decisions/:decisionId/advisor/history - Clear conversation history
router.delete("/:decisionId/advisor/history", clearAdvisorHistory);

// GET /api/decisions/:decisionId/scenarios/comparison - 6-dimension scenario comparison
router.get("/:decisionId/scenarios/comparison", getScenarioComparison);

export default router;
