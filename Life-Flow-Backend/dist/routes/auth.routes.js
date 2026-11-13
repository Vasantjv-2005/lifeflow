"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// POST /api/auth/register (rate-limited)
router.post("/register", rateLimit_middleware_1.authRateLimiter, auth_controller_1.register);
// POST /api/auth/login (rate-limited)
router.post("/login", rateLimit_middleware_1.authRateLimiter, auth_controller_1.login);
// POST /api/auth/logout
router.post("/logout", auth_controller_1.logout);
// GET /api/auth/me
router.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.getCurrentUser);
exports.default = router;
