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
const resumeAnalysisSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    resumeId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
resumeAnalysisSchema.index({ userId: 1, resumeId: 1, createdAt: -1 });
exports.default = mongoose_1.default.model("ResumeAnalysis", resumeAnalysisSchema);
