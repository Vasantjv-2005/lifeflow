"use client"

import React, { useMemo } from "react"
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Flame,
  Gauge,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import type { Scenario, ScenarioComparisonColumn, ScenarioComparisonDashboard } from "@/lib/api"

interface ScenarioComparisonDashboardProps {
  decisionTitle: string
  category?: string
  goal?: string
  scenarios: Scenario[]
  comparisonData?: ScenarioComparisonDashboard | null
  onViewFullScenario?: (type: string) => void
}

export function ScenarioComparisonDashboardView({
  decisionTitle,
  category = "Career",
  goal = "",
  scenarios,
  comparisonData,
  onViewFullScenario,
}: ScenarioComparisonDashboardProps) {
  // Compute comparison columns from props if comparisonData is not provided
  const columns: ScenarioComparisonColumn[] = useMemo(() => {
    if (comparisonData?.scenarios && comparisonData.scenarios.length > 0) {
      return comparisonData.scenarios
    }

    const types: Array<"optimistic" | "realistic" | "pessimistic"> = [
      "optimistic",
      "realistic",
      "pessimistic",
    ]

    return types.map((t) => {
      const found = scenarios.find((s) => s.type === t) || scenarios.find((s) => s.name?.toLowerCase().includes(t))

      if (!found) {
        return {
          type: t,
          name: t === "optimistic" ? "Optimistic Vision" : t === "realistic" ? "Practical Blueprint" : "Conservative Safety",
          description: `Hypothetical ${t} progression.`,
          riskLevel: t === "optimistic" ? "high" : t === "realistic" ? "medium" : "low",
          timeRequired: {
            completionTime: t === "optimistic" ? "3 to 6 months" : t === "realistic" ? "6 to 12 months" : "12 to 18 months",
            milestones: ["Kickoff phase", "Core skill build", "Final milestone"],
            dailyCommitment: t === "optimistic" ? "2-3 hours daily" : t === "realistic" ? "1-2 hours daily" : "30-60 mins daily",
          },
          estimatedCost: {
            budgetRange: t === "optimistic" ? "$100 - $300" : t === "realistic" ? "$0 - $100" : "Free ($0)",
            keyExpenses: ["Learning resources", "Hosting & tooling"],
            lowCostAlternatives: "Official docs, free courses, community forums",
          },
          difficulty: {
            level: t === "optimistic" ? "Advanced" : t === "realistic" ? "Intermediate" : "Beginner-Friendly",
            reason: `Aggressive pace and continuous daily consistency required for ${t} path.`,
          },
          potentialOutcomes: {
            achievements: [goal || "Steady progress"],
            expectedProgress: "Rapid skill growth and milestone completion",
            opportunities: ["New roles", "Personal achievement"],
          },
          majorRisks: {
            challenges: ["Schedule fatigue", "Concept difficulty"],
            possibleDelays: "Pacing setbacks or unexpected responsibilities",
            backupPlan: "Shift to smaller micro-steps on busy days.",
          },
          requiredSkills: {
            skillsNeeded: ["Discipline", "Focus", "Practice"],
            foundationalSkills: ["Basic learning agility"],
            skillsToDevelop: ["Core competencies"],
          },
        }
      }

      const completionTime =
        found.expectedTimeline ||
        found.steps?.[found.steps.length - 1]?.timeframe ||
        (t === "optimistic" ? "3 to 6 months" : t === "realistic" ? "6 to 12 months" : "12 to 18 months")

      const milestones =
        found.steps && found.steps.length > 0
          ? found.steps.map((st) => `${st.timeframe ? `[${st.timeframe}] ` : ""}${st.title}`).slice(0, 4)
          : ["Phase 1 kickoff", "Milestone build", "Final achievement"]

      const dailyCommitment =
        t === "optimistic"
          ? "2 to 3 focused hours daily"
          : t === "realistic"
          ? "1 to 2 focused hours daily"
          : "30 to 60 minutes daily steady pace"

      const budgetRange =
        t === "optimistic"
          ? "$100 - $300 (Fast tools & certifications)"
          : t === "realistic"
          ? "$0 - $100 (Affordable courses & materials)"
          : "Free ($0 - using free open resources)"

      const keyExpenses =
        found.requiredResources && found.requiredResources.length > 0
          ? found.requiredResources.slice(0, 3)
          : ["Standard learning & software access", "Portfolio hosting / basic equipment"]

      let diffLevel: "Beginner-Friendly" | "Intermediate" | "Advanced" = "Intermediate"
      let diffReason = "Balanced pace with standard challenges."
      if (t === "optimistic") {
        diffLevel = "Advanced"
        diffReason = "High pace requiring uninterrupted focus, fast milestones, and strict daily consistency."
      } else if (t === "realistic") {
        diffLevel = "Intermediate"
        diffReason = "Practical pacing allowing room for normal setbacks, everyday responsibilities, and steady compound learning."
      } else {
        diffLevel = "Beginner-Friendly"
        diffReason = "Slower and more forgiving pace that prioritizes fundamentals, low budget, and emotional resilience over speed."
      }

      const achievements =
        found.outcomes && found.outcomes.length > 0
          ? found.outcomes.map((o) => o.title).slice(0, 3)
          : found.advantages && found.advantages.length > 0
          ? found.advantages.slice(0, 3)
          : [goal || "Target milestone achieved."]

      const expectedProgress =
        found.outcomes?.[0]?.description ||
        `Progressively build skills and confidence towards ${goal || "your primary goal"}.`

      const opportunities =
        found.advantages && found.advantages.length > 0
          ? found.advantages.slice(0, 3)
          : ["Strong portfolio pieces", "Career growth", "Mastered core competencies"]

      const challenges =
        found.challenges && found.challenges.length > 0
          ? found.challenges.slice(0, 3)
          : [
              t === "optimistic"
                ? "Burnout from aggressive timeline"
                : t === "realistic"
                ? "Plateaus or loss of motivation during middle phases"
                : "Slow momentum causing frustration",
            ]

      const possibleDelays =
        t === "optimistic"
          ? "Falling behind on ambitious weekly targets if life events intervene."
          : t === "realistic"
          ? "Balancing day-to-day workload with study or practice blocks."
          : "Taking too long to complete early milestones due to caution."

      const backupPlan =
        found.backupPlan ||
        (t === "optimistic"
          ? "Switch immediately to the Realistic timeline without feeling defeated."
          : t === "realistic"
          ? "Protect a minimum 30-minute daily habit and pause non-essential side tasks."
          : "Break tasks into tiny 15-minute daily micro-habits to rebuild momentum.")

      const skillsNeeded =
        found.steps && found.steps.length > 0
          ? found.steps.map((s) => s.title).slice(0, 3)
          : ["Core domain knowledge", "Hands-on project building", "Effective time-blocking"]

      return {
        type: t,
        name: found.name,
        description: found.description || `The ${t} roadmap designed for ${decisionTitle}.`,
        riskLevel: found.riskLevel || (t === "optimistic" ? "high" : t === "realistic" ? "medium" : "low"),
        timeRequired: {
          completionTime,
          milestones,
          dailyCommitment,
        },
        estimatedCost: {
          budgetRange,
          keyExpenses,
          lowCostAlternatives: "Free official documentation, open-source tools, public YouTube courses, and community forums.",
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
          foundationalSkills: ["Basic problem-solving", "Curiosity & consistency", "Reading documentation"],
          skillsToDevelop: ["Hands-on project execution", "Deep focus habits", "Independent troubleshooting"],
        },
      }
    })
  }, [comparisonData, scenarios, decisionTitle, goal])

  const getHeaderTheme = (type: string) => {
    switch (type) {
      case "optimistic":
        return {
          bg: "#f3f8f1",
          border: "#cbe5c6",
          badgeBg: "#e3f2dc",
          badgeColor: "#2d6a24",
          tag: "BEST REASONABLE OUTCOME",
        }
      case "realistic":
        return {
          bg: "#fcf9f2",
          border: "#ebd9be",
          badgeBg: "#f5e8d0",
          badgeColor: "#8c6e3b",
          tag: "MOST PRACTICAL PATH",
        }
      case "pessimistic":
      default:
        return {
          bg: "#faf5f5",
          border: "#edd4d4",
          badgeBg: "#f8dede",
          badgeColor: "#9c3434",
          tag: "DIFFICULT / CAUTIOUS PATH",
        }
    }
  }

  return (
    <div style={{ width: "100%", paddingBottom: 32 }}>
      {/* Title & Introduction Banner */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #ebd9be",
          borderRadius: 12,
          padding: "22px 26px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#8c6e3b", textTransform: "uppercase" }}>
            COMPREHENSIVE DECISION BLUEPRINT
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#282521", margin: "4px 0 6px 0" }}>
            Compare Your Future Paths
          </h2>
          <p style={{ fontSize: 13, color: "#6f685d", margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
            Side-by-side evaluation across all 6 core dimensions: <strong>Time Required</strong>,{" "}
            <strong>Estimated Cost</strong>, <strong>Difficulty</strong>, <strong>Potential Outcomes</strong>,{" "}
            <strong>Major Risks</strong>, and <strong>Required Skills</strong>.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              background: "#fbf8f2",
              border: "1px solid #ebd9be",
              fontSize: 12,
              fontWeight: 600,
              color: "#8c6e3b",
            }}
          >
            3 Paths Analyzed
          </span>
        </div>
      </div>

      {/* 3-Column Responsive Comparison Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {columns.map((col) => {
          const theme = getHeaderTheme(col.type)
          return (
            <article
              key={col.type}
              style={{
                background: "#ffffff",
                border: `1.5px solid ${theme.border}`,
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(40,37,33,0.03)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  background: theme.bg,
                  padding: "18px 20px",
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: theme.badgeBg,
                      color: theme.badgeColor,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                    }}
                  >
                    {col.type.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: col.riskLevel === "low" ? "#e8f5e9" : col.riskLevel === "medium" ? "#fff8e1" : "#ffebee",
                      color: col.riskLevel === "low" ? "#2e7d32" : col.riskLevel === "medium" ? "#b78103" : "#c62828",
                    }}
                  >
                    {col.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#282521", margin: "6px 0 4px 0" }}>
                  {col.name}
                </h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: theme.badgeColor, display: "block", marginBottom: 8 }}>
                  {theme.tag}
                </span>
                <p style={{ fontSize: 12.5, color: "#5c554b", margin: 0, lineHeight: 1.45 }}>
                  {col.description}
                </p>
              </div>

              {/* 6 Comparison Dimensions */}
              <div style={{ padding: "20px 20px", display: "grid", gap: 18, flex: 1, fontSize: 12.5 }}>
                {/* 1. Time Required */}
                <div style={{ paddingBottom: 14, borderBottom: "1px solid #f0eae1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Clock size={14} color="#8c6e3b" />
                    <strong style={{ fontSize: 12, color: "#2c2822", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      1. Time Required
                    </strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1f1d1a" }}>
                      {col.timeRequired.completionTime}
                    </span>
                    <span style={{ fontSize: 11, color: "#776f63" }}>({col.timeRequired.dailyCommitment})</span>
                  </div>
                  {col.timeRequired.milestones.length > 0 && (
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: 11.5, color: "#635c52", lineHeight: 1.4 }}>
                      {col.timeRequired.milestones.map((m, mIdx) => (
                        <li key={mIdx}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 2. Estimated Cost */}
                <div style={{ paddingBottom: 14, borderBottom: "1px solid #f0eae1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <DollarSign size={14} color="#8c6e3b" />
                    <strong style={{ fontSize: 12, color: "#2c2822", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      2. Estimated Cost
                    </strong>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1f1d1a", display: "block", marginBottom: 4 }}>
                    {col.estimatedCost.budgetRange}
                  </span>
                  <div style={{ fontSize: 11.5, color: "#635c52", marginBottom: 4 }}>
                    <strong>Key items:</strong> {col.estimatedCost.keyExpenses.join(", ")}
                  </div>
                  <div style={{ fontSize: 11, color: "#2e7d32", background: "#f3f8f1", padding: "4px 8px", borderRadius: 4, marginTop: 4 }}>
                    <strong>Low-cost option:</strong> {col.estimatedCost.lowCostAlternatives}
                  </div>
                </div>

                {/* 3. Difficulty */}
                <div style={{ paddingBottom: 14, borderBottom: "1px solid #f0eae1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Gauge size={14} color="#8c6e3b" />
                    <strong style={{ fontSize: 12, color: "#2c2822", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      3. Difficulty Level
                    </strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          col.difficulty.level === "Beginner-Friendly"
                            ? "#e8f5e9"
                            : col.difficulty.level === "Intermediate"
                            ? "#fff8e1"
                            : "#ffebee",
                        color:
                          col.difficulty.level === "Beginner-Friendly"
                            ? "#2e7d32"
                            : col.difficulty.level === "Intermediate"
                            ? "#b78103"
                            : "#c62828",
                      }}
                    >
                      {col.difficulty.level}
                    </span>
                  </div>
                  <p style={{ fontSize: 11.5, color: "#635c52", margin: 0, lineHeight: 1.4 }}>
                    {col.difficulty.reason}
                  </p>
                </div>

                {/* 4. Potential Outcomes */}
                <div style={{ paddingBottom: 14, borderBottom: "1px solid #f0eae1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <TrendingUp size={14} color="#8c6e3b" />
                    <strong style={{ fontSize: 12, color: "#2c2822", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      4. Potential Outcomes
                    </strong>
                  </div>
                  <p style={{ fontSize: 12, color: "#282521", fontWeight: 600, margin: "0 0 6px 0", lineHeight: 1.4 }}>
                    {col.potentialOutcomes.expectedProgress}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: "#544e45", lineHeight: 1.4 }}>
                    {col.potentialOutcomes.achievements.map((ach, aIdx) => (
                      <li key={aIdx} style={{ marginBottom: 3 }}>{ach}</li>
                    ))}
                  </ul>
                </div>

                {/* 5. Major Risks */}
                <div style={{ paddingBottom: 14, borderBottom: "1px solid #f0eae1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <ShieldAlert size={14} color="#c62828" />
                    <strong style={{ fontSize: 12, color: "#2c2822", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      5. Major Risks &amp; Challenges
                    </strong>
                  </div>
                  <ul style={{ margin: "0 0 6px 16px", padding: 0, fontSize: 11.5, color: "#6e3f36", lineHeight: 1.4 }}>
                    {col.majorRisks.challenges.map((c, cIdx) => (
                      <li key={cIdx} style={{ marginBottom: 3 }}>{c}</li>
                    ))}
                  </ul>
                  <div style={{ fontSize: 11, color: "#6e511e", background: "#fdf8ee", padding: "6px 8px", borderRadius: 6, marginTop: 4 }}>
                    <strong>Backup Plan:</strong> {col.majorRisks.backupPlan}
                  </div>
                </div>

                {/* 6. Required Skills */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Zap size={14} color="#8c6e3b" />
                    <strong style={{ fontSize: 12, color: "#2c2822", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      6. Required Skills &amp; Focus
                    </strong>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {col.requiredSkills.skillsNeeded.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#fbf8f2",
                          border: "1px solid #ebd9be",
                          color: "#6b5428",
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: View Full Scenario */}
              <div
                style={{
                  padding: "14px 20px",
                  background: "#faf8f4",
                  borderTop: `1px solid ${theme.border}`,
                  marginTop: "auto",
                }}
              >
                <button
                  type="button"
                  onClick={() => onViewFullScenario?.(col.type)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    background: "#24201c",
                    color: "#ffffff",
                    border: "none",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  View Full Scenario Roadmap &rarr;
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
