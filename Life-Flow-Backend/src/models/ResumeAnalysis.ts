import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISkillGap {
    skill: string;
    category: "technical" | "tool" | "soft" | "domain";
    priority: "high" | "medium" | "low";
    reason: string;
}

export interface IReadinessAssessment {
    score: number;
    criteriaExplanation: string;
    summary: string;
    recommendedFocusAreas: string[];
}

export interface IResumeAnalysis extends Document {
    userId: Types.ObjectId;
    resumeId: Types.ObjectId;
    targetCareer: string;
    targetRoleLevel: "entry" | "junior" | "mid" | "senior";
    timelineMonths: 3 | 6 | 12;
    weeklyHoursAvailable: number;
    currentExperienceLevel: "beginner" | "intermediate" | "advanced";
    preferredIndustry?: string;
    strengths: string[];
    existingDemonstratedSkills: string[];
    skillsNeedingImprovement: string[];
    skillGaps: ISkillGap[];
    experienceGaps: string[];
    portfolioRecommendations: string[];
    certificationRecommendations: string[];
    readinessAssessment: IReadinessAssessment;
    createdAt: Date;
    updatedAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
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
        targetCareer: {
            type: String,
            required: [true, "Target career is required"],
            trim: true,
            maxlength: 150,
        },
        targetRoleLevel: {
            type: String,
            enum: ["entry", "junior", "mid", "senior"],
            default: "entry",
        },
        timelineMonths: {
            type: Number,
            enum: [3, 6, 12],
            default: 6,
        },
        weeklyHoursAvailable: {
            type: Number,
            default: 15,
            min: 1,
            max: 100,
        },
        currentExperienceLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        preferredIndustry: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        strengths: { type: [String], default: [] },
        existingDemonstratedSkills: { type: [String], default: [] },
        skillsNeedingImprovement: { type: [String], default: [] },
        skillGaps: [
            {
                skill: { type: String, required: true },
                category: {
                    type: String,
                    default: "technical",
                },
                priority: {
                    type: String,
                    default: "high",
                },
                reason: { type: String, default: "" },
            },
        ],
        experienceGaps: { type: [String], default: [] },
        portfolioRecommendations: { type: [String], default: [] },
        certificationRecommendations: { type: [String], default: [] },
        readinessAssessment: {
            score: { type: Number, min: 0, max: 100, default: 50 },
            criteriaExplanation: { type: String, default: "" },
            summary: { type: String, default: "" },
            recommendedFocusAreas: { type: [String], default: [] },
        },
    },
    {
        timestamps: true,
    }
);

resumeAnalysisSchema.index({ userId: 1, resumeId: 1, createdAt: -1 });

export default mongoose.model<IResumeAnalysis>("ResumeAnalysis", resumeAnalysisSchema);
