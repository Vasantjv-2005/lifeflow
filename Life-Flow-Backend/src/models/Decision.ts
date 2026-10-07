import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * Represents one factor that can influence a decision.
 */
export interface IDecisionFactor {
    name: string;
    description?: string;
    importance: "low" | "medium" | "high";
}

/**
 * Represents an option available for the decision.
 */
export interface IDecisionOption {
    name: string;
    description?: string;
    pros: string[];
    cons: string[];
}

/**
 * Main Decision document interface.
 */
export interface IDecision extends Document {
    userId: Types.ObjectId;
    simulationId?: Types.ObjectId;
    title: string;
    description?: string;
    category: string;
    goal: string;
    currentSituation?: string;
    timeAvailable?: number;
    budget?: number;
    factors: IDecisionFactor[];
    options: IDecisionOption[];
    status: "draft" | "active" | "completed";
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema for decision factors.
 */
const decisionFactorSchema = new Schema<IDecisionFactor>(
    {
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
    },
    {
        _id: false,
    }
);

/**
 * Schema for decision options.
 */
const decisionOptionSchema = new Schema<IDecisionOption>(
    {
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
    },
    {
        _id: false,
    }
);

/**
 * Main Decision schema.
 */
const decisionSchema = new Schema<IDecision>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },

        simulationId: {
            type: Schema.Types.ObjectId,
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
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

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
const Decision = mongoose.model<IDecision>(
    "Decision",
    decisionSchema
);

export default Decision;