import mongoose, { Document, Schema, Types } from "mongoose";
import { IParsedResumeContent } from "./Resume";

export interface IProjectedAchievement {
    milestoneId?: Types.ObjectId;
    title: string;
    category: string;
    plannedOrAchieved: "planned" | "achieved";
    monthTarget: number;
    description: string;
}

export interface IFoundationsGuide {
    coreConcepts: string[];
    toolsAndLanguages: string[];
    milestones: Array<{
        title: string;
        description: string;
        whyImportant: string;
        learningLinks: Array<{ title: string; url: string; type: string }>;
    }>;
    weeklyFocusPlan: Array<{
        week: string;
        focus: string;
        outcome: string;
    }>;
}

export interface IApiEndpointDoc {
    method: string;
    path: string;
    description: string;
}

export interface IFullStackDocumentation {
    architectureOverview: string;
    frontendSpec: string;
    backendSpec: string;
    databaseSchema: string;
    apiEndpoints: IApiEndpointDoc[];
    deploymentAndDevOps: string;
    stepByStepGuide: string[];
    keyResumeBullets: string[];
}

export interface ISolidProject {
    title: string;
    tagline: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced" | "Production-Ready";
    technologies: string[];
    fullStackDocumentation: IFullStackDocumentation;
}

export interface IRemainingSkillsAndProjects {
    remainingSkills: string[];
    solidProjects: ISolidProject[];
}

export interface ITechnicalQuestion {
    category: string;
    question: string;
    idealAnswer: string;
    keyTalkingPoints: string[];
    codeSnippetOrDiagram?: string;
}

export interface ITakeHomeChallenge {
    title: string;
    prompt: string;
    evaluationCriteria: string[];
}

export interface IInterviewMastery {
    targetRoleOverview: string;
    technicalQuestions: ITechnicalQuestion[];
    takeHomeChallenges: ITakeHomeChallenge[];
    interviewCheatSheet: string[];
}

export interface IResumeProjection extends Document {
    userId: Types.ObjectId;
    resumeId: Types.ObjectId;
    roadmapId: Types.ObjectId;
    projectionTimelineMonths: 3 | 6 | 12;
    projectedContent: IParsedResumeContent;
    plannedAchievements: IProjectedAchievement[];
    achievedMilestonesCount: number;
    foundationsGuide?: IFoundationsGuide;
    remainingSkillsAndProjects?: IRemainingSkillsAndProjects;
    interviewMastery?: IInterviewMastery;
    generatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const resumeProjectionSchema = new Schema<IResumeProjection>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        resumeId: {
            type: Schema.Types.ObjectId,
            ref: "Resume",
            required: [true, "Resume ID is required"],
            index: true,
        },
        roadmapId: {
            type: Schema.Types.ObjectId,
            ref: "ResumeRoadmap",
            required: [true, "Roadmap ID is required"],
        },
        projectionTimelineMonths: {
            type: Number,
            required: true,
        },
        projectedContent: {
            type: Schema.Types.Mixed,
            required: true,
        },
        plannedAchievements: [
            {
                milestoneId: { type: Schema.Types.ObjectId, ref: "ResumeMilestone" },
                title: { type: String, required: true },
                category: { type: String, default: "" },
                plannedOrAchieved: {
                    type: String,
                    default: "planned",
                },
                monthTarget: { type: Number, default: 3 },
                description: { type: String, default: "" },
            },
        ],
        achievedMilestonesCount: { type: Number, default: 0 },
        foundationsGuide: { type: Schema.Types.Mixed },
        remainingSkillsAndProjects: { type: Schema.Types.Mixed },
        interviewMastery: { type: Schema.Types.Mixed },
        generatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

resumeProjectionSchema.index({ resumeId: 1, projectionTimelineMonths: 1 });

export default mongoose.model<IResumeProjection>("ResumeProjection", resumeProjectionSchema);
