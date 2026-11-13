"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const scenario_controller_1 = require("../controllers/scenario.controller");
const router = (0, express_1.Router)();
// All scenario routes require authentication
router.use(auth_middleware_1.authMiddleware);
// POST /api/scenarios - Create a scenario
router.post("/", scenario_controller_1.createScenario);
// POST /api/scenarios/batch - Create multiple scenarios in batch (e.g. from AI)
router.post("/batch", scenario_controller_1.createBatchScenarios);
// GET /api/scenarios/simulation/:simulationId - Get scenarios for a simulation
router.get("/simulation/:simulationId", scenario_controller_1.getScenariosForSimulation);
// GET /api/scenarios/:id - Get a scenario by ID
router.get("/:id", scenario_controller_1.getScenario);
// PATCH /api/scenarios/:id - Update a scenario
router.patch("/:id", scenario_controller_1.updateScenario);
// DELETE /api/scenarios/:id - Delete a scenario
router.delete("/:id", scenario_controller_1.deleteScenario);
exports.default = router;
