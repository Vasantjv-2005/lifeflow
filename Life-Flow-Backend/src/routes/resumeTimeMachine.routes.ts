import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware";
import { resumeTimeMachineController } from "../controllers/resumeTimeMachine.controller";

const router = Router();

// Configure multer for in-memory file uploads with 5MB limit
const upload = multer({
    storage: multer.memoryStorage(),
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
        if (
            allowedTypes.includes(file.mimetype) ||
            file.originalname.toLowerCase().endsWith(".pdf") ||
            file.originalname.toLowerCase().endsWith(".docx")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and DOCX files are allowed"));
        }
    },
});

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// All resume time machine routes require authentication
router.use(authMiddleware);

// Upload and parse resume
router.post(
    "/upload",
    upload.single("file"),
    asyncHandler((req: any, res: any) => resumeTimeMachineController.uploadResume(req, res))
);

// Get all resumes
router.get(
    "/resumes",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.getUserResumes(req, res))
);

// Get single resume
router.get(
    "/resumes/:id",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.getResumeById(req, res))
);

// Update parsed resume
router.put(
    "/resumes/:id",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.updateParsedResume(req, res))
);

// Re-parse resume from raw document text with AI
router.post(
    "/resumes/:id/reparse",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.reparseResume(req, res))
);

// Configure career target & generate analysis + roadmap + projections
router.post(
    "/resumes/:id/analyze",
    asyncHandler((req: any, res: any) =>
        resumeTimeMachineController.setupCareerTargetAndAnalyze(req, res)
    )
);

// Get analysis
router.get(
    "/resumes/:id/analysis",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.getLatestAnalysis(req, res))
);

// Get roadmap & milestones
router.get(
    "/resumes/:id/roadmap",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.getRoadmap(req, res))
);

// Update milestone status
router.patch(
    "/milestones/:milestoneId/status",
    asyncHandler((req: any, res: any) =>
        resumeTimeMachineController.updateMilestoneStatus(req, res)
    )
);

// Complete milestone with evidence
router.post(
    "/milestones/:milestoneId/complete",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.completeMilestone(req, res))
);

// Get projections
router.get(
    "/resumes/:id/projections",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.getProjections(req, res))
);

// Snapshots
router.post(
    "/resumes/:id/snapshots",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.createSnapshot(req, res))
);

router.get(
    "/resumes/:id/snapshots",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.getSnapshots(req, res))
);

// Export
router.get(
    "/resumes/:id/export",
    asyncHandler((req: any, res: any) => resumeTimeMachineController.exportResume(req, res))
);

export default router;
