import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGeneratedFutureProfile {
    introduction: string;
    timeHorizon: string;
    futureLifestyle: string;
    possibleAchievements: string[];
    developedHabits: string[];
    challenges: string[];
    lessons: string[];
    possibleRegrets: string[];
    turningPoints: string[];
    advice: string[];
    nextActions: string[];
    assumptions: string[];
    uncertainties: string[];
}

export interface IFutureSelfProfile extends Document {
    userId: Types.ObjectId;
    title: string;
    timeHorizon: "6 months" | "1 year" | "3 years" | "5 years" | "10 years";
    lifeAreas: string[];
    currentSituation: string;
    currentHabits?: string;
    strengths?: string;
    challenges?: string;
    responsibilities?: string;
    futureGoals: string;
    desiredIdentity?: string;
    desiredHabits?: string;
    concerns?: string;
    availableTime: string;
    monthlyBudget?: string;
    currentSkills?: string;
    availableSupport?: string;
    constraints?: string;
    generatedProfile: IGeneratedFutureProfile;
    status: "active" | "archived";
    createdAt: Date;
    updatedAt: Date;
}

const generatedProfileSchema = new Schema<IGeneratedFutureProfile>(
    {
        introduction: { type: String, required: true, trim: true },
        timeHorizon: { type: String, required: true, trim: true },
        futureLifestyle: { type: String, required: true, trim: true },
        possibleAchievements: [{ type: String, trim: true }],
        developedHabits: [{ type: String, trim: true }],
        challenges: [{ type: String, trim: true }],
        lessons: [{ type: String, trim: true }],
        possibleRegrets: [{ type: String, trim: true }],
        turningPoints: [{ type: String, trim: true }],
        advice: [{ type: String, trim: true }],
        nextActions: [{ type: String, trim: true }],
        assumptions: [{ type: String, trim: true }],
        uncertainties: [{ type: String, trim: true }],
    },
    { _id: false }
);

const futureSelfProfileSchema = new Schema<IFutureSelfProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        title: {
            type: String,
            required: [true, "Profile title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        timeHorizon: {
            type: String,
            enum: ["6 months", "1 year", "3 years", "5 years", "10 years"],
            required: [true, "Time horizon is required"],
        },
        lifeAreas: [
            {
                type: String,
                trim: true,
                required: true,
            },
        ],
        currentSituation: {
            type: String,
            required: [true, "Current situation is required"],
            trim: true,
            maxlength: [3000, "Current situation cannot exceed 3000 characters"],
        },
        currentHabits: { type: String, trim: true, maxlength: 2000 },
        strengths: { type: String, trim: true, maxlength: 2000 },
        challenges: { type: String, trim: true, maxlength: 2000 },
        responsibilities: { type: String, trim: true, maxlength: 2000 },
        futureGoals: {
            type: String,
            required: [true, "Future goals are required"],
            trim: true,
            maxlength: [3000, "Future goals cannot exceed 3000 characters"],
        },
        desiredIdentity: { type: String, trim: true, maxlength: 2000 },
        desiredHabits: { type: String, trim: true, maxlength: 2000 },
        concerns: { type: String, trim: true, maxlength: 2000 },
        availableTime: {
            type: String,
            required: [true, "Available time is required"],
            trim: true,
            maxlength: 500,
        },
        monthlyBudget: { type: String, trim: true, maxlength: 500 },
        currentSkills: { type: String, trim: true, maxlength: 2000 },
        availableSupport: { type: String, trim: true, maxlength: 2000 },
        constraints: { type: String, trim: true, maxlength: 2000 },
        generatedProfile: {
            type: generatedProfileSchema,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
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

futureSelfProfileSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IFutureSelfProfile>(
    "FutureSelfProfile",
    futureSelfProfileSchema
);
