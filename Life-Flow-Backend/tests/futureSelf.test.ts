import { describe, it } from "node:test";
import assert from "node:assert";
import {
    createFutureSelfProfileSchema,
    createInterviewSchema,
    sendMessageSchema,
    updateReflectionSchema,
} from "../src/validators/futureSelf.validator";
import {
    generateProfileFallback,
    generateFutureSelfChatResponseAI,
    generateDecisionSummaryAI,
} from "../src/services/ai/futureSelf.ai.service";

describe("Future Self Validators", () => {
    it("should accept valid profile input", () => {
        const input = {
            timeHorizon: "1 year" as const,
            lifeAreas: ["Career", "Financial Growth"],
            currentSituation: "Working as junior developer, earning base salary.",
            futureGoals: "Transition to senior full-stack engineer and double savings.",
            availableTime: "2 hours per day",
        };

        const result = createFutureSelfProfileSchema.safeParse(input);
        assert.strictEqual(result.success, true);
    });

    it("should reject invalid time horizon", () => {
        const input = {
            timeHorizon: "20 years", // not supported
            lifeAreas: ["Career"],
            currentSituation: "Valid situation with enough chars",
            futureGoals: "Valid future goals with enough chars",
            availableTime: "1 hour",
        };

        const result = createFutureSelfProfileSchema.safeParse(input);
        assert.strictEqual(result.success, false);
    });

    it("should validate interview creation schema", () => {
        const valid = createInterviewSchema.safeParse({
            futureSelfProfileId: "507f1f77bcf86cd799439011",
            title: "Test Session",
        });
        assert.strictEqual(valid.success, true);

        const invalid = createInterviewSchema.safeParse({
            futureSelfProfileId: "not-an-id",
        });
        assert.strictEqual(invalid.success, false);
    });

    it("should validate message input length", () => {
        const empty = sendMessageSchema.safeParse({ content: "" });
        assert.strictEqual(empty.success, false);

        const valid = sendMessageSchema.safeParse({ content: "What habit helped you most?" });
        assert.strictEqual(valid.success, true);
    });

    it("should validate reflection update", () => {
        const valid = updateReflectionSchema.safeParse({
            reflectionNotes: "I learned that starting with 15 mins daily will build confidence.",
        });
        assert.strictEqual(valid.success, true);
    });
});

describe("Future Self AI Service & Domain Fallback", () => {
    const sampleInput = {
        timeHorizon: "1 year" as const,
        lifeAreas: ["Career", "Health and Fitness"],
        currentSituation: "Sitting at desk all day, feeling fatigued, seeking developer growth.",
        challenges: "Procrastination and irregular sleep schedule.",
        futureGoals: "Ship production apps consistently and run a 10K.",
        availableTime: "2 hours daily",
    };

    it("should generate a complete, structured future self profile", () => {
        const profile = generateProfileFallback(sampleInput);

        assert.ok(profile.introduction.includes("1 year"));
        assert.strictEqual(profile.timeHorizon, "1 year");
        assert.ok(profile.possibleAchievements.length > 0);
        assert.ok(profile.developedHabits.length > 0);
        assert.ok(profile.challenges.length > 0);
        assert.ok(profile.lessons.length > 0);
        assert.ok(profile.turningPoints.length > 0);
        assert.ok(profile.advice.length > 0);
        assert.ok(profile.assumptions.length > 0);
        assert.ok(profile.uncertainties.length > 0);
    });

    it("should generate an empathetic in-character conversational response with suggested questions", async () => {
        const profile = generateProfileFallback(sampleInput);
        const { response, suggestedQuestions } = await generateFutureSelfChatResponseAI({
            profile,
            history: [],
            userMessage: "What made the biggest difference in our first 3 months?",
        });

        assert.ok(response);
        assert.ok(typeof response === "string");
        assert.ok(response.length > 20);
        assert.ok(Array.isArray(suggestedQuestions));
        assert.ok(suggestedQuestions.length > 0);
    });

    it("should synthesize a structured decision summary with spoken guidance", async () => {
        const profile = generateProfileFallback(sampleInput);
        const summary = await generateDecisionSummaryAI({
            profile,
            transcript: "User: What habit helped most?\nFuture Self: Starting every morning with 45 minutes of deep focus.",
        });

        assert.ok(summary.benefits.length > 0);
        assert.ok(summary.risks.length > 0);
        assert.ok(summary.tradeOffs.length > 0);
        assert.ok(summary.nextSteps.length > 0);
        assert.ok(summary.fullSummary.length > 20);
        assert.ok(summary.spokenText.length > 10);
    });
});
