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
/**
 * Schema for scenario steps.
 */
const scenarioStepSchema = new mongoose_1.Schema({
    stepNumber: {
        type: Number,
        required: [true, "Step number is required"],
        min: [1, "Step number must be at least 1"],
    },
    title: {
        type: String,
        required: [true, "Step title is required"],
        trim: true,
        minlength: [1, "Step title cannot be empty"],
        maxlength: [200, "Step title cannot exceed 200 characters"],
    },
    description: {
        type: String,
        required: [true, "Step description is required"],
        trim: true,
        maxlength: [3000, "Step description cannot exceed 3000 characters"],
    },
    timeframe: {
        type: String,
        trim: true,
        maxlength: [100, "Timeframe cannot exceed 100 characters"],
    },
    whatToDo: {
        type: String,
        trim: true,
        maxlength: [2000, "What to do cannot exceed 2000 characters"],
    },
    howToDoIt: {
        type: String,
        trim: true,
        maxlength: [2000, "How to do it cannot exceed 2000 characters"],
    },
    targetResult: {
        type: String,
        trim: true,
        maxlength: [2000, "Target result cannot exceed 2000 characters"],
    },
    completionCheck: {
        type: String,
        trim: true,
        maxlength: [2000, "Completion check cannot exceed 2000 characters"],
    },
}, {
    _id: false,
});
/**
 * Schema for scenario outcomes.
 */
const scenarioOutcomeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Outcome title is required"],
        trim: true,
        minlength: [1, "Outcome title cannot be empty"],
        maxlength: [200, "Outcome title cannot exceed 200 characters"],
    },
    description: {
        type: String,
        required: [true, "Outcome description is required"],
        trim: true,
        maxlength: [3000, "Outcome description cannot exceed 3000 characters"],
    },
    probability: {
        type: Number,
        min: [0, "Probability cannot be less than 0"],
        max: [100, "Probability cannot be greater than 100"],
    },
    impact: {
        type: String,
        required: [true, "Outcome impact is required"],
        enum: {
            values: ["low", "medium", "high"],
            message: "Invalid outcome impact",
        },
    },
    likelihood: {
        type: String,
        trim: true,
        maxlength: [500, "Likelihood cannot exceed 500 characters"],
    },
    userControls: {
        type: String,
        trim: true,
        maxlength: [2000, "User controls description cannot exceed 2000 characters"],
    },
    dependsOnOthersOrMarket: {
        type: String,
        trim: true,
        maxlength: [2000, "Market dependencies description cannot exceed 2000 characters"],
    },
}, {
    _id: false,
});
/**
 * Main Scenario schema.
 */
const scenarioSchema = new mongoose_1.Schema({
    decisionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Decision",
        index: true,
    },
    simulationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Simulation",
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    name: {
        type: String,
        required: [true, "Scenario name is required"],
        trim: true,
        minlength: [2, "Scenario name must be at least 2 characters"],
        maxlength: [100, "Scenario name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [3000, "Scenario description cannot exceed 3000 characters"],
    },
    type: {
        type: String,
        required: [true, "Scenario type is required"],
        enum: {
            values: [
                "optimistic",
                "realistic",
                "pessimistic",
                "custom",
            ],
            message: "Invalid scenario type",
        },
        default: "realistic",
    },
    score: {
        type: Number,
        min: [0, "Score cannot be less than 0"],
        max: [100, "Score cannot be greater than 100"],
    },
    riskLevel: {
        type: String,
        required: [true, "Risk level is required"],
        enum: {
            values: ["low", "medium", "high"],
            message: "Invalid risk level",
        },
        default: "medium",
    },
    expectedTimeline: {
        type: String,
        trim: true,
        maxlength: [200, "Timeline cannot exceed 200 characters"],
    },
    advantages: {
        type: [String],
        default: [],
    },
    challenges: {
        type: [String],
        default: [],
    },
    requiredResources: {
        type: [String],
        default: [],
    },
    backupPlan: {
        type: String,
        trim: true,
        maxlength: [3000, "Backup plan cannot exceed 3000 characters"],
    },
    steps: {
        type: [scenarioStepSchema],
        default: [],
    },
    outcomes: {
        type: [scenarioOutcomeSchema],
        default: [],
    },
    learningRoadmap: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
    },
    interviewPreparation: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
    },
    opportunitiesAndBackup: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
    },
    isSelected: {
        type: Boolean,
        default: false,
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
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            if (ret._id)
                ret.id = ret._id.toString();
            return ret;
        },
    },
});
/**
 * Indexes for efficient scenario retrieval.
 */
scenarioSchema.index({
    simulationId: 1,
    createdAt: -1,
});
scenarioSchema.index({
    userId: 1,
    createdAt: -1,
});
/**
 * Create and export the Scenario model.
 */
const Scenario = mongoose_1.default.model("Scenario", scenarioSchema);
exports.default = Scenario;
