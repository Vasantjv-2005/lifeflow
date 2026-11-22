import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMilestoneResource {
    title: string;
    url: string;
    type: "course" | "documentation" | "tutorial" | "book" | "lab";
    provider?: string;
    badge?: string;
}

export interface IResumeMilestone extends Document {
    userId: Types.ObjectId;
    roadmapId: Types.ObjectId;
    resumeId: Types.ObjectId;
    phaseNumber: number;
    phaseTitle: string;
    title: string;
    description: string;
    category: "technical" | "soft" | "project" | "certification" | "portfolio" | "interview";
    requiredSkills: string[];
    learningObjectives: string[];
    recommendedResources: IMilestoneResource[];
    practicalActivities: string[];
    expectedDeliverable: string;
    estimatedDurationWeeks: number;
    priority: "high" | "medium" | "low";
    dependencies: string[];
    completionCriteria: string;
    status: "planned" | "in_progress" | "completed";
    completionDescription?: string;
    evidenceUrl?: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const resumeMilestoneSchema = new Schema<IResumeMilestone>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        roadmapId: {
            type: Schema.Types.ObjectId,
            ref: "ResumeRoadmap",
            required: [true, "Roadmap ID is required"],
            index: true,
        },
        resumeId: {
            type: Schema.Types.ObjectId,
            ref: "Resume",
            required: [true, "Resume ID is required"],
            index: true,
        },
        phaseNumber: { type: Number, required: true },
        phaseTitle: { type: String, required: true },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true },
        category: {
            type: String,
            default: "technical",
        },
        requiredSkills: { type: [String], default: [] },
        learningObjectives: { type: [String], default: [] },
        recommendedResources: [
            {
                title: { type: String, required: true },
                url: { type: String, default: "" },
                type: {
                    type: String,
                    default: "course",
                },
                provider: { type: String, default: "" },
                badge: { type: String, default: "" },
            },
        ],
        practicalActivities: { type: [String], default: [] },
        expectedDeliverable: { type: String, default: "" },
        estimatedDurationWeeks: { type: Number, default: 2 },
        priority: {
            type: String,
            default: "medium",
        },
        dependencies: { type: [String], default: [] },
        completionCriteria: { type: String, default: "" },
        status: {
            type: String,
            enum: ["planned", "in_progress", "completed"],
            default: "planned",
        },
        completionDescription: { type: String, trim: true },
        evidenceUrl: { type: String, trim: true },
        completedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

resumeMilestoneSchema.index({ roadmapId: 1, status: 1 });
resumeMilestoneSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IResumeMilestone>("ResumeMilestone", resumeMilestoneSchema);
