"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithDecisionAdvisorAI = exports.generateAdvisorFallbackResponse = exports.buildScenarioComparisonMatrix = void 0;
const env_1 = require("../../config/env");
const getAIConfig = () => {
    const apiUrl = env_1.env.AI_API_URL?.trim() || "";
    const apiKey = env_1.env.AI_API_KEY?.trim() || "";
    const model = env_1.env.AI_MODEL?.trim() || "openai/gpt-oss-20b";
    return { apiUrl, apiKey, model };
};
/**
 * Builds a structured, backward-compatible comparison matrix across all 6 categories
 * using actual stored decision and scenario properties.
 */
const buildScenarioComparisonMatrix = (decision, scenarios) => {
    const defaultTypes = [
        "optimistic",
        "realistic",
        "pessimistic",
    ];
    const columns = defaultTypes.map((t) => {
        const found = scenarios.find((s) => s.type === t) || scenarios.find((s) => s.name.toLowerCase().includes(t));
        if (!found) {
            const fallbackNames = {
                optimistic: "Fast-Track Acceleration",
                realistic: "Balanced Progression",
                pessimistic: "Conservative Resilience",
            };
            return {
                type: t,
                name: fallbackNames[t],
                description: `A ${t} path for ${decision.title || "this goal"}. Not yet customized.`,
                riskLevel: t === "optimistic" ? "high" : t === "realistic" ? "medium" : "low",
                timeRequired: {
                    completionTime: t === "optimistic" ? "3-6 months" : t === "realistic" ? "6-12 months" : "12-18 months",
                    milestones: ["Phase 1 kickoff", "Core milestones", "Final achievement"],
                    dailyCommitment: decision.timeAvailable ? `${decision.timeAvailable} days total timeframe` : "1-2 hours per day",
                },
                estimatedCost: {
                    budgetRange: decision.budget ? `$${decision.budget}` : "Not specified / Free tier",
                    keyExpenses: ["Learning materials", "Essential tools"],
                    lowCostAlternatives: "Free documentation, community tutorials, open-source libraries",
                },
                difficulty: {
                    level: t === "optimistic" ? "Advanced" : t === "realistic" ? "Intermediate" : "Beginner-Friendly",
                    reason: `Based on the expected pace and commitment required for a ${t} outcome.`,
                },
                potentialOutcomes: {
                    achievements: [decision.goal || "Steady progress"],
                    expectedProgress: "Consistent milestones achieved each week",
                    opportunities: ["New roles", "Personal confidence"],
                },
                majorRisks: {
                    challenges: ["Maintaining consistency", "Balancing everyday routine"],
                    possibleDelays: "Pacing issues or unexpected schedule disruptions",
                    backupPlan: "Shift to smaller daily steps without stopping completely.",
                },
                requiredSkills: {
                    skillsNeeded: ["Discipline", "Focus", "Practice"],
                    foundationalSkills: ["Basic preparation"],
                    skillsToDevelop: ["Core domain knowledge"],
                },
            };
        }
        // Compute 1. Time Required
        const completionTime = found.expectedTimeline ||
            (found.steps && found.steps[found.steps.length - 1]?.timeframe) ||
            (t === "optimistic" ? "3 to 6 months" : t === "realistic" ? "6 to 12 months" : "12 to 18 months");
        const milestones = (found.steps || []).map((st) => `${st.timeframe ? `[${st.timeframe}] ` : ""}${st.title}`).slice(0, 4);
        const dailyCommitment = decision.timeAvailable
            ? `${decision.timeAvailable} days scheduled timeframe`
            : t === "optimistic"
                ? "2 to 3 focused hours daily"
                : t === "realistic"
                    ? "1 to 2 focused hours daily"
                    : "30 to 60 minutes daily steady pace";
        // Compute 2. Estimated Cost
        const budgetRange = typeof decision.budget === "number" && decision.budget > 0
            ? `$${decision.budget.toLocaleString()}`
            : t === "optimistic"
                ? "$100 - $300 (Fast tools & certifications)"
                : t === "realistic"
                    ? "$0 - $100 (Affordable courses & materials)"
                    : "Free ($0 - using free open resources)";
        const keyExpenses = found.requiredResources && found.requiredResources.length > 0
            ? found.requiredResources.slice(0, 3)
            : ["Standard learning & software access", "Portfolio hosting / basic equipment"];
        const lowCostAlternatives = "Free official documentation, open-source tools, public YouTube courses, and community forums.";
        // Compute 3. Difficulty
        let diffLevel = "Intermediate";
        let diffReason = "Balanced pace with standard challenges.";
        if (t === "optimistic") {
            diffLevel = "Advanced";
            diffReason = "High pace requiring uninterrupted focus, fast milestones, and strict daily consistency.";
        }
        else if (t === "realistic") {
            diffLevel = "Intermediate";
            diffReason = "Practical pacing allowing room for normal setbacks, everyday responsibilities, and steady compound learning.";
        }
        else {
            diffLevel = "Beginner-Friendly";
            diffReason = "Slower and more forgiving pace that prioritizes fundamentals, low budget, and emotional resilience over speed.";
        }
        // Compute 4. Potential Outcomes
        const achievements = found.outcomes && found.outcomes.length > 0
            ? found.outcomes.map((o) => o.title).slice(0, 3)
            : found.advantages && found.advantages.length > 0
                ? found.advantages.slice(0, 3)
                : [decision.goal || "Target milestone achieved."];
        const expectedProgress = found.outcomes && found.outcomes[0]?.description
            ? found.outcomes[0].description.slice(0, 160)
            : `Progressively build skills and confidence towards ${decision.goal || "your primary goal"}.`;
        const opportunities = found.advantages && found.advantages.length > 0
            ? found.advantages.slice(0, 3)
            : ["Strong portfolio pieces", "Career growth", "Mastered core competencies"];
        // Compute 5. Major Risks
        const challenges = found.challenges && found.challenges.length > 0
            ? found.challenges.slice(0, 3)
            : [
                t === "optimistic"
                    ? "Burnout from aggressive timeline"
                    : t === "realistic"
                        ? "Plateaus or loss of motivation during middle phases"
                        : "Slow momentum causing frustration",
            ];
        const possibleDelays = t === "optimistic"
            ? "Falling behind on ambitious weekly targets if life events intervene."
            : t === "realistic"
                ? "Balancing day-to-day workload with study or practice blocks."
                : "Taking too long to complete early milestones due to caution.";
        const backupPlan = found.backupPlan ||
            (t === "optimistic"
                ? "Switch immediately to the Realistic timeline without feeling defeated."
                : t === "realistic"
                    ? "Protect a minimum 30-minute daily habit and pause non-essential side tasks."
                    : "Break tasks into tiny 15-minute daily micro-habits to rebuild momentum.");
        // Compute 6. Required Skills
        const skillsNeeded = (found.steps || []).map((s) => s.title).slice(0, 3).length > 0
            ? (found.steps || []).map((s) => s.title).slice(0, 3)
            : ["Core domain knowledge", "Hands-on project building", "Effective time-blocking"];
        const foundationalSkills = ["Basic problem-solving", "Curiosity & consistency", "Reading documentation"];
        const skillsToDevelop = found.requiredResources && found.requiredResources.length > 0
            ? found.requiredResources.slice(0, 3)
            : ["Hands-on project execution", "Deep focus habits", "Independent troubleshooting"];
        return {
            type: t,
            name: found.name,
            description: found.description || `The ${t} roadmap designed for ${decision.title}.`,
            riskLevel: found.riskLevel,
            timeRequired: {
                completionTime,
                milestones,
                dailyCommitment,
            },
            estimatedCost: {
                budgetRange,
                keyExpenses,
                lowCostAlternatives,
            },
            difficulty: {
                level: diffLevel,
                reason: diffReason,
            },
            potentialOutcomes: {
                achievements,
                expectedProgress,
                opportunities,
            },
            majorRisks: {
                challenges,
                possibleDelays,
                backupPlan,
            },
            requiredSkills: {
                skillsNeeded,
                foundationalSkills,
                skillsToDevelop,
            },
        };
    });
    return {
        decisionTitle: decision.title,
        category: decision.category,
        goal: decision.goal,
        scenarios: columns,
        generatedAt: new Date(),
    };
};
exports.buildScenarioComparisonMatrix = buildScenarioComparisonMatrix;
/**
 * Fallback generator for AI Decision Advisor responses in simple 5th-grade English
 * using actual stored decision and scenarios data.
 */
const generateAdvisorFallbackResponse = (params) => {
    const { decision, scenarios, userQuestion } = params;
    const q = userQuestion.toLowerCase();
    const opt = scenarios.find((s) => s.type === "optimistic") || scenarios[0];
    const real = scenarios.find((s) => s.type === "realistic") || scenarios[1] || scenarios[0];
    const pess = scenarios.find((s) => s.type === "pessimistic") || scenarios[2] || scenarios[0];
    const fallbackQuestions = [
        "Which path is best for a beginner?",
        "Which scenario requires the least budget?",
        "Which scenario is less risky?",
        "What happens if I have only 2 hours daily?",
        "What are the biggest challenges?",
        "Which skills should I learn first?",
        "What if I fail to complete my roadmap?",
        "Can you recommend the most practical scenario?",
    ];
    // 1. Beginner question
    if (q.includes("beginner") || q.includes("start") || q.includes("first time")) {
        return {
            answer: `Based on your goal "${decision.goal || decision.title}", the **${real?.name || "Realistic Path"}** is the best choice for a beginner.

Why this path:
- **Steady learning pace**: It gives you enough time to learn the basics without feeling rushed or overwhelmed.
- **Manageable daily effort**: It fits into a normal routine (${decision.timeAvailable ? `${decision.timeAvailable} days timeframe` : "1-2 hours per day"}).
- **Hands-on practice**: You will build real projects step-by-step rather than just reading theory.

One thing to keep in mind:
The biggest challenge is staying patient when progress feels slow in the beginning. Keep showing up every day!`,
            suggestedQuestions: [
                "Which skills should I learn first?",
                "Which scenario requires the least budget?",
                "What if I have only 2 hours daily?",
            ],
        };
    }
    // 2. Budget question
    if (q.includes("budget") || q.includes("cost") || q.includes("money") || q.includes("cheap") || q.includes("free")) {
        const budgetNote = decision.budget ? `Your stated budget is $${decision.budget}.` : "You haven't set a strict budget yet.";
        return {
            answer: `Looking at your options, the **${pess?.name || real?.name || "Conservative Path"}** requires the least money. ${budgetNote}

Cost breakdown:
- You do **not** need expensive paid bootcamps or private tutors to achieve this goal.
- You can use high-quality free resources like official documentation, open-source projects, and free community tutorials.
- The only optional expenses are basic internet, a computer, and maybe a small domain or test tool ($0 - $50 total).

Recommended next step:
Start with free resources first. Only spend money later if you genuinely need a specific test or credential.`,
            suggestedQuestions: [
                "Which path is best for a beginner?",
                "Can you recommend the most practical scenario?",
                "What are the biggest challenges?",
            ],
        };
    }
    // 3. Risk question
    if (q.includes("risk") || q.includes("safe") || q.includes("failure") || q.includes("fail")) {
        return {
            answer: `The **${pess?.name || "Conservative Path"}** has the lowest risk of burnout or financial loss, while the **${real?.name || "Realistic Path"}** has the best balance between risk and reward.

Risk comparison:
- **${opt?.name || "Optimistic Path"}**: Highest risk (${opt?.riskLevel || "high"} risk). If you miss a week or hit a hard problem, you can easily feel burned out.
- **${real?.name || "Realistic Path"}**: Moderate risk (${real?.riskLevel || "medium"} risk). Built-in room for normal mistakes and life delays.
- **${pess?.name || "Pessimistic Path"}**: Lowest risk (${pess?.riskLevel || "low"} risk). Focuses on protecting your downside and building strong habits slowly.

Backup plan:
If you struggle with the faster plan, switch to the Realistic path immediately. There is zero shame in taking a few more months to build real skill.`,
            suggestedQuestions: [
                "What happens if I have only 2 hours daily?",
                "What if I fail to complete my roadmap?",
                "Which path is best for a beginner?",
            ],
        };
    }
    // 4. Time commitment (e.g. 2 hours daily)
    if (q.includes("hour") || q.includes("time") || q.includes("daily") || q.includes("schedule")) {
        return {
            answer: `With 2 hours per day, the **${real?.name || "Realistic Path"}** fits your schedule perfectly!

How 2 hours per day works:
- **1 hour for learning**: Read tutorials, watch a short lesson, or take clear notes.
- **1 hour for building**: Write code, practice the skill, or build a mini-project.
- **Weekends**: Review what you learned and plan your upcoming week.

Avoid the Optimistic Path if you only have 2 hours daily. The Optimistic path usually expects 4+ hours of intense work, which could cause stress and burnout with a busy day job.`,
            suggestedQuestions: [
                "Which skills should I learn first?",
                "What are the biggest challenges?",
                "Can you recommend the most practical scenario?",
            ],
        };
    }
    // 5. Challenges & Roadblocks
    if (q.includes("challenge") || q.includes("obstacle") || q.includes("hardest") || q.includes("problem")) {
        const topChallenges = real?.challenges?.length ? real.challenges.join("; ") : "Losing motivation when concepts get difficult; phone distractions.";
        return {
            answer: `Here are the biggest challenges you will face on this journey for "${decision.title}":

1. **Staying consistent**: It is easy to study on day 1. It is hard on day 45 when motivation drops.
2. **Key scenario hurdles**: ${topChallenges}
3. **Imposter syndrome**: Feeling like you are not making progress fast enough.

How to overcome them:
- Track your daily streak on a physical calendar or checklist.
- Focus on finishing one small project completely before moving to the next.
- Remember that every expert was once a beginner who refused to quit.`,
            suggestedQuestions: [
                "What if I fail to complete my roadmap?",
                "Which path is best for a beginner?",
                "Which scenario requires the least budget?",
            ],
        };
    }
    // 6. Practical recommendation (General default)
    return {
        answer: `Looking at your decision **"${decision.title}"** (Category: ${decision.category}):

I recommend the **${real?.name || "Realistic Path"}** as your primary blueprint.

Why this makes the most sense:
- It gives you steady progress towards "${decision.goal || decision.title}" without unrealistic expectations.
- It respects your schedule and budget constraints.
- You can always borrow ideas from the **${opt?.name || "Optimistic Path"}** when you have extra energy, or fall back to the **${pess?.name || "Conservative Path"}** if life gets busy.

Next practical step:
Pick the very first step from your roadmap: "${real?.steps?.[0]?.title || "Set up your learning schedule"}" and spend 30 minutes on it tomorrow morning!`,
        suggestedQuestions: fallbackQuestions.slice(0, 4),
    };
};
exports.generateAdvisorFallbackResponse = generateAdvisorFallbackResponse;
/**
 * Generates an interactive AI Decision Advisor conversation response using Groq AI.
 */
const chatWithDecisionAdvisorAI = async (params) => {
    const { decision, scenarios, conversationHistory, userMessage } = params;
    const { apiUrl, apiKey, model } = getAIConfig();
    if (!apiUrl || !apiKey) {
        return (0, exports.generateAdvisorFallbackResponse)({ decision, scenarios, userQuestion: userMessage });
    }
    const opt = scenarios.find((s) => s.type === "optimistic") || scenarios[0];
    const real = scenarios.find((s) => s.type === "realistic") || scenarios[1] || scenarios[0];
    const pess = scenarios.find((s) => s.type === "pessimistic") || scenarios[2] || scenarios[0];
    const scenarioSummaries = [
        opt ? `OPTIMISTIC SCENARIO: "${opt.name}" (Risk: ${opt.riskLevel}). Summary: ${opt.description}. Timeline: ${opt.expectedTimeline || "Fast-track"}. Key Advantages: ${(opt.advantages || []).join(", ")}. Challenges: ${(opt.challenges || []).join(", ")}.` : "",
        real ? `REALISTIC SCENARIO: "${real.name}" (Risk: ${real.riskLevel}). Summary: ${real.description}. Timeline: ${real.expectedTimeline || "Steady"}. Key Advantages: ${(real.advantages || []).join(", ")}. Challenges: ${(real.challenges || []).join(", ")}.` : "",
        pess ? `PESSIMISTIC SCENARIO: "${pess.name}" (Risk: ${pess.riskLevel}). Summary: ${pess.description}. Timeline: ${pess.expectedTimeline || "Conservative"}. Key Advantages: ${(pess.advantages || []).join(", ")}. Challenges: ${(pess.challenges || []).join(", ")}.` : "",
    ].filter(Boolean).join("\n\n");
    const systemPrompt = `You are the LifeFlow AI Decision Advisor.
You help users explore, compare, and choose between their generated decision scenarios.

CRITICAL RULES:
1. READING LEVEL: 5th-grade simple English only! Use clear, conversational everyday words.
2. STRICT ACCURACY: Use ONLY the actual stored decision information and scenarios provided below.
3. NO HALLUCINATIONS: NEVER invent salary promises, fake dollar figures, guaranteed odds, or unverified facts. If something is unknown, say "Not specified in your decision record".
4. OBJECTIVE ADVICE: Do NOT blindly recommend the optimistic scenario. Recommend the path that truly matches the user's budget, available time, and current situation.
5. FORMAT: Use short paragraphs and clear bullet points for readability. Explain pros and cons clearly.

Decision Context:
- Title: ${decision.title}
- Category: ${decision.category}
- Goal: ${decision.goal}
- Current Situation: ${decision.currentSituation || "Not specified"}
- Timeframe Available: ${decision.timeAvailable ? `${decision.timeAvailable} days` : "Not specified"}
- Budget: ${decision.budget ? `$${decision.budget}` : "Not specified / minimal"}

Generated Scenarios:
${scenarioSummaries}

Return a single JSON object strictly matching this schema:
{
  "answer": "string (clear, helpful answer in 5th-grade English comparing scenarios, giving reasons and practical advice)",
  "suggestedQuestions": ["Question 1", "Question 2", "Question 3"]
}`;
    const boundedHistory = conversationHistory.slice(-8);
    const messages = [
        { role: "system", content: systemPrompt },
        ...boundedHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
    ];
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                temperature: 0.4,
                response_format: { type: "json_object" },
                messages,
            }),
            signal: AbortSignal.timeout(22000),
        });
        if (!response.ok) {
            console.warn(`AI provider returned HTTP ${response.status}. Using domain advisor fallback.`);
            return (0, exports.generateAdvisorFallbackResponse)({ decision, scenarios, userQuestion: userMessage });
        }
        const completion = (await response.json());
        const content = completion.choices?.[0]?.message?.content;
        if (!content) {
            return (0, exports.generateAdvisorFallbackResponse)({ decision, scenarios, userQuestion: userMessage });
        }
        let clean = content.trim();
        if (clean.startsWith("```")) {
            clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        }
        const parsed = JSON.parse(clean);
        return {
            answer: typeof parsed.answer === "string" ? parsed.answer : String(parsed),
            suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
                ? parsed.suggestedQuestions.slice(0, 4)
                : [
                    "Which path is best for a beginner?",
                    "Which scenario requires the least budget?",
                    "Which scenario is less risky?",
                ],
        };
    }
    catch (err) {
        console.warn("AI Decision Advisor call failed or timed out:", err);
        return (0, exports.generateAdvisorFallbackResponse)({ decision, scenarios, userQuestion: userMessage });
    }
};
exports.chatWithDecisionAdvisorAI = chatWithDecisionAdvisorAI;
