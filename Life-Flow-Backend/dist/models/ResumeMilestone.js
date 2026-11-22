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
const resumeMilestoneSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    roadmapId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ResumeRoadmap",
        required: [true, "Roadmap ID is required"],
        index: true,
    },
    resumeId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
resumeMilestoneSchema.index({ roadmapId: 1, status: 1 });
resumeMilestoneSchema.index({ userId: 1, status: 1 });
exports.default = mongoose_1.default.model("ResumeMilestone", resumeMilestoneSchema);
