import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    createScenario,
    createBatchScenarios,
    getScenariosForSimulation,
    getScenario,
    updateScenario,
    deleteScenario,
} from "../controllers/scenario.controller";

const router = Router();

// All scenario routes require authentication
router.use(authMiddleware);

// POST /api/scenarios - Create a scenario
router.post("/", createScenario);

// POST /api/scenarios/batch - Create multiple scenarios in batch (e.g. from AI)
router.post("/batch", createBatchScenarios);

// GET /api/scenarios/simulation/:simulationId - Get scenarios for a simulation
router.get("/simulation/:simulationId", getScenariosForSimulation);

// GET /api/scenarios/:id - Get a scenario by ID
router.get("/:id", getScenario);

// PATCH /api/scenarios/:id - Update a scenario
router.patch("/:id", updateScenario);

// DELETE /api/scenarios/:id - Delete a scenario
router.delete("/:id", deleteScenario);

export default router;
