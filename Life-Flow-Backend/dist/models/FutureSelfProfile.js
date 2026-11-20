"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const generatedProfileSchema = new mongoose_1.Schema({
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
}, { _id: false });
const futureSelfProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            if (ret._id)
                ret.id = ret._id.toString();
            return ret;
        },
    },
});
futureSelfProfileSchema.index({ userId: 1, createdAt: -1 });
exports.default = mongoose_1.default.model("FutureSelfProfile", futureSelfProfileSchema);
