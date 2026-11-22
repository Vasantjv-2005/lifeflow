"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeTimeMachineController = exports.ResumeTimeMachineController = void 0;
const resumeTimeMachine_service_1 = require("../services/resume/resumeTimeMachine.service");
const resumeTimeMachine_validator_1 = require("../validators/resumeTimeMachine.validator");
const error_middleware_1 = require("../middleware/error.middleware");
const getIdParam = (param) => {
    if (typeof param === "string")
        return param;
    if (Array.isArray(param) && typeof param[0] === "string")
        return param[0];
    return String(param || "");
};
class ResumeTimeMachineController {
    /**
     * POST /api/resume-time-machine/upload
     * Upload resume file (PDF or DOCX), validate file signature, extract text, and parse.
     */
    async uploadResume(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        if (!req.file) {
            throw new error_middleware_1.AppError("Please select a resume file (PDF or DOCX) to upload", 400);
        }
        const resume = await resumeTimeMachine_service_1.resumeTimeMachineService.uploadAndParseResume(req.user.userId, req.file.buffer, req.file.originalname, req.file.mimetype);
        res.status(201).json({
            success: true,
            message: "Resume uploaded and parsed successfully",
            data: resume,
        });
    }
    /**
     * GET /api/resume-time-machine/resumes
     * Get all resumes for authenticated user
     */
    async getUserResumes(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const resumes = await resumeTimeMachine_service_1.resumeTimeMachineService.getUserResumes(req.user.userId);
        res.status(200).json({
            success: true,
            data: resumes,
        });
    }
    /**
     * GET /api/resume-time-machine/resumes/:id
     * Get single resume with parsed details
     */
    async getResumeById(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const resume = await resumeTimeMachine_service_1.resumeTimeMachineService.getResumeById(req.user.userId, id);
        res.status(200).json({
            success: true,
            data: resume,
        });
    }
    /**
     * PUT /api/resume-time-machine/resumes/:id
     * Update parsed resume fields manually
     */
    async updateParsedResume(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const updatedResume = await resumeTimeMachine_service_1.resumeTimeMachineService.updateParsedResume(req.user.userId, id, req.body);
        res.status(200).json({
            success: true,
            message: "Resume updated successfully",
            data: updatedResume,
        });
    }
    /**
     * POST /api/resume-time-machine/resumes/:id/reparse
     * Re-runs AI extraction on full raw text of resume
     */
    async reparseResume(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const reExtracted = await resumeTimeMachine_service_1.resumeTimeMachineService.reparseResumeWithAI(req.user.userId, id);
        res.status(200).json({
            success: true,
            message: "Resume re-extracted comprehensively with AI",
            data: reExtracted,
        });
    }
    /**
     * POST /api/resume-time-machine/resumes/:id/analyze
     * Configure career target, run gap analysis, generate roadmap and 3/6/12-mo projections
     */
    async setupCareerTargetAndAnalyze(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const validatedInput = resumeTimeMachine_validator_1.careerTargetSetupSchema.parse(req.body);
        const result = await resumeTimeMachine_service_1.resumeTimeMachineService.setupCareerTargetAndAnalyze(req.user.userId, id, validatedInput);
        res.status(200).json({
            success: true,
            message: "Career target configured and analysis generated successfully",
            data: result,
        });
    }
    /**
     * GET /api/resume-time-machine/resumes/:id/analysis
     * Get latest gap analysis
     */
    async getLatestAnalysis(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const analysis = await resumeTimeMachine_service_1.resumeTimeMachineService.getLatestAnalysis(req.user.userId, id);
        res.status(200).json({
            success: true,
            data: analysis,
        });
    }
    /**
     * GET /api/resume-time-machine/resumes/:id/roadmap
     * Get roadmap and milestones
     */
    async getRoadmap(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const result = await resumeTimeMachine_service_1.resumeTimeMachineService.getRoadmapWithMilestones(req.user.userId, id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    /**
     * PATCH /api/resume-time-machine/milestones/:milestoneId/status
     * Update milestone status
     */
    async updateMilestoneStatus(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const milestoneId = getIdParam(req.params.milestoneId);
        const validatedInput = resumeTimeMachine_validator_1.updateMilestoneStatusSchema.parse(req.body);
        const milestone = await resumeTimeMachine_service_1.resumeTimeMachineService.updateMilestoneStatus(req.user.userId, milestoneId, validatedInput.status);
        res.status(200).json({
            success: true,
            message: "Milestone status updated",
            data: milestone,
        });
    }
    /**
     * POST /api/resume-time-machine/milestones/:milestoneId/complete
     * Submit milestone completion with evidence description, URL, and verification check
     */
    async completeMilestone(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const milestoneId = getIdParam(req.params.milestoneId);
        const validatedInput = resumeTimeMachine_validator_1.completeMilestoneSchema.parse(req.body);
        const result = await resumeTimeMachine_service_1.resumeTimeMachineService.completeMilestoneWithEvidence(req.user.userId, milestoneId, validatedInput);
        res.status(200).json({
            success: true,
            message: "Milestone completed and verified successfully",
            data: result,
        });
    }
    /**
     * GET /api/resume-time-machine/resumes/:id/projections
     * Get 3, 6, and 12-month projections
     */
    async getProjections(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const projections = await resumeTimeMachine_service_1.resumeTimeMachineService.getProjections(req.user.userId, id);
        res.status(200).json({
            success: true,
            data: projections,
        });
    }
    /**
     * POST /api/resume-time-machine/resumes/:id/snapshots
     * Create snapshot version
     */
    async createSnapshot(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const validatedInput = resumeTimeMachine_validator_1.createSnapshotSchema.parse(req.body);
        const snapshot = await resumeTimeMachine_service_1.resumeTimeMachineService.createSnapshot(req.user.userId, id, validatedInput);
        res.status(201).json({
            success: true,
            message: "Resume snapshot created",
            data: snapshot,
        });
    }
    /**
     * GET /api/resume-time-machine/resumes/:id/snapshots
     * Get all snapshot versions
     */
    async getSnapshots(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const snapshots = await resumeTimeMachine_service_1.resumeTimeMachineService.getSnapshots(req.user.userId, id);
        res.status(200).json({
            success: true,
            data: snapshots,
        });
    }
    /**
     * GET /api/resume-time-machine/resumes/:id/export
     * Export resume data (current or projected)
     */
    async exportResume(req, res) {
        if (!req.user?.userId) {
            throw new error_middleware_1.AppError("Authentication required", 401);
        }
        const id = getIdParam(req.params.id);
        const months = req.query.months ? parseInt(req.query.months, 10) : undefined;
        const exportData = await resumeTimeMachine_service_1.resumeTimeMachineService.getResumeExportData(req.user.userId, id, months);
        res.status(200).json({
            success: true,
            data: exportData,
        });
    }
}
exports.ResumeTimeMachineController = ResumeTimeMachineController;
exports.resumeTimeMachineController = new ResumeTimeMachineController();
