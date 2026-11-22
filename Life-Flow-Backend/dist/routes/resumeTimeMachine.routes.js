"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const resumeTimeMachine_controller_1 = require("../controllers/resumeTimeMachine.controller");
const router = (0, express_1.Router)();
// Configure multer for in-memory file uploads with 5MB limit
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/octet-stream",
        ];
        if (allowedTypes.includes(file.mimetype) ||
            file.originalname.toLowerCase().endsWith(".pdf") ||
            file.originalname.toLowerCase().endsWith(".docx")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF and DOCX files are allowed"));
        }
    },
});
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// All resume time machine routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Upload and parse resume
router.post("/upload", upload.single("file"), asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.uploadResume(req, res)));
// Get all resumes
router.get("/resumes", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.getUserResumes(req, res)));
// Get single resume
router.get("/resumes/:id", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.getResumeById(req, res)));
// Update parsed resume
router.put("/resumes/:id", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.updateParsedResume(req, res)));
// Re-parse resume from raw document text with AI
router.post("/resumes/:id/reparse", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.reparseResume(req, res)));
// Configure career target & generate analysis + roadmap + projections
router.post("/resumes/:id/analyze", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.setupCareerTargetAndAnalyze(req, res)));
// Get analysis
router.get("/resumes/:id/analysis", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.getLatestAnalysis(req, res)));
// Get roadmap & milestones
router.get("/resumes/:id/roadmap", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.getRoadmap(req, res)));
// Update milestone status
router.patch("/milestones/:milestoneId/status", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.updateMilestoneStatus(req, res)));
// Complete milestone with evidence
router.post("/milestones/:milestoneId/complete", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.completeMilestone(req, res)));
// Get projections
router.get("/resumes/:id/projections", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.getProjections(req, res)));
// Snapshots
router.post("/resumes/:id/snapshots", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.createSnapshot(req, res)));
router.get("/resumes/:id/snapshots", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.getSnapshots(req, res)));
// Export
router.get("/resumes/:id/export", asyncHandler((req, res) => resumeTimeMachine_controller_1.resumeTimeMachineController.exportResume(req, res)));
exports.default = router;
