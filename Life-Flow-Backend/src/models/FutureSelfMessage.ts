import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessageMetadata {
    spokenTranscript?: string;
    tokens?: number;
    suggestedQuestions?: string[];
}

export interface IFutureSelfMessage extends Document {
    userId: Types.ObjectId;
    interviewId: Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    metadata?: IMessageMetadata;
    createdAt: Date;
    updatedAt: Date;
}

const futureSelfMessageSchema = new Schema<IFutureSelfMessage>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        interviewId: {
            type: Schema.Types.ObjectId,
            ref: "FutureSelfInterview",
            required: [true, "Interview ID is required"],
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
        metadata: {
            spokenTranscript: { type: String, trim: true },
            tokens: { type: Number },
            suggestedQuestions: [{ type: String, trim: true }],
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

futureSelfMessageSchema.index({ interviewId: 1, createdAt: 1 });

export default mongoose.model<IFutureSelfMessage>(
    "FutureSelfMessage",
    futureSelfMessageSchema
);
