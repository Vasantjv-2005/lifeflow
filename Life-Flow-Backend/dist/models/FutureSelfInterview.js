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
const decisionSummarySchema = new mongoose_1.Schema({
    benefits: [{ type: String, trim: true }],
    risks: [{ type: String, trim: true }],
    tradeOffs: [{ type: String, trim: true }],
    nextSteps: [{ type: String, trim: true }],
    fullSummary: { type: String, required: true, trim: true },
    spokenText: { type: String, required: true, trim: true },
    generatedAt: { type: Date, default: Date.now },
}, { _id: false });
const futureSelfInterviewSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    futureSelfProfileId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
futureSelfInterviewSchema.index({ userId: 1, lastMessageAt: -1 });
exports.default = mongoose_1.default.model("FutureSelfInterview", futureSelfInterviewSchema);
