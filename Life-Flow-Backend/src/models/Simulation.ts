import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * A node represents one point in the LifeFlow decision graph.
 */
export interface ISimulationNode {
    nodeId: string;
    type: "start" | "decision" | "action" | "outcome";
    title: string;
    description?: string;
    position: {
        x: number;
        y: number;
    };
}

/**
 * An edge represents a connection between two nodes.
 */
export interface ISimulationEdge {
    edgeId: string;
    source: string;
    target: string;
    label?: string;
    condition?: string;
}

/**
 * Main Simulation document interface.
 */
export interface ISimulation extends Document {
    userId: Types.ObjectId;
    title: string;
    description?: string;
    category: string;
    goal: string;
    status: "draft" | "active" | "completed";
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema for simulation nodes.
 */
const simulationNodeSchema = new Schema<ISimulationNode>(
    {
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
    },
    {
        _id: false,
    }
);

/**
 * Schema for simulation edges.
 */
const simulationEdgeSchema = new Schema<ISimulationEdge>(
    {
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
    },
    {
        _id: false,
    }
);

/**
 * Main Simulation schema.
 */
const simulationSchema = new Schema<ISimulation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
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
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

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
const Simulation = mongoose.model<ISimulation>(
    "Simulation",
    simulationSchema
);

export default Simulation;