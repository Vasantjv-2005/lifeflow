"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const futureSelf_controller_1 = require("../controllers/futureSelf.controller");
const router = (0, express_1.Router)();
// All future-self endpoints require authentication
router.use(auth_middleware_1.authMiddleware);
// Profile endpoints
router.post("/profiles", futureSelf_controller_1.createProfile);
router.get("/profiles", futureSelf_controller_1.listProfiles);
router.get("/profiles/:id", futureSelf_controller_1.getProfileById);
router.delete("/profiles/:id", futureSelf_controller_1.deleteProfile);
// Interview session endpoints
router.post("/interviews", futureSelf_controller_1.createInterview);
router.get("/interviews", futureSelf_controller_1.listInterviews);
router.get("/interviews/:id", futureSelf_controller_1.getInterviewById);
router.delete("/interviews/:id", futureSelf_controller_1.deleteInterview);
// Message endpoints
router.get("/interviews/:id/messages", futureSelf_controller_1.listMessages);
router.post("/interviews/:id/messages", futureSelf_controller_1.sendMessage);
// Decision summary & reflections
router.post("/interviews/:id/complete", futureSelf_controller_1.completeInterview);
router.patch("/interviews/:id/reflection", futureSelf_controller_1.updateReflection);
exports.default = router;
