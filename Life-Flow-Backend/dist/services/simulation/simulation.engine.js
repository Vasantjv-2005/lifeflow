"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulation = void 0;
/**
 * Default safety limits.
 */
const DEFAULT_MAX_PATHS = 100;
const DEFAULT_MAX_DEPTH = 100;
/**
 * Validates the input graph before traversal.
 *
 * Checks duplicate IDs, missing connections, invalid start nodes,
 * invalid outcome connections, and circular paths.
 */
const validateSimulation = (input) => {
    const { nodes, edges } = input;
    if (nodes.length === 0) {
        throw new Error("A simulation must contain at least one node.");
    }
    const nodeMap = new Map();
    for (const node of nodes) {
        if (!node.nodeId.trim()) {
            throw new Error("Every simulation node must have an ID.");
        }
        if (nodeMap.has(node.nodeId)) {
            throw new Error(`Duplicate node ID: ${node.nodeId}`);
        }
        nodeMap.set(node.nodeId, node);
    }
    const startNodes = nodes.filter((node) => node.type === "start");
    if (startNodes.length !== 1) {
        throw new Error("A simulation must contain exactly one start node.");
    }
    const edgeIds = new Set();
    const outgoingEdges = new Map();
    for (const edge of edges) {
        if (!edge.edgeId.trim()) {
            throw new Error("Every simulation edge must have an ID.");
        }
        if (edgeIds.has(edge.edgeId)) {
            throw new Error(`Duplicate edge ID: ${edge.edgeId}`);
        }
        edgeIds.add(edge.edgeId);
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode) {
            throw new Error(`Source node not found: ${edge.source}`);
        }
        if (!targetNode) {
            throw new Error(`Target node not found: ${edge.target}`);
        }
        if (sourceNode.type === "outcome") {
            throw new Error(`Outcome nodes cannot have outgoing edges: ${sourceNode.nodeId}`);
        }
        const sourceEdges = outgoingEdges.get(edge.source) ?? [];
        sourceEdges.push(edge);
        outgoingEdges.set(edge.source, sourceEdges);
    }
    // An outcome is a terminal node and cannot lead to another node.
    // Detect cycles using depth-first traversal.
    const visiting = new Set();
    const visited = new Set();
    const detectCycle = (nodeId) => {
        if (visiting.has(nodeId)) {
            throw new Error(`Circular path detected at node: ${nodeId}`);
        }
        if (visited.has(nodeId)) {
            return;
        }
        visiting.add(nodeId);
        for (const edge of outgoingEdges.get(nodeId) ?? []) {
            detectCycle(edge.target);
        }
        visiting.delete(nodeId);
        visited.add(nodeId);
    };
    for (const node of nodes) {
        detectCycle(node.nodeId);
    }
    return startNodes[0];
};
/**
 * Evaluates all possible paths from the start node to terminal nodes.
 *
 * This engine explores the supplied graph; it does not predict
 * real-world probabilities or generate missing branches.
 *
 * @param input - Simulation nodes and edges.
 * @param options - Optional traversal limits.
 * @returns All discovered paths and their terminal outcomes.
 */
const runSimulation = (input, options = {}) => {
    const maxPaths = options.maxPaths ?? DEFAULT_MAX_PATHS;
    const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
    if (!Number.isInteger(maxPaths) || maxPaths < 1) {
        throw new Error("maxPaths must be a positive integer.");
    }
    if (!Number.isInteger(maxDepth) || maxDepth < 1) {
        throw new Error("maxDepth must be a positive integer.");
    }
    const startNode = validateSimulation(input);
    const nodeMap = new Map(input.nodes.map((node) => [node.nodeId, node]));
    const outgoingEdges = new Map();
    for (const edge of input.edges) {
        const sourceEdges = outgoingEdges.get(edge.source) ?? [];
        sourceEdges.push(edge);
        outgoingEdges.set(edge.source, sourceEdges);
    }
    const paths = [];
    let pathCounter = 0;
    const explore = (currentNode, steps) => {
        if (steps.length > maxDepth) {
            throw new Error(`Simulation exceeded the maximum depth of ${maxDepth} steps.`);
        }
        const currentStep = {
            nodeId: currentNode.nodeId,
            type: currentNode.type,
            title: currentNode.title,
            ...(currentNode.description !== undefined
                ? { description: currentNode.description }
                : {}),
        };
        const currentPath = [...steps, currentStep];
        const edges = outgoingEdges.get(currentNode.nodeId) ?? [];
        if (currentNode.type === "outcome" || edges.length === 0) {
            if (paths.length >= maxPaths) {
                throw new Error(`Simulation exceeded the maximum of ${maxPaths} paths.`);
            }
            pathCounter += 1;
            paths.push({
                pathId: `path-${pathCounter}`,
                steps: currentPath,
                outcome: currentNode,
                totalSteps: currentPath.length,
            });
            return;
        }
        for (const edge of edges) {
            const nextNode = nodeMap.get(edge.target);
            if (!nextNode) {
                // Graph validation should catch this before traversal.
                throw new Error(`Target node not found: ${edge.target}`);
            }
            const previousStep = currentPath[currentPath.length - 1];
            const stepWithEdge = {
                ...previousStep,
                ...(edge.label !== undefined
                    ? { edgeLabel: edge.label }
                    : {}),
                ...(edge.condition !== undefined
                    ? { condition: edge.condition }
                    : {}),
            };
            explore(nextNode, [
                ...currentPath.slice(0, -1),
                stepWithEdge,
            ]);
        }
    };
    explore(startNode, []);
    return {
        startNodeId: startNode.nodeId,
        paths,
        totalPaths: paths.length,
    };
};
exports.runSimulation = runSimulation;
