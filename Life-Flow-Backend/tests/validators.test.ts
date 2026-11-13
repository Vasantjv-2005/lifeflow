import { describe, it } from "node:test";
import assert from "node:assert";
import { registerSchema, loginSchema } from "../src/validators/auth.validator";
import { createSimulationSchema } from "../src/validators/simulation.validator";
import { generateScenariosRequestSchema } from "../src/validators/ai.validator";
import { createDecisionSchema } from "../src/validators/decision.validator";

describe("Validation Schemas", () => {
    describe("Auth Validator", () => {
        it("should accept valid registration input", () => {
            const valid = {
                name: "John Doe",
                email: "John.Doe@example.com",
                password: "password123",
            };
            const result = registerSchema.safeParse(valid);
            assert.strictEqual(result.success, true);
            if (result.success) {
                assert.strictEqual(result.data.email, "john.doe@example.com"); // lowercase
            }
        });

        it("should reject invalid email", () => {
            const invalid = {
                name: "John",
                email: "not-an-email",
                password: "password123",
            };
            const result = registerSchema.safeParse(invalid);
            assert.strictEqual(result.success, false);
        });

        it("should reject short password", () => {
            const invalid = {
                name: "John",
                email: "john@example.com",
                password: "123",
            };
            const result = registerSchema.safeParse(invalid);
            assert.strictEqual(result.success, false);
        });
    });

    describe("Simulation Validator", () => {
        it("should validate simulation payload", () => {
            const valid = {
                title: "Career Pivot",
                category: "Career",
                goal: "Transition to AI Engineering",
                status: "active",
                nodes: [
                    {
                        nodeId: "node-1",
                        type: "start",
                        title: "Current Role",
                        position: { x: 0, y: 0 },
                    },
                ],
                edges: [],
            };
            const result = createSimulationSchema.safeParse(valid);
            assert.strictEqual(result.success, true);
        });
    });

    describe("AI Request Validator", () => {
        it("should validate scenario generation request", () => {
            const valid = {
                decisionTitle: "Buy vs Rent House",
                category: "Finance",
                goal: "Maximize long-term wealth and stability",
                budget: 500000,
            };
            const result = generateScenariosRequestSchema.safeParse(valid);
            assert.strictEqual(result.success, true);
        });
    });

    describe("Decision Validator", () => {
        it("should validate decision payload", () => {
            const valid = {
                title: "Choose Master's Program",
                category: "Education",
                goal: "Get into top ML graduate school",
                factors: [
                    {
                        name: "Tuition Cost",
                        importance: "high",
                    },
                ],
                options: [
                    {
                        name: "University A",
                        pros: ["Top faculty"],
                        cons: ["Expensive"],
                    },
                ],
            };
            const result = createDecisionSchema.safeParse(valid);
            assert.strictEqual(result.success, true);
        });
    });
});

