"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const decision_controller_1 = require("../controllers/decision.controller");
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
exports.default = router;
