import { describe, it } from "node:test";
import assert from "node:assert";
import { runSimulation } from "../src/services/simulation/simulation.engine";
import type { SimulationEngineInput } from "../src/services/simulation/simulation.engine";

describe("Simulation Engine", () => {
    it("should successfully evaluate a linear path from start to outcome", () => {
        const input: SimulationEngineInput = {
            nodes: [
                {
                    nodeId: "n-start",
                    type: "start",
                    title: "Career Transition Decision",
                    position: { x: 0, y: 0 },
                },
                {
                    nodeId: "n-action",
                    type: "action",
                    title: "Complete Bootcamp",
                    position: { x: 100, y: 100 },
                },
                {
                    nodeId: "n-outcome",
                    type: "outcome",
                    title: "Become Full-Stack Developer",
                    position: { x: 200, y: 200 },
                },
            ],
            edges: [
                {
                    edgeId: "e-1",
                    source: "n-start",
                    target: "n-action",
                    label: "Enroll",
                },
                {
                    edgeId: "e-2",
                    source: "n-action",
                    target: "n-outcome",
                    label: "Graduate",
                },
            ],
        };

        const result = runSimulation(input);

        assert.strictEqual(result.totalPaths, 1);
        assert.strictEqual(result.startNodeId, "n-start");
        assert.strictEqual(result.paths[0].steps.length, 3);
        assert.strictEqual(result.paths[0].outcome.nodeId, "n-outcome");
        assert.strictEqual(result.paths[0].steps[0].edgeLabel, "Enroll");
        assert.strictEqual(result.paths[0].steps[1].edgeLabel, "Graduate");
    });

    it("should evaluate branching paths with multiple outcomes", () => {
        const input: SimulationEngineInput = {
            nodes: [
                {
                    nodeId: "start-1",
                    type: "start",
                    title: "Product Launch",
                    position: { x: 0, y: 0 },
                },
                {
                    nodeId: "dec-1",
                    type: "decision",
                    title: "Marketing Strategy",
                    position: { x: 100, y: 0 },
                },
                {
                    nodeId: "out-high",
                    type: "outcome",
                    title: "High Growth",
                    position: { x: 200, y: -50 },
                },
                {
                    nodeId: "out-slow",
                    type: "outcome",
                    title: "Slow Growth",
                    position: { x: 200, y: 50 },
                },
            ],
            edges: [
                {
                    edgeId: "e-0",
                    source: "start-1",
                    target: "dec-1",
                },
                {
                    edgeId: "e-high",
                    source: "dec-1",
                    target: "out-high",
                    label: "Aggressive Ads",
                },
                {
                    edgeId: "e-slow",
                    source: "dec-1",
                    target: "out-slow",
                    label: "Organic Only",
                },
            ],
        };

        const result = runSimulation(input);

        assert.strictEqual(result.totalPaths, 2);
        assert.strictEqual(result.paths[0].outcome.type, "outcome");
        assert.strictEqual(result.paths[1].outcome.type, "outcome");
    });

    it("should detect and reject circular references", () => {
        const input: SimulationEngineInput = {
            nodes: [
                {
                    nodeId: "s-1",
                    type: "start",
                    title: "Start Loop",
                    position: { x: 0, y: 0 },
                },
                {
                    nodeId: "step-a",
                    type: "action",
                    title: "Step A",
                    position: { x: 100, y: 0 },
                },
                {
                    nodeId: "step-b",
                    type: "action",
                    title: "Step B",
                    position: { x: 200, y: 0 },
                },
            ],
            edges: [
                { edgeId: "e-1", source: "s-1", target: "step-a" },
                { edgeId: "e-2", source: "step-a", target: "step-b" },
                { edgeId: "e-3", source: "step-b", target: "step-a" }, // Loop back!
            ],
        };

        assert.throws(() => {
            runSimulation(input);
        }, /Circular path detected/);
    });

    it("should reject simulations without a start node", () => {
        const input: SimulationEngineInput = {
            nodes: [
                {
                    nodeId: "action-only",
                    type: "action",
                    title: "No Start",
                    position: { x: 0, y: 0 },
                },
            ],
            edges: [],
        };

        assert.throws(() => {
            runSimulation(input);
        }, /exactly one start node/);
    });

    it("should reject outgoing edges from outcome nodes", () => {
        const input: SimulationEngineInput = {
            nodes: [
                {
                    nodeId: "start-node",
                    type: "start",
                    title: "Start",
                    position: { x: 0, y: 0 },
                },
                {
                    nodeId: "outcome-node",
                    type: "outcome",
                    title: "Terminal",
                    position: { x: 100, y: 0 },
                },
                {
                    nodeId: "after-outcome",
                    type: "action",
                    title: "Illegal Action",
                    position: { x: 200, y: 0 },
                },
            ],
            edges: [
                { edgeId: "e-1", source: "start-node", target: "outcome-node" },
                { edgeId: "e-2", source: "outcome-node", target: "after-outcome" },
            ],
        };

        assert.throws(() => {
            runSimulation(input);
        }, /Outcome nodes cannot have outgoing edges/);
    });

    it("should respect maxPaths safety limits", () => {
        const input: SimulationEngineInput = {
            nodes: [
                {
                    nodeId: "start",
                    type: "start",
                    title: "Start",
                    position: { x: 0, y: 0 },
                },
                {
                    nodeId: "out-1",
                    type: "outcome",
                    title: "Out 1",
                    position: { x: 100, y: -50 },
                },
                {
                    nodeId: "out-2",
                    type: "outcome",
                    title: "Out 2",
                    position: { x: 100, y: 50 },
                },
            ],
            edges: [
                { edgeId: "e-1", source: "start", target: "out-1" },
                { edgeId: "e-2", source: "start", target: "out-2" },
            ],
        };

        // Setting maxPaths to 1 should trigger limit error when 2 paths are found
        assert.throws(() => {
            runSimulation(input, { maxPaths: 1 });
        }, /Simulation exceeded the maximum of 1 paths/);
    });
});

