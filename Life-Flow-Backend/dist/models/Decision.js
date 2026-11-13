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
 * Schema for decision factors.
 */
const decisionFactorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Factor name is required"],
        trim: true,
        minlength: [1, "Factor name cannot be empty"],
        maxlength: [100, "Factor name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Factor description cannot exceed 500 characters"],
    },
    importance: {
        type: String,
        required: [true, "Factor importance is required"],
        enum: {
            values: ["low", "medium", "high"],
            message: "Invalid factor importance",
        },
        default: "medium",
    },
}, {
    _id: false,
});
/**
 * Schema for decision options.
 */
const decisionOptionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Option name is required"],
        trim: true,
        minlength: [1, "Option name cannot be empty"],
        maxlength: [100, "Option name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Option description cannot exceed 500 characters"],
    },
    pros: {
        type: [String],
        default: [],
    },
    cons: {
        type: [String],
        default: [],
    },
}, {
    _id: false,
});
/**
 * Main Decision schema.
 */
const decisionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    simulationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Simulation",
        index: true,
    },
    title: {
        type: String,
        required: [true, "Decision title is required"],
        trim: true,
        minlength: [2, "Decision title must be at least 2 characters"],
        maxlength: [150, "Decision title cannot exceed 150 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Decision description cannot exceed 1000 characters"],
    },
    category: {
        type: String,
        required: [true, "Decision category is required"],
        trim: true,
        maxlength: [50, "Decision category cannot exceed 50 characters"],
    },
    goal: {
        type: String,
        required: [true, "Decision goal is required"],
        trim: true,
        minlength: [2, "Decision goal must be at least 2 characters"],
        maxlength: [500, "Decision goal cannot exceed 500 characters"],
    },
    currentSituation: {
        type: String,
        trim: true,
        maxlength: [
            1000,
            "Current situation cannot exceed 1000 characters",
        ],
    },
    timeAvailable: {
        type: Number,
        min: [0, "Time available cannot be negative"],
    },
    budget: {
        type: Number,
        min: [0, "Budget cannot be negative"],
    },
    factors: {
        type: [decisionFactorSchema],
        default: [],
    },
    options: {
        type: [decisionOptionSchema],
        default: [],
    },
    status: {
        type: String,
        required: [true, "Decision status is required"],
        enum: {
            values: ["draft", "active", "completed"],
            message: "Invalid decision status",
        },
        default: "draft",
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
 * Indexes for efficient decision retrieval.
 */
decisionSchema.index({
    userId: 1,
    createdAt: -1,
});
decisionSchema.index({
    simulationId: 1,
    createdAt: -1,
});
/**
 * Create and export the Decision model.
 */
const Decision = mongoose_1.default.model("Decision", decisionSchema);
exports.default = Decision;
