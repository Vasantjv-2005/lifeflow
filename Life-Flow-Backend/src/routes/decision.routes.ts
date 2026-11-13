import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    createDecision,
    getDecisions,
    getDecisionById,
    updateDecision,
    deleteDecision,
} from "../controllers/decision.controller";

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

export default router;
