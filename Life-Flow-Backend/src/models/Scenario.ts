import mongoose, { Schema, Types } from "mongoose";

/**
 * Represents a single step in a scenario timeline.
 */
export interface IScenarioStep {
    stepNumber: number;
    title: string;
    description: string;
    timeframe?: string;
}

/**
 * Represents a possible outcome of a scenario.
 */
export interface IScenarioOutcome {
    title: string;
    description: string;
    probability?: number;
    impact: "low" | "medium" | "high";
}

/**
 * Main Scenario document interface.
 */
export interface IScenario {
    simulationId: Types.ObjectId;
    userId: Types.ObjectId;
    name: string;
    description?: string;
    type: "optimistic" | "realistic" | "pessimistic" | "custom";
    score?: number;
    riskLevel: "low" | "medium" | "high";
    steps: IScenarioStep[];
    outcomes: IScenarioOutcome[];
    isSelected: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema for scenario steps.
 */
const scenarioStepSchema = new Schema<IScenarioStep>(
    {
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
            maxlength: [1000, "Step description cannot exceed 1000 characters"],
        },

        timeframe: {
            type: String,
            trim: true,
            maxlength: [100, "Timeframe cannot exceed 100 characters"],
        },
    },
    {
        _id: false,
    }
);

/**
 * Schema for scenario outcomes.
 */
const scenarioOutcomeSchema = new Schema<IScenarioOutcome>(
    {
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
            maxlength: [1000, "Outcome description cannot exceed 1000 characters"],
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
    },
    {
        _id: false,
    }
);

/**
 * Main Scenario schema.
 */
const scenarioSchema = new Schema<IScenario>(
    {
        simulationId: {
            type: Schema.Types.ObjectId,
            ref: "Simulation",
            required: [true, "Simulation ID is required"],
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
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
            maxlength: [1000, "Scenario description cannot exceed 1000 characters"],
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

        steps: {
            type: [scenarioStepSchema],
            default: [],
        },

        outcomes: {
            type: [scenarioOutcomeSchema],
            default: [],
        },

        isSelected: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

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
const Scenario = mongoose.model<IScenario>(
    "Scenario",
    scenarioSchema
);

export default Scenario;