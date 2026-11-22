import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { resumeTimeMachineService } from "../services/resume/resumeTimeMachine.service";
import {
    careerTargetSetupSchema,
    completeMilestoneSchema,
    createSnapshotSchema,
    updateMilestoneStatusSchema,
} from "../validators/resumeTimeMachine.validator";
import { AppError } from "../middleware/error.middleware";

const getIdParam = (param: unknown): string => {
    if (typeof param === "string") return param;
    if (Array.isArray(param) && typeof param[0] === "string") return param[0];
    return String(param || "");
};

export class ResumeTimeMachineController {
    /**
     * POST /api/resume-time-machine/upload
     * Upload resume file (PDF or DOCX), validate file signature, extract text, and parse.
     */
    async uploadResume(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        if (!req.file) {
            throw new AppError("Please select a resume file (PDF or DOCX) to upload", 400);
        }

        const resume = await resumeTimeMachineService.uploadAndParseResume(
            req.user.userId,
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

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
    async getUserResumes(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const resumes = await resumeTimeMachineService.getUserResumes(req.user.userId);
        res.status(200).json({
            success: true,
            data: resumes,
        });
    }

    /**
     * GET /api/resume-time-machine/resumes/:id
     * Get single resume with parsed details
     */
    async getResumeById(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const resume = await resumeTimeMachineService.getResumeById(req.user.userId, id);

        res.status(200).json({
            success: true,
            data: resume,
        });
    }

    /**
     * PUT /api/resume-time-machine/resumes/:id
     * Update parsed resume fields manually
     */
    async updateParsedResume(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const updatedResume = await resumeTimeMachineService.updateParsedResume(
            req.user.userId,
            id,
            req.body
        );

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
    async reparseResume(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const reExtracted = await resumeTimeMachineService.reparseResumeWithAI(
            req.user.userId,
            id
        );

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
    async setupCareerTargetAndAnalyze(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const validatedInput = careerTargetSetupSchema.parse(req.body);

        const result = await resumeTimeMachineService.setupCareerTargetAndAnalyze(
            req.user.userId,
            id,
            validatedInput
        );

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
    async getLatestAnalysis(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const analysis = await resumeTimeMachineService.getLatestAnalysis(req.user.userId, id);

        res.status(200).json({
            success: true,
            data: analysis,
        });
    }

    /**
     * GET /api/resume-time-machine/resumes/:id/roadmap
     * Get roadmap and milestones
     */
    async getRoadmap(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const result = await resumeTimeMachineService.getRoadmapWithMilestones(
            req.user.userId,
            id
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }

    /**
     * PATCH /api/resume-time-machine/milestones/:milestoneId/status
     * Update milestone status
     */
    async updateMilestoneStatus(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const milestoneId = getIdParam(req.params.milestoneId);
        const validatedInput = updateMilestoneStatusSchema.parse(req.body);

        const milestone = await resumeTimeMachineService.updateMilestoneStatus(
            req.user.userId,
            milestoneId,
            validatedInput.status
        );

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
    async completeMilestone(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const milestoneId = getIdParam(req.params.milestoneId);
        const validatedInput = completeMilestoneSchema.parse(req.body);

        const result = await resumeTimeMachineService.completeMilestoneWithEvidence(
            req.user.userId,
            milestoneId,
            validatedInput
        );

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
    async getProjections(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const projections = await resumeTimeMachineService.getProjections(req.user.userId, id);

        res.status(200).json({
            success: true,
            data: projections,
        });
    }

    /**
     * POST /api/resume-time-machine/resumes/:id/snapshots
     * Create snapshot version
     */
    async createSnapshot(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const validatedInput = createSnapshotSchema.parse(req.body);

        const snapshot = await resumeTimeMachineService.createSnapshot(
            req.user.userId,
            id,
            validatedInput
        );

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
    async getSnapshots(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const snapshots = await resumeTimeMachineService.getSnapshots(req.user.userId, id);

        res.status(200).json({
            success: true,
            data: snapshots,
        });
    }

    /**
     * GET /api/resume-time-machine/resumes/:id/export
     * Export resume data (current or projected)
     */
    async exportResume(req: AuthenticatedRequest, res: Response) {
        if (!req.user?.userId) {
            throw new AppError("Authentication required", 401);
        }

        const id = getIdParam(req.params.id);
        const months = req.query.months ? parseInt(req.query.months as string, 10) : undefined;

        const exportData = await resumeTimeMachineService.getResumeExportData(
            req.user.userId,
            id,
            months
        );

        res.status(200).json({
            success: true,
            data: exportData,
        });
    }
}

export const resumeTimeMachineController = new ResumeTimeMachineController();
