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
 * Schema for simulation nodes.
 */
const simulationNodeSchema = new mongoose_1.Schema({
    nodeId: {
        type: String,
        required: [true, "Node ID is required"],
        trim: true,
    },
    type: {
        type: String,
        required: [true, "Node type is required"],
        enum: {
            values: ["start", "decision", "action", "outcome"],
            message: "Invalid node type",
        },
    },
    title: {
        type: String,
        required: [true, "Node title is required"],
        trim: true,
        minlength: [1, "Node title cannot be empty"],
        maxlength: [200, "Node title cannot exceed 200 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Node description cannot exceed 1000 characters"],
    },
    position: {
        x: {
            type: Number,
            required: [true, "Node X position is required"],
            default: 0,
        },
        y: {
            type: Number,
            required: [true, "Node Y position is required"],
            default: 0,
        },
    },
}, {
    _id: false,
});
/**
 * Schema for simulation edges.
 */
const simulationEdgeSchema = new mongoose_1.Schema({
    edgeId: {
        type: String,
        required: [true, "Edge ID is required"],
        trim: true,
    },
    source: {
        type: String,
        required: [true, "Source node is required"],
        trim: true,
    },
    target: {
        type: String,
        required: [true, "Target node is required"],
        trim: true,
    },
    label: {
        type: String,
        trim: true,
        maxlength: [200, "Edge label cannot exceed 200 characters"],
    },
    condition: {
        type: String,
        trim: true,
        maxlength: [500, "Edge condition cannot exceed 500 characters"],
    },
}, {
    _id: false,
});
/**
 * Main Simulation schema.
 */
const simulationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    title: {
        type: String,
        required: [true, "Simulation title is required"],
        trim: true,
        minlength: [2, "Simulation title must be at least 2 characters"],
        maxlength: [100, "Simulation title cannot exceed 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [
            1000,
            "Simulation description cannot exceed 1000 characters",
        ],
    },
    category: {
        type: String,
        required: [true, "Simulation category is required"],
        trim: true,
        maxlength: [50, "Simulation category cannot exceed 50 characters"],
    },
    goal: {
        type: String,
        required: [true, "Simulation goal is required"],
        trim: true,
        minlength: [2, "Simulation goal must be at least 2 characters"],
        maxlength: [500, "Simulation goal cannot exceed 500 characters"],
    },
    status: {
        type: String,
        enum: {
            values: ["draft", "active", "completed"],
            message: "Invalid simulation status",
        },
        default: "draft",
    },
    nodes: {
        type: [simulationNodeSchema],
        default: [],
    },
    edges: {
        type: [simulationEdgeSchema],
        default: [],
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
 * Index for efficiently retrieving a user's simulations.
 */
simulationSchema.index({
    userId: 1,
    createdAt: -1,
});
/**
 * Create and export the Simulation model.
 */
const Simulation = mongoose_1.default.model("Simulation", simulationSchema);
exports.default = Simulation;
