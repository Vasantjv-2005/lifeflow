"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const decision_controller_1 = require("../controllers/decision.controller");
const decisionAdvisor_controller_1 = require("../controllers/decisionAdvisor.controller");
const router = (0, express_1.Router)();
// All decision routes require authentication
router.use(auth_middleware_1.authMiddleware);
// POST /api/decisions - Create a new decision
router.post("/", decision_controller_1.createDecision);
// GET /api/decisions - Get all decisions for the authenticated user
router.get("/", decision_controller_1.getDecisions);
// GET /api/decisions/:id - Get a single decision by ID
router.get("/:id", decision_controller_1.getDecisionById);
// PATCH /api/decisions/:id - Update an existing decision
router.patch("/:id", decision_controller_1.updateDecision);
// DELETE /api/decisions/:id - Delete a decision
router.delete("/:id", decision_controller_1.deleteDecision);
// ==================== AI DECISION ADVISOR & SCENARIO COMPARISON ====================
// POST /api/decisions/:decisionId/advisor/chat - Send message to AI Advisor
router.post("/:decisionId/advisor/chat", decisionAdvisor_controller_1.chatWithAdvisor);
// GET /api/decisions/:decisionId/advisor/history - Get conversation history
router.get("/:decisionId/advisor/history", decisionAdvisor_controller_1.getAdvisorHistory);
// DELETE /api/decisions/:decisionId/advisor/history - Clear conversation history
router.delete("/:decisionId/advisor/history", decisionAdvisor_controller_1.clearAdvisorHistory);
// GET /api/decisions/:decisionId/scenarios/comparison - 6-dimension scenario comparison
router.get("/:decisionId/scenarios/comparison", decisionAdvisor_controller_1.getScenarioComparison);
exports.default = router;
