import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRoadmapPhase {
    phaseNumber: number;
    title: string;
    description: string;
    durationWeeks: number;
    milestoneCount: number;
}

export interface IResumeRoadmap extends Document {
    userId: Types.ObjectId;
    resumeId: Types.ObjectId;
    analysisId: Types.ObjectId;
    targetCareer: string;
    targetTimelineMonths: 3 | 6 | 12;
    phases: IRoadmapPhase[];
    totalMilestones: number;
    completedMilestones: number;
    overallProgressPercentage: number;
    createdAt: Date;
    updatedAt: Date;
}

const resumeRoadmapSchema = new Schema<IResumeRoadmap>(
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
        analysisId: {
            type: Schema.Types.ObjectId,
            ref: "ResumeAnalysis",
            required: [true, "Analysis ID is required"],
        },
        targetCareer: {
            type: String,
            required: [true, "Target career is required"],
            trim: true,
        },
        targetTimelineMonths: {
            type: Number,
            default: 6,
        },
        phases: [
            {
                phaseNumber: { type: Number, required: true },
                title: { type: String, required: true },
                description: { type: String, default: "" },
                durationWeeks: { type: Number, default: 4 },
                milestoneCount: { type: Number, default: 0 },
            },
        ],
        totalMilestones: { type: Number, default: 0 },
        completedMilestones: { type: Number, default: 0 },
        overallProgressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    {
        timestamps: true,
    }
);

resumeRoadmapSchema.index({ userId: 1, resumeId: 1, createdAt: -1 });

export default mongoose.model<IResumeRoadmap>("ResumeRoadmap", resumeRoadmapSchema);
