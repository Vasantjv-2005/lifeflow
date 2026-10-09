
/**
 * Defines the allowed statuses for a LifeFlow simulation.
 */
export type SimulationStatus =
    | "draft"
    | "active"
    | "completed";

/**
 * Defines the supported types of nodes in a simulation tree.
 */
export type SimulationNodeType =
    | "start"
    | "decision"
    | "action"
    | "outcome";

/**
 * Represents the position of a node on the simulation canvas.
 */
export interface SimulationNodePosition {
    x: number;
    y: number;
}

/**
 * Represents a single node in a decision simulation.
 */
export interface SimulationNode {
    nodeId: string;
    type: SimulationNodeType;
    title: string;
    description?: string;
    position: SimulationNodePosition;
}

/**
 * Represents a connection between two simulation nodes.
 */
export interface SimulationEdge {
    edgeId: string;
    source: string;
    target: string;
    label?: string;
    condition?: string;
}

/**
 * Represents the data required to create a simulation.
 *
 * The userId is intentionally excluded because it must
 * come from the authenticated user's request context.
 */
export interface CreateSimulationData {
    title: string;
    description?: string;
    category: string;
    goal: string;
    status?: SimulationStatus;
    nodes?: SimulationNode[];
    edges?: SimulationEdge[];
}

/**
 * Represents the fields that may be updated on a simulation.
 */
export interface UpdateSimulationData {
    title?: string;
    description?: string;
    category?: string;
    goal?: string;
    status?: SimulationStatus;
    nodes?: SimulationNode[];
    edges?: SimulationEdge[];
}

/**
 * Represents the simulation data returned by application services.
 */
export interface SimulationData {
    id: string;
    userId: string;
    title: string;
    description?: string;
    category: string;
    goal: string;
    status: SimulationStatus;
    nodes: SimulationNode[];
    edges: SimulationEdge[];
    createdAt: Date;
    updatedAt: Date;
}
