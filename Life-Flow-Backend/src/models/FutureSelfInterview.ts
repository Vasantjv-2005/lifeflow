import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDecisionSummary {
    benefits: string[];
    risks: string[];
    tradeOffs: string[];
    nextSteps: string[];
    fullSummary: string;
    spokenText: string;
    generatedAt: Date;
}

export interface IFutureSelfInterview extends Document {
    userId: Types.ObjectId;
    futureSelfProfileId: Types.ObjectId;
    title: string;
    status: "active" | "completed";
    startedAt: Date;
    lastMessageAt: Date;
    decisionSummary?: IDecisionSummary;
    reflectionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const decisionSummarySchema = new Schema<IDecisionSummary>(
    {
        benefits: [{ type: String, trim: true }],
        risks: [{ type: String, trim: true }],
        tradeOffs: [{ type: String, trim: true }],
        nextSteps: [{ type: String, trim: true }],
        fullSummary: { type: String, required: true, trim: true },
        spokenText: { type: String, required: true, trim: true },
        generatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const futureSelfInterviewSchema = new Schema<IFutureSelfInterview>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        futureSelfProfileId: {
            type: Schema.Types.ObjectId,
            ref: "FutureSelfProfile",
            required: [true, "Profile ID is required"],
            index: true,
        },
        title: {
            type: String,
            required: [true, "Interview title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
            index: true,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        decisionSummary: {
            type: decisionSummarySchema,
        },
        reflectionNotes: {
            type: String,
            trim: true,
            maxlength: [5000, "Reflection cannot exceed 5000 characters"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                if (ret._id) ret.id = ret._id.toString();
                return ret;
            },
        },
    }
);

futureSelfInterviewSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.model<IFutureSelfInterview>(
    "FutureSelfInterview",
    futureSelfInterviewSchema
);
