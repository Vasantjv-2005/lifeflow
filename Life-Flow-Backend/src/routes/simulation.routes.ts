
import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    createSimulation,
    getSimulations,
    getSimulation,
    updateSimulation,
    deleteSimulation,
} from "../controllers/simulation.controller";

const router = Router();

// Require authentication for all simulation endpoints.
router.use(authMiddleware);

// POST /api/simulations
router.post("/", createSimulation);

// GET /api/simulations
router.get("/", getSimulations);

// GET /api/simulations/:id
router.get("/:id", getSimulation);

// PATCH /api/simulations/:id
router.patch("/:id", updateSimulation);

// DELETE /api/simulations/:id
router.delete("/:id", deleteSimulation);

export default router;
