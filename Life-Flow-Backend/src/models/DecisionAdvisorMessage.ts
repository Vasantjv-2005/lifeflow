import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDecisionAdvisorMessage extends Document {
    decisionId: Types.ObjectId;
    userId: Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    suggestedQuestions?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const decisionAdvisorMessageSchema = new Schema<IDecisionAdvisorMessage>(
    {
        decisionId: {
            type: Schema.Types.ObjectId,
            ref: "Decision",
            required: [true, "Decision ID is required"],
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: [true, "Role must be user or assistant"],
        },
        content: {
            type: String,
            required: [true, "Message content is required"],
            trim: true,
            maxlength: [4000, "Message cannot exceed 4000 characters"],
        },
        suggestedQuestions: {
            type: [String],
            default: [],
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

decisionAdvisorMessageSchema.index({ decisionId: 1, createdAt: 1 });
decisionAdvisorMessageSchema.index({ userId: 1, decisionId: 1 });

export default mongoose.model<IDecisionAdvisorMessage>(
    "DecisionAdvisorMessage",
    decisionAdvisorMessageSchema
);
