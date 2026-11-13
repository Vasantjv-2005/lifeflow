"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const simulation_controller_1 = require("../controllers/simulation.controller");
const router = (0, express_1.Router)();
// Require authentication for all simulation endpoints.
router.use(auth_middleware_1.authMiddleware);
// POST /api/simulations - Create a new simulation
router.post("/", simulation_controller_1.createSimulation);
// GET /api/simulations - Get all simulations for user
router.get("/", simulation_controller_1.getSimulations);
// POST /api/simulations/run - Run simulation on ad-hoc graph
router.post("/run", simulation_controller_1.runSimulationAdHoc);
// GET /api/simulations/:id - Get simulation by ID
router.get("/:id", simulation_controller_1.getSimulation);
// PATCH /api/simulations/:id - Update simulation
router.patch("/:id", simulation_controller_1.updateSimulation);
// DELETE /api/simulations/:id - Delete simulation
router.delete("/:id", simulation_controller_1.deleteSimulation);
// POST /api/simulations/:id/run - Execute graph traversal on saved simulation
router.post("/:id/run", simulation_controller_1.runSimulationById);
exports.default = router;
