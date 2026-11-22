import { Types } from "mongoose";
import Resume, { IResume, IParsedResumeContent } from "../../models/Resume";
import ResumeAnalysis, { IResumeAnalysis } from "../../models/ResumeAnalysis";
import ResumeRoadmap, { IResumeRoadmap } from "../../models/ResumeRoadmap";
import ResumeMilestone, { IResumeMilestone } from "../../models/ResumeMilestone";
import ResumeProjection, { IResumeProjection } from "../../models/ResumeProjection";
import ResumeSnapshot, { IResumeSnapshot } from "../../models/ResumeSnapshot";
import { parseResumeDocument, parseResumeTextHeuristically } from "./resumeParser.service";
import {
    refineResumeWithAI,
    analyzeResumeGapsWithAI,
    generateRoadmapWithAI,
    projectFutureResume,
} from "./resumeAI.service";
import {
    generateFoundationsGuide,
    generateRemainingSkillsAndProjects,
    generateInterviewMastery,
} from "./resumeHorizonGenerators";
import { AppError } from "../../middleware/error.middleware";
import {
    CareerTargetSetupInput,
    CompleteMilestoneInput,
    CreateSnapshotInput,
} from "../../validators/resumeTimeMachine.validator";

export class ResumeTimeMachineService {
    /**
     * Upload and parse resume document (PDF or DOCX).
     * Validates file signature, extracts text, calls AI structured parser,
     * saves to database, and creates initial snapshot.
     */
    async uploadAndParseResume(
        userId: string,
        fileBuffer: Buffer,
        originalFileName: string,
        mimeType: string
    ): Promise<IResume> {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new AppError("No file buffer provided", 400);
        }

        if (fileBuffer.length > 5 * 1024 * 1024) {
            throw new AppError("File size exceeds 5MB limit", 400);
        }

        // 1. Validate file signature and extract text
        const parseResult = await parseResumeDocument(
            fileBuffer,
            originalFileName,
            mimeType
        );

        // 2. Parse structured content with AI (with rule-based fallback)
        const heuristicFallback = parseResumeTextHeuristically(parseResult.rawText);
        let parsedContent: IParsedResumeContent;
        let parsingStatus: "completed" | "failed" = "completed";
        let parsingError: string | undefined;

        try {
            parsedContent = await refineResumeWithAI(
                parseResult.rawText,
                heuristicFallback
            );
        } catch (err: any) {
            parsingStatus = "failed";
            parsingError = err?.message || "Failed to refine resume with AI";
            parsedContent = heuristicFallback;
        }

        // 3. Save Resume record
        const resume = await Resume.create({
            userId: new Types.ObjectId(userId),
            originalFileName,
            fileType: parseResult.fileType,
            fileSize: fileBuffer.length,
            parsedContent,
            rawText: parseResult.rawText,
            parsingStatus,
            parsingError,
        });

        // 4. Create initial snapshot (Version 1)
        await ResumeSnapshot.create({
            userId: new Types.ObjectId(userId),
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
    async getUserResumes(userId: string): Promise<IResume[]> {
        return Resume.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    }

    /**
     * Get single resume with ownership verification
     */
    async getResumeById(userId: string, resumeId: string): Promise<IResume> {
        if (!Types.ObjectId.isValid(resumeId)) {
            throw new AppError("Invalid resume ID format", 400);
        }

        const resume = await Resume.findOne({
            _id: new Types.ObjectId(resumeId),
            userId: new Types.ObjectId(userId),
        });

        if (!resume) {
            throw new AppError("Resume not found or access denied", 404);
        }

        return resume;
    }

    /**
     * Update parsed resume content manually
     */
    async updateParsedResume(
        userId: string,
        resumeId: string,
        updatedContent: Partial<IParsedResumeContent>
    ): Promise<IResume> {
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

        const lastSnapshot = await ResumeSnapshot.findOne({
            resumeId: resume._id,
            userId: new Types.ObjectId(userId),
        }).sort({ version: -1 });

        const nextVersion = (lastSnapshot?.version || 1) + 1;

        await ResumeSnapshot.create({
            userId: new Types.ObjectId(userId),
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
    async reparseResumeWithAI(userId: string, resumeId: string): Promise<IResume> {
        const resume = await this.getResumeById(userId, resumeId);
        const heuristic = parseResumeTextHeuristically(resume.rawText);
        const updatedContent = await refineResumeWithAI(resume.rawText, heuristic);
        resume.parsedContent = updatedContent;
        await resume.save();

        const lastSnapshot = await ResumeSnapshot.findOne({
            resumeId: resume._id,
            userId: new Types.ObjectId(userId),
        }).sort({ version: -1 });

        const nextVersion = (lastSnapshot?.version || 1) + 1;

        await ResumeSnapshot.create({
            userId: new Types.ObjectId(userId),
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
    async setupCareerTargetAndAnalyze(
        userId: string,
        resumeId: string,
        input: CareerTargetSetupInput
    ): Promise<{
        analysis: IResumeAnalysis;
        roadmap: IResumeRoadmap;
        milestones: IResumeMilestone[];
        projections: IResumeProjection[];
    }> {
        const resume = await this.getResumeById(userId, resumeId);

        // 1. Perform AI Gap Analysis with WHOLE resume background
        const analysisData = await analyzeResumeGapsWithAI(
            resume.parsedContent,
            input.targetCareer,
            input.targetRoleLevel,
            input.timelineMonths,
            input.weeklyHoursAvailable,
            resume.rawText
        );

        // Save ResumeAnalysis record
        const analysis = await ResumeAnalysis.create({
            userId: new Types.ObjectId(userId),
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
        const roadmapData = await generateRoadmapWithAI(
            resume.parsedContent,
            analysisData,
            input.targetCareer,
            input.timelineMonths,
            input.weeklyHoursAvailable,
            resume.rawText
        );

        // Save ResumeRoadmap record
        const roadmap = await ResumeRoadmap.create({
            userId: new Types.ObjectId(userId),
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
            userId: new Types.ObjectId(userId),
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

        const milestones = await ResumeMilestone.insertMany(milestoneDocsToInsert);

        // 4. Generate 3, 6, and 12-Month Projections
        const month3Proj = projectFutureResume(
            resume.parsedContent,
            input.targetCareer,
            3,
            roadmapData.milestones
        );
        const month6Proj = projectFutureResume(
            resume.parsedContent,
            input.targetCareer,
            6,
            roadmapData.milestones
        );
        const month12Proj = projectFutureResume(
            resume.parsedContent,
            input.targetCareer,
            12,
            roadmapData.milestones
        );

        // Clean up previous projections for this resume if any
        await ResumeProjection.deleteMany({ resumeId: resume._id });

        const projectionDocs = [
            {
                userId: new Types.ObjectId(userId),
                resumeId: resume._id,
                roadmapId: roadmap._id,
                projectionTimelineMonths: 3 as const,
                projectedContent: month3Proj.projectedContent,
                plannedAchievements: month3Proj.plannedAchievements,
                achievedMilestonesCount: 0,
                foundationsGuide: month3Proj.foundationsGuide,
            },
            {
                userId: new Types.ObjectId(userId),
                resumeId: resume._id,
                roadmapId: roadmap._id,
                projectionTimelineMonths: 6 as const,
                projectedContent: month6Proj.projectedContent,
                plannedAchievements: month6Proj.plannedAchievements,
                achievedMilestonesCount: 0,
                remainingSkillsAndProjects: month6Proj.remainingSkillsAndProjects,
            },
            {
                userId: new Types.ObjectId(userId),
                resumeId: resume._id,
                roadmapId: roadmap._id,
                projectionTimelineMonths: 12 as const,
                projectedContent: month12Proj.projectedContent,
                plannedAchievements: month12Proj.plannedAchievements,
                achievedMilestonesCount: 0,
                interviewMastery: month12Proj.interviewMastery,
            },
        ];

        const projections = await ResumeProjection.insertMany(projectionDocs);

        return {
            analysis,
            roadmap,
            milestones: milestones as unknown as IResumeMilestone[],
            projections: projections as unknown as IResumeProjection[],
        };
    }

    /**
     * Get latest analysis for a resume
     */
    async getLatestAnalysis(userId: string, resumeId: string): Promise<IResumeAnalysis | null> {
        await this.getResumeById(userId, resumeId);
        return ResumeAnalysis.findOne({
            resumeId: new Types.ObjectId(resumeId),
            userId: new Types.ObjectId(userId),
        }).sort({ createdAt: -1 });
    }

    /**
     * Get roadmap and milestones for resume
     */
    async getRoadmapWithMilestones(
        userId: string,
        resumeId: string
    ): Promise<{ roadmap: IResumeRoadmap | null; milestones: IResumeMilestone[] }> {
        await this.getResumeById(userId, resumeId);

        const roadmap = await ResumeRoadmap.findOne({
            resumeId: new Types.ObjectId(resumeId),
            userId: new Types.ObjectId(userId),
        }).sort({ createdAt: -1 });

        if (!roadmap) {
            return { roadmap: null, milestones: [] };
        }

        const milestones = await ResumeMilestone.find({
            roadmapId: roadmap._id,
            userId: new Types.ObjectId(userId),
        }).sort({ phaseNumber: 1, priority: 1, createdAt: 1 });

        return { roadmap, milestones };
    }

    /**
     * Update milestone status (planned, in_progress, completed)
     */
    async updateMilestoneStatus(
        userId: string,
        milestoneId: string,
        status: "planned" | "in_progress" | "completed"
    ): Promise<IResumeMilestone> {
        if (!Types.ObjectId.isValid(milestoneId)) {
            throw new AppError("Invalid milestone ID format", 400);
        }

        const milestone = await ResumeMilestone.findOne({
            _id: new Types.ObjectId(milestoneId),
            userId: new Types.ObjectId(userId),
        });

        if (!milestone) {
            throw new AppError("Milestone not found or access denied", 404);
        }

        milestone.status = status;
        if (status === "completed" && !milestone.completedAt) {
            milestone.completedAt = new Date();
        } else if (status !== "completed") {
            milestone.completedAt = undefined;
        }

        await milestone.save();
        await this.recalculateRoadmapProgress(milestone.roadmapId.toString());

        return milestone;
    }

    /**
     * Complete milestone with evidence and verification confirmation
     */
    async completeMilestoneWithEvidence(
        userId: string,
        milestoneId: string,
        input: CompleteMilestoneInput
    ): Promise<{ milestone: IResumeMilestone; updatedRoadmap: IResumeRoadmap }> {
        if (!Types.ObjectId.isValid(milestoneId)) {
            throw new AppError("Invalid milestone ID format", 400);
        }

        if (!input.confirmed) {
            throw new AppError(
                "Verification confirmation required. Genuine achievements must be confirmed.",
                400
            );
        }

        const milestone = await ResumeMilestone.findOne({
            _id: new Types.ObjectId(milestoneId),
            userId: new Types.ObjectId(userId),
        });

        if (!milestone) {
            throw new AppError("Milestone not found or access denied", 404);
        }

        milestone.status = "completed";
        milestone.completionDescription = input.completionDescription;
        milestone.evidenceUrl = input.evidenceUrl || "";
        milestone.completedAt = new Date();
        await milestone.save();

        const updatedRoadmap = await this.recalculateRoadmapProgress(milestone.roadmapId.toString());

        await ResumeProjection.updateMany(
            {
                resumeId: milestone.resumeId,
                "plannedAchievements.title": { $regex: new RegExp(milestone.title, "i") },
            },
            {
                $set: {
                    "plannedAchievements.$.plannedOrAchieved": "achieved",
                },
                $inc: { achievedMilestonesCount: 1 },
            }
        );

        const resume = await Resume.findById(milestone.resumeId);
        if (resume) {
            const lastSnapshot = await ResumeSnapshot.findOne({
                resumeId: resume._id,
            }).sort({ version: -1 });

            const nextVersion = (lastSnapshot?.version || 1) + 1;

            await ResumeSnapshot.create({
                userId: new Types.ObjectId(userId),
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

    private async recalculateRoadmapProgress(roadmapId: string): Promise<IResumeRoadmap> {
        const total = await ResumeMilestone.countDocuments({
            roadmapId: new Types.ObjectId(roadmapId),
        });
        const completed = await ResumeMilestone.countDocuments({
            roadmapId: new Types.ObjectId(roadmapId),
            status: "completed",
        });

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const updated = await ResumeRoadmap.findByIdAndUpdate(
            roadmapId,
            {
                totalMilestones: total,
                completedMilestones: completed,
                overallProgressPercentage: percentage,
            },
            { new: true }
        );

        if (!updated) {
            throw new AppError("Roadmap not found for progress recalculation", 404);
        }

        return updated;
    }

    /**
     * Get all projections (3, 6, 12 months) for a resume
     */
    async getProjections(userId: string, resumeId: string): Promise<IResumeProjection[]> {
        const resume = await this.getResumeById(userId, resumeId);
        const latestAnalysis = await ResumeAnalysis.findOne({
            resumeId: resume._id,
            userId: new Types.ObjectId(userId),
        }).sort({ createdAt: -1 });

        const targetCareer = latestAnalysis?.targetCareer || "Software Engineer";

        const projections = await ResumeProjection.find({
            resumeId: new Types.ObjectId(resumeId),
            userId: new Types.ObjectId(userId),
        }).sort({ projectionTimelineMonths: 1 });

        // Auto-enrich any existing projections that don't yet have the new horizon guides
        for (const proj of projections) {
            let modified = false;
            if (proj.projectionTimelineMonths === 3 && !proj.foundationsGuide) {
                proj.foundationsGuide = generateFoundationsGuide(targetCareer, resume.parsedContent);
                modified = true;
            } else if (proj.projectionTimelineMonths === 6 && !proj.remainingSkillsAndProjects) {
                proj.remainingSkillsAndProjects = generateRemainingSkillsAndProjects(targetCareer, resume.parsedContent);
                modified = true;
            } else if (proj.projectionTimelineMonths === 12 && !proj.interviewMastery) {
                proj.interviewMastery = generateInterviewMastery(targetCareer, resume.parsedContent);
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
    async createSnapshot(
        userId: string,
        resumeId: string,
        input: CreateSnapshotInput
    ): Promise<IResumeSnapshot> {
        const resume = await this.getResumeById(userId, resumeId);

        let contentToSnapshot = resume.parsedContent;

        if (input.snapshotType.startsWith("projected_")) {
            const months = parseInt(input.snapshotType.replace("projected_", "").replace("m", ""), 10) as 3 | 6 | 12;
            const projection = await ResumeProjection.findOne({
                resumeId: resume._id,
                userId: new Types.ObjectId(userId),
                projectionTimelineMonths: months,
            });
            if (projection) {
                contentToSnapshot = (projection as any).projectedContent;
            }
        }

        const lastSnapshot = await ResumeSnapshot.findOne({
            resumeId: resume._id,
            userId: new Types.ObjectId(userId),
        }).sort({ version: -1 });

        const nextVersion = (lastSnapshot?.version || 1) + 1;

        return ResumeSnapshot.create({
            userId: new Types.ObjectId(userId),
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
    async getSnapshots(userId: string, resumeId: string): Promise<IResumeSnapshot[]> {
        await this.getResumeById(userId, resumeId);
        return ResumeSnapshot.find({
            resumeId: new Types.ObjectId(resumeId),
            userId: new Types.ObjectId(userId),
        }).sort({ version: -1 });
    }

    /**
     * Get clean resume export data
     */
    async getResumeExportData(
        userId: string,
        resumeId: string,
        projectionMonths?: number
    ): Promise<{
        isProjected: boolean;
        projectionMonths?: number;
        targetCareer?: string;
        skillsStillToLearn: Array<{ skill: string; category?: string; priority: string; reason: string }>;
        interviewQuestions?: Array<{ category: string; question: string; idealAnswer: string; keyTalkingPoints: string[]; codeSnippetOrDiagram?: string }>;
        watermarkText: string;
        disclaimer: string;
        resume: {
            title: string;
            personalInfo: any;
            summary?: string;
            education: any[];
            experience: any[];
            skills: string[];
            technicalTools: string[];
            projects: any[];
            certifications: any[];
        };
    }> {
        const resume = await this.getResumeById(userId, resumeId);
        const latestAnalysis = await ResumeAnalysis.findOne({
            resumeId: resume._id,
            userId: new Types.ObjectId(userId),
        }).sort({ createdAt: -1 });

        const targetCareer = latestAnalysis?.targetCareer || "Target Career";
        const skillsStillToLearn = (latestAnalysis?.skillGaps || []).map((g) => ({
            skill: g.skill,
            category: g.category,
            priority: g.priority,
            reason: g.reason,
        }));

        if (projectionMonths && [3, 6, 12].includes(projectionMonths)) {
            const projection = await ResumeProjection.findOne({
                resumeId: resume._id,
                userId: new Types.ObjectId(userId),
                projectionTimelineMonths: projectionMonths as 3 | 6 | 12,
            });

            if (projection) {
                const projectedContent = (projection as any).projectedContent;
                let interviewQuestions: any[] = [];
                if (projectionMonths === 12) {
                    if (projection.interviewMastery?.technicalQuestions && projection.interviewMastery.technicalQuestions.length > 0) {
                        interviewQuestions = projection.interviewMastery.technicalQuestions;
                    } else {
                        const mastery = generateInterviewMastery(targetCareer, resume.parsedContent);
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
                    disclaimer:
                        "NOTICE: This document is a forward-looking projected resume generated by LifeFlow Resume Time Machine for career development and goal-setting purposes only. The planned skills, certifications, and projects represent aspirational learning milestones and have NOT yet been verified as completed professional credentials.",
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

export const resumeTimeMachineService = new ResumeTimeMachineService();
