import mongoose, { Document, Schema, Types } from "mongoose";
import { IParsedResumeContent } from "./Resume";

export interface IResumeSnapshot extends Document {
    userId: Types.ObjectId;
    resumeId: Types.ObjectId;
    version: number;
    title: string;
    snapshotType: "current" | "projected_3m" | "projected_6m" | "projected_12m" | "milestone_update";
    snapshotContent: IParsedResumeContent;
    changeLog: string[];
    createdAt: Date;
}

const resumeSnapshotSchema = new Schema<IResumeSnapshot>(
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
        version: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        snapshotType: {
            type: String,
            enum: ["current", "projected_3m", "projected_6m", "projected_12m", "milestone_update"],
            default: "current",
        },
        snapshotContent: {
            type: Schema.Types.Mixed,
            required: true,
        },
        changeLog: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

resumeSnapshotSchema.index({ resumeId: 1, version: -1 });

export default mongoose.model<IResumeSnapshot>("ResumeSnapshot", resumeSnapshotSchema);
