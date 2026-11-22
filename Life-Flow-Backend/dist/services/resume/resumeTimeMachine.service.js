"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeTimeMachineService = exports.ResumeTimeMachineService = void 0;
const mongoose_1 = require("mongoose");
const Resume_1 = __importDefault(require("../../models/Resume"));
const ResumeAnalysis_1 = __importDefault(require("../../models/ResumeAnalysis"));
const ResumeRoadmap_1 = __importDefault(require("../../models/ResumeRoadmap"));
const ResumeMilestone_1 = __importDefault(require("../../models/ResumeMilestone"));
const ResumeProjection_1 = __importDefault(require("../../models/ResumeProjection"));
const ResumeSnapshot_1 = __importDefault(require("../../models/ResumeSnapshot"));
const resumeParser_service_1 = require("./resumeParser.service");
const resumeAI_service_1 = require("./resumeAI.service");
const resumeHorizonGenerators_1 = require("./resumeHorizonGenerators");
const error_middleware_1 = require("../../middleware/error.middleware");
class ResumeTimeMachineService {
    /**
     * Upload and parse resume document (PDF or DOCX).
     * Validates file signature, extracts text, calls AI structured parser,
     * saves to database, and creates initial snapshot.
     */
    async uploadAndParseResume(userId, fileBuffer, originalFileName, mimeType) {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new error_middleware_1.AppError("No file buffer provided", 400);
        }
        if (fileBuffer.length > 5 * 1024 * 1024) {
            throw new error_middleware_1.AppError("File size exceeds 5MB limit", 400);
        }
        // 1. Validate file signature and extract text
        const parseResult = await (0, resumeParser_service_1.parseResumeDocument)(fileBuffer, originalFileName, mimeType);
        // 2. Parse structured content with AI (with rule-based fallback)
        const heuristicFallback = (0, resumeParser_service_1.parseResumeTextHeuristically)(parseResult.rawText);
        let parsedContent;
        let parsingStatus = "completed";
        let parsingError;
        try {
            parsedContent = await (0, resumeAI_service_1.refineResumeWithAI)(parseResult.rawText, heuristicFallback);
        }
        catch (err) {
            parsingStatus = "failed";
            parsingError = err?.message || "Failed to refine resume with AI";
            parsedContent = heuristicFallback;
        }
        // 3. Save Resume record
        const resume = await Resume_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            originalFileName,
            fileType: parseResult.fileType,
            fileSize: fileBuffer.length,
            parsedContent,
            rawText: parseResult.rawText,
            parsingStatus,
            parsingError,
        });
        // 4. Create initial snapshot (Version 1)
        await ResumeSnapshot_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            resumeId: resume._id,
            version: 1,
            title: `Initial Upload: ${originalFileName}`,
            snapshotType: "current",
            snapshotContent: parsedContent,
            changeLog: ["Resume uploaded and verified signature successfully parsed."],
        });
        return resume;
    }
    /**
     * Get all resumes for user
     */
    async getUserResumes(userId) {
        return Resume_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    }
    /**
     * Get single resume with ownership verification
     */
    async getResumeById(userId, resumeId) {
        if (!mongoose_1.Types.ObjectId.isValid(resumeId)) {
            throw new error_middleware_1.AppError("Invalid resume ID format", 400);
        }
        const resume = await Resume_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(resumeId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!resume) {
            throw new error_middleware_1.AppError("Resume not found or access denied", 404);
        }
        return resume;
    }
    /**
     * Update parsed resume content manually
     */
    async updateParsedResume(userId, resumeId, updatedContent) {
        const resume = await this.getResumeById(userId, resumeId);
        resume.parsedContent = {
            ...resume.parsedContent,
            ...updatedContent,
            personalInfo: {
                ...resume.parsedContent.personalInfo,
                ...(updatedContent.personalInfo || {}),
            },
        };
        await resume.save();
        const lastSnapshot = await ResumeSnapshot_1.default.findOne({
            resumeId: resume._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ version: -1 });
        const nextVersion = (lastSnapshot?.version || 1) + 1;
        await ResumeSnapshot_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            resumeId: resume._id,
            version: nextVersion,
            title: `Manual Edit (v${nextVersion})`,
            snapshotType: "current",
            snapshotContent: resume.parsedContent,
            changeLog: ["User edited parsed resume sections manually."],
        });
        return resume;
    }
    /**
     * Re-runs AI extraction on full raw text of resume and updates parsedContent
     */
    async reparseResumeWithAI(userId, resumeId) {
        const resume = await this.getResumeById(userId, resumeId);
        const heuristic = (0, resumeParser_service_1.parseResumeTextHeuristically)(resume.rawText);
        const updatedContent = await (0, resumeAI_service_1.refineResumeWithAI)(resume.rawText, heuristic);
        resume.parsedContent = updatedContent;
        await resume.save();
        const lastSnapshot = await ResumeSnapshot_1.default.findOne({
            resumeId: resume._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ version: -1 });
        const nextVersion = (lastSnapshot?.version || 1) + 1;
        await ResumeSnapshot_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            resumeId: resume._id,
            version: nextVersion,
            title: `Full AI Re-parse (v${nextVersion})`,
            snapshotType: "current",
            snapshotContent: resume.parsedContent,
            changeLog: ["Re-extracted all resume sections comprehensively from raw document text."],
        });
        return resume;
    }
    /**
     * Full Career Target Setup & Gap Analysis & Multi-phase Roadmap & Projections Generation
     */
    async setupCareerTargetAndAnalyze(userId, resumeId, input) {
        const resume = await this.getResumeById(userId, resumeId);
        // 1. Perform AI Gap Analysis with WHOLE resume background
        const analysisData = await (0, resumeAI_service_1.analyzeResumeGapsWithAI)(resume.parsedContent, input.targetCareer, input.targetRoleLevel, input.timelineMonths, input.weeklyHoursAvailable, resume.rawText);
        // Save ResumeAnalysis record
        const analysis = await ResumeAnalysis_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            resumeId: resume._id,
            targetCareer: input.targetCareer,
            targetRoleLevel: input.targetRoleLevel,
            timelineMonths: input.timelineMonths,
            weeklyHoursAvailable: input.weeklyHoursAvailable,
            currentExperienceLevel: input.currentExperienceLevel,
            preferredIndustry: input.preferredIndustry,
            strengths: analysisData.strengths,
            existingDemonstratedSkills: analysisData.existingDemonstratedSkills,
            skillsNeedingImprovement: analysisData.skillsNeedingImprovement,
            skillGaps: analysisData.skillGaps,
            experienceGaps: analysisData.experienceGaps,
            portfolioRecommendations: analysisData.portfolioRecommendations,
            certificationRecommendations: analysisData.certificationRecommendations,
            readinessAssessment: analysisData.readinessAssessment,
        });
        // 2. Generate personalized multi-phase roadmap leveraging entire background
        const roadmapData = await (0, resumeAI_service_1.generateRoadmapWithAI)(resume.parsedContent, analysisData, input.targetCareer, input.timelineMonths, input.weeklyHoursAvailable, resume.rawText);
        // Save ResumeRoadmap record
        const roadmap = await ResumeRoadmap_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            resumeId: resume._id,
            analysisId: analysis._id,
            targetCareer: input.targetCareer,
            targetTimelineMonths: input.timelineMonths,
            phases: roadmapData.phases.map((p) => ({
                phaseNumber: p.phaseNumber,
                title: p.title,
                description: p.description,
                durationWeeks: p.durationWeeks,
                milestoneCount: p.milestoneCount || 0,
            })),
            totalMilestones: roadmapData.milestones.length,
            completedMilestones: 0,
            overallProgressPercentage: 0,
        });
        // 3. Save Milestone records
        const milestoneDocsToInsert = roadmapData.milestones.map((m) => ({
            userId: new mongoose_1.Types.ObjectId(userId),
            roadmapId: roadmap._id,
            resumeId: resume._id,
            phaseNumber: m.phaseNumber,
            phaseTitle: m.phaseTitle,
            title: m.title,
            description: m.description,
            category: m.category || "technical",
            requiredSkills: m.requiredSkills || [],
            learningObjectives: m.learningObjectives || [],
            recommendedResources: m.recommendedResources || [],
            practicalActivities: m.practicalActivities || [],
            expectedDeliverable: m.expectedDeliverable || "",
            estimatedDurationWeeks: m.estimatedDurationWeeks || 2,
            priority: m.priority || "medium",
            dependencies: m.dependencies || [],
            completionCriteria: m.completionCriteria || "",
            status: "planned",
        }));
        const milestones = await ResumeMilestone_1.default.insertMany(milestoneDocsToInsert);
        // 4. Generate 3, 6, and 12-Month Projections
        const month3Proj = (0, resumeAI_service_1.projectFutureResume)(resume.parsedContent, input.targetCareer, 3, roadmapData.milestones);
        const month6Proj = (0, resumeAI_service_1.projectFutureResume)(resume.parsedContent, input.targetCareer, 6, roadmapData.milestones);
        const month12Proj = (0, resumeAI_service_1.projectFutureResume)(resume.parsedContent, input.targetCareer, 12, roadmapData.milestones);
        // Clean up previous projections for this resume if any
        await ResumeProjection_1.default.deleteMany({ resumeId: resume._id });
        const projectionDocs = [
            {
                userId: new mongoose_1.Types.ObjectId(userId),
                resumeId: resume._id,
                roadmapId: roadmap._id,
                projectionTimelineMonths: 3,
                projectedContent: month3Proj.projectedContent,
                plannedAchievements: month3Proj.plannedAchievements,
                achievedMilestonesCount: 0,
                foundationsGuide: month3Proj.foundationsGuide,
            },
            {
                userId: new mongoose_1.Types.ObjectId(userId),
                resumeId: resume._id,
                roadmapId: roadmap._id,
                projectionTimelineMonths: 6,
                projectedContent: month6Proj.projectedContent,
                plannedAchievements: month6Proj.plannedAchievements,
                achievedMilestonesCount: 0,
                remainingSkillsAndProjects: month6Proj.remainingSkillsAndProjects,
            },
            {
                userId: new mongoose_1.Types.ObjectId(userId),
                resumeId: resume._id,
                roadmapId: roadmap._id,
                projectionTimelineMonths: 12,
                projectedContent: month12Proj.projectedContent,
                plannedAchievements: month12Proj.plannedAchievements,
                achievedMilestonesCount: 0,
                interviewMastery: month12Proj.interviewMastery,
            },
        ];
        const projections = await ResumeProjection_1.default.insertMany(projectionDocs);
        return {
            analysis,
            roadmap,
            milestones: milestones,
            projections: projections,
        };
    }
    /**
     * Get latest analysis for a resume
     */
    async getLatestAnalysis(userId, resumeId) {
        await this.getResumeById(userId, resumeId);
        return ResumeAnalysis_1.default.findOne({
            resumeId: new mongoose_1.Types.ObjectId(resumeId),
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ createdAt: -1 });
    }
    /**
     * Get roadmap and milestones for resume
     */
    async getRoadmapWithMilestones(userId, resumeId) {
        await this.getResumeById(userId, resumeId);
        const roadmap = await ResumeRoadmap_1.default.findOne({
            resumeId: new mongoose_1.Types.ObjectId(resumeId),
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ createdAt: -1 });
        if (!roadmap) {
            return { roadmap: null, milestones: [] };
        }
        const milestones = await ResumeMilestone_1.default.find({
            roadmapId: roadmap._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ phaseNumber: 1, priority: 1, createdAt: 1 });
        return { roadmap, milestones };
    }
    /**
     * Update milestone status (planned, in_progress, completed)
     */
    async updateMilestoneStatus(userId, milestoneId, status) {
        if (!mongoose_1.Types.ObjectId.isValid(milestoneId)) {
            throw new error_middleware_1.AppError("Invalid milestone ID format", 400);
        }
        const milestone = await ResumeMilestone_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(milestoneId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!milestone) {
            throw new error_middleware_1.AppError("Milestone not found or access denied", 404);
        }
        milestone.status = status;
        if (status === "completed" && !milestone.completedAt) {
            milestone.completedAt = new Date();
        }
        else if (status !== "completed") {
            milestone.completedAt = undefined;
        }
        await milestone.save();
        await this.recalculateRoadmapProgress(milestone.roadmapId.toString());
        return milestone;
    }
    /**
     * Complete milestone with evidence and verification confirmation
     */
    async completeMilestoneWithEvidence(userId, milestoneId, input) {
        if (!mongoose_1.Types.ObjectId.isValid(milestoneId)) {
            throw new error_middleware_1.AppError("Invalid milestone ID format", 400);
        }
        if (!input.confirmed) {
            throw new error_middleware_1.AppError("Verification confirmation required. Genuine achievements must be confirmed.", 400);
        }
        const milestone = await ResumeMilestone_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(milestoneId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!milestone) {
            throw new error_middleware_1.AppError("Milestone not found or access denied", 404);
        }
        milestone.status = "completed";
        milestone.completionDescription = input.completionDescription;
        milestone.evidenceUrl = input.evidenceUrl || "";
        milestone.completedAt = new Date();
        await milestone.save();
        const updatedRoadmap = await this.recalculateRoadmapProgress(milestone.roadmapId.toString());
        await ResumeProjection_1.default.updateMany({
            resumeId: milestone.resumeId,
            "plannedAchievements.title": { $regex: new RegExp(milestone.title, "i") },
        }, {
            $set: {
                "plannedAchievements.$.plannedOrAchieved": "achieved",
            },
            $inc: { achievedMilestonesCount: 1 },
        });
        const resume = await Resume_1.default.findById(milestone.resumeId);
        if (resume) {
            const lastSnapshot = await ResumeSnapshot_1.default.findOne({
                resumeId: resume._id,
            }).sort({ version: -1 });
            const nextVersion = (lastSnapshot?.version || 1) + 1;
            await ResumeSnapshot_1.default.create({
                userId: new mongoose_1.Types.ObjectId(userId),
                resumeId: resume._id,
                version: nextVersion,
                title: `Achieved: ${milestone.title}`,
                snapshotType: "milestone_update",
                snapshotContent: resume.parsedContent,
                changeLog: [
                    `Completed milestone "${milestone.title}" in Phase ${milestone.phaseNumber}: ${milestone.phaseTitle}.`,
                    `Evidence verified: ${input.completionDescription}`,
                ],
            });
        }
        return { milestone, updatedRoadmap };
    }
    async recalculateRoadmapProgress(roadmapId) {
        const total = await ResumeMilestone_1.default.countDocuments({
            roadmapId: new mongoose_1.Types.ObjectId(roadmapId),
        });
        const completed = await ResumeMilestone_1.default.countDocuments({
            roadmapId: new mongoose_1.Types.ObjectId(roadmapId),
            status: "completed",
        });
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const updated = await ResumeRoadmap_1.default.findByIdAndUpdate(roadmapId, {
            totalMilestones: total,
            completedMilestones: completed,
            overallProgressPercentage: percentage,
        }, { new: true });
        if (!updated) {
            throw new error_middleware_1.AppError("Roadmap not found for progress recalculation", 404);
        }
        return updated;
    }
    /**
     * Get all projections (3, 6, 12 months) for a resume
     */
    async getProjections(userId, resumeId) {
        const resume = await this.getResumeById(userId, resumeId);
        const latestAnalysis = await ResumeAnalysis_1.default.findOne({
            resumeId: resume._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ createdAt: -1 });
        const targetCareer = latestAnalysis?.targetCareer || "Software Engineer";
        const projections = await ResumeProjection_1.default.find({
            resumeId: new mongoose_1.Types.ObjectId(resumeId),
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ projectionTimelineMonths: 1 });
        // Auto-enrich any existing projections that don't yet have the new horizon guides
        for (const proj of projections) {
            let modified = false;
            if (proj.projectionTimelineMonths === 3 && !proj.foundationsGuide) {
                proj.foundationsGuide = (0, resumeHorizonGenerators_1.generateFoundationsGuide)(targetCareer, resume.parsedContent);
                modified = true;
            }
            else if (proj.projectionTimelineMonths === 6 && !proj.remainingSkillsAndProjects) {
                proj.remainingSkillsAndProjects = (0, resumeHorizonGenerators_1.generateRemainingSkillsAndProjects)(targetCareer, resume.parsedContent);
                modified = true;
            }
            else if (proj.projectionTimelineMonths === 12 && !proj.interviewMastery) {
                proj.interviewMastery = (0, resumeHorizonGenerators_1.generateInterviewMastery)(targetCareer, resume.parsedContent);
                modified = true;
            }
            if (modified) {
                await proj.save();
            }
        }
        return projections;
    }
    /**
     * Create custom snapshot
     */
    async createSnapshot(userId, resumeId, input) {
        const resume = await this.getResumeById(userId, resumeId);
        let contentToSnapshot = resume.parsedContent;
        if (input.snapshotType.startsWith("projected_")) {
            const months = parseInt(input.snapshotType.replace("projected_", "").replace("m", ""), 10);
            const projection = await ResumeProjection_1.default.findOne({
                resumeId: resume._id,
                userId: new mongoose_1.Types.ObjectId(userId),
                projectionTimelineMonths: months,
            });
            if (projection) {
                contentToSnapshot = projection.projectedContent;
            }
        }
        const lastSnapshot = await ResumeSnapshot_1.default.findOne({
            resumeId: resume._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ version: -1 });
        const nextVersion = (lastSnapshot?.version || 1) + 1;
        return ResumeSnapshot_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            resumeId: resume._id,
            version: nextVersion,
            title: input.title,
            snapshotType: input.snapshotType,
            snapshotContent: contentToSnapshot,
            changeLog: input.notes ? [input.notes] : [`Manual snapshot created: ${input.title}`],
        });
    }
    /**
     * Get all snapshots for a resume
     */
    async getSnapshots(userId, resumeId) {
        await this.getResumeById(userId, resumeId);
        return ResumeSnapshot_1.default.find({
            resumeId: new mongoose_1.Types.ObjectId(resumeId),
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ version: -1 });
    }
    /**
     * Get clean resume export data
     */
    async getResumeExportData(userId, resumeId, projectionMonths) {
        const resume = await this.getResumeById(userId, resumeId);
        const latestAnalysis = await ResumeAnalysis_1.default.findOne({
            resumeId: resume._id,
            userId: new mongoose_1.Types.ObjectId(userId),
        }).sort({ createdAt: -1 });
        const targetCareer = latestAnalysis?.targetCareer || "Target Career";
        const skillsStillToLearn = (latestAnalysis?.skillGaps || []).map((g) => ({
            skill: g.skill,
            category: g.category,
            priority: g.priority,
            reason: g.reason,
        }));
        if (projectionMonths && [3, 6, 12].includes(projectionMonths)) {
            const projection = await ResumeProjection_1.default.findOne({
                resumeId: resume._id,
                userId: new mongoose_1.Types.ObjectId(userId),
                projectionTimelineMonths: projectionMonths,
            });
            if (projection) {
                const projectedContent = projection.projectedContent;
                let interviewQuestions = [];
                if (projectionMonths === 12) {
                    if (projection.interviewMastery?.technicalQuestions && projection.interviewMastery.technicalQuestions.length > 0) {
                        interviewQuestions = projection.interviewMastery.technicalQuestions;
                    }
                    else {
                        const mastery = (0, resumeHorizonGenerators_1.generateInterviewMastery)(targetCareer, resume.parsedContent);
                        interviewQuestions = mastery.technicalQuestions;
                    }
                }
                return {
                    isProjected: true,
                    projectionMonths,
                    targetCareer,
                    skillsStillToLearn,
                    interviewQuestions,
                    watermarkText: `PROJECTED +${projectionMonths}M RESUME — NOT YET ACHIEVED`,
                    disclaimer: "NOTICE: This document is a forward-looking projected resume generated by LifeFlow Resume Time Machine for career development and goal-setting purposes only. The planned skills, certifications, and projects represent aspirational learning milestones and have NOT yet been verified as completed professional credentials.",
                    resume: {
                        title: `${resume.parsedContent.personalInfo.fullName || "Candidate"} - Projected (+${projectionMonths} Months)`,
                        personalInfo: projectedContent.personalInfo,
                        summary: projectedContent.summary,
                        education: projectedContent.education,
                        experience: projectedContent.experience,
                        skills: projectedContent.skills,
                        technicalTools: projectedContent.technicalTools,
                        projects: projectedContent.projects,
                        certifications: projectedContent.certifications,
                    },
                };
            }
        }
        return {
            isProjected: false,
            projectionMonths: 0,
            targetCareer,
            skillsStillToLearn,
            interviewQuestions: [],
            watermarkText: "",
            disclaimer: "Verified current resume data.",
            resume: {
                title: `${resume.parsedContent.personalInfo.fullName || "Candidate"} - Resume`,
                personalInfo: resume.parsedContent.personalInfo,
                summary: resume.parsedContent.summary,
                education: resume.parsedContent.education,
                experience: resume.parsedContent.experience,
                skills: resume.parsedContent.skills,
                technicalTools: resume.parsedContent.technicalTools,
                projects: resume.parsedContent.projects,
                certifications: resume.parsedContent.certifications,
            },
        };
    }
}
exports.ResumeTimeMachineService = ResumeTimeMachineService;
exports.resumeTimeMachineService = new ResumeTimeMachineService();
