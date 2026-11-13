import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import {
    createSimulation,
    getSimulations,
    getSimulation,
    updateSimulation,
    deleteSimulation,
    runSimulationById,
    runSimulationAdHoc,
} from "../controllers/simulation.controller";

const router = Router();

// Require authentication for all simulation endpoints.
router.use(authMiddleware);

// POST /api/simulations - Create a new simulation
router.post("/", createSimulation);

// GET /api/simulations - Get all simulations for user
router.get("/", getSimulations);

// POST /api/simulations/run - Run simulation on ad-hoc graph
router.post("/run", runSimulationAdHoc);

// GET /api/simulations/:id - Get simulation by ID
router.get("/:id", getSimulation);

// PATCH /api/simulations/:id - Update simulation
router.patch("/:id", updateSimulation);

// DELETE /api/simulations/:id - Delete simulation
router.delete("/:id", deleteSimulation);

// POST /api/simulations/:id/run - Execute graph traversal on saved simulation
router.post("/:id/run", runSimulationById);

export default router;
