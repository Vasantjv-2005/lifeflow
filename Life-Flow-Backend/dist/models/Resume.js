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
const resumeSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    originalFileName: {
        type: String,
        required: [true, "Original file name is required"],
        trim: true,
        maxlength: 255,
    },
    fileType: {
        type: String,
        required: [true, "File type is required"],
        enum: ["pdf", "docx"],
    },
    fileSize: {
        type: Number,
        required: [true, "File size is required"],
        max: [5 * 1024 * 1024, "File size cannot exceed 5MB"],
    },
    parsedContent: {
        personalInfo: {
            fullName: { type: String, default: "" },
            email: { type: String, default: "" },
            phone: { type: String, default: "" },
            location: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            github: { type: String, default: "" },
            portfolio: { type: String, default: "" },
        },
        summary: { type: String, default: "" },
        education: [
            {
                institution: { type: String, required: true },
                degree: { type: String, required: true },
                fieldOfStudy: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" },
                gpa: { type: String, default: "" },
            },
        ],
        experience: [
            {
                company: { type: String, required: true },
                role: { type: String, required: true },
                location: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" },
                current: { type: Boolean, default: false },
                description: { type: String, default: "" },
                achievements: { type: [String], default: [] },
            },
        ],
        skills: { type: [String], default: [] },
        technicalTools: { type: [String], default: [] },
        projects: [
            {
                name: { type: String, required: true },
                description: { type: String, default: "" },
                technologies: { type: [String], default: [] },
                link: { type: String, default: "" },
                highlights: { type: [String], default: [] },
                isPlanned: { type: Boolean, default: false },
            },
        ],
        certifications: [
            {
                name: { type: String, required: true },
                issuer: { type: String, required: true },
                issueDate: { type: String, default: "" },
                credentialId: { type: String, default: "" },
                isPlanned: { type: Boolean, default: false },
            },
        ],
        languages: { type: [String], default: [] },
        achievements: { type: [String], default: [] },
    },
    rawText: {
        type: String,
        default: "",
    },
    parsingStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    parsingError: {
        type: String,
    },
}, {
    timestamps: true,
});
resumeSchema.index({ userId: 1, createdAt: -1 });
exports.default = mongoose_1.default.model("Resume", resumeSchema);
