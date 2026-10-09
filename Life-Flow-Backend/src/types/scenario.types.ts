
/**
 * Defines the supported scenario categories.
 */
export type ScenarioType =
    | "optimistic"
    | "realistic"
    | "pessimistic"
    | "custom";

/**
 * Defines the possible risk levels for a scenario.
 */
export type ScenarioRiskLevel = "low" | "medium" | "high";

/**
 * Defines the impact levels for a scenario outcome.
 */
export type ScenarioImpact = "low" | "medium" | "high";

/**
 * Represents one step in a scenario's timeline.
 */
export interface ScenarioStep {
    stepNumber: number;
    title: string;
    description: string;
    timeframe?: string;
}

/**
 * Represents a possible outcome of a scenario.
 */
export interface ScenarioOutcome {
    title: string;
    description: string;
    probability?: number;
    impact: ScenarioImpact;
}

/**
 * Data required to create a scenario.
 *
 * userId is intentionally excluded because it must come
 * from the authenticated user's context.
 */
export interface CreateScenarioData {
    simulationId: string;
    name: string;
    description?: string;
    type?: ScenarioType;
    score?: number;
    riskLevel?: ScenarioRiskLevel;
    steps?: ScenarioStep[];
    outcomes?: ScenarioOutcome[];
    isSelected?: boolean;
}

/**
 * Fields that may be updated on an existing scenario.
 */
export interface UpdateScenarioData {
    name?: string;
    description?: string;
    type?: ScenarioType;
    score?: number;
    riskLevel?: ScenarioRiskLevel;
    steps?: ScenarioStep[];
    outcomes?: ScenarioOutcome[];
    isSelected?: boolean;
}

/**
 * Represents scenario data returned by application services.
 */
export interface ScenarioData {
    id: string;
    simulationId: string;
    userId: string;
    name: string;
    description?: string;
    type: ScenarioType;
    score?: number;
    riskLevel: ScenarioRiskLevel;
    steps: ScenarioStep[];
    outcomes: ScenarioOutcome[];
    isSelected: boolean;
    createdAt: Date;
    updatedAt: Date;
}
