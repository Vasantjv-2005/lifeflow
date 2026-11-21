"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarDays,
  CircleHelp,
  Clock,
  Columns3,
  DollarSign,
  GitBranch,
  Layers,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import {
  deleteDecision,
  getDecisionById,
  getScenarioComparison,
  type Decision,
  type ScenarioComparisonDashboard,
} from "@/lib/api"
import { PageFrame } from "@/components/lifeflow-dashboard"
import { ScenarioComparisonDashboardView } from "@/components/scenario-comparison-dashboard"
import { AIDecisionAdvisorChat } from "@/components/ai-decision-advisor-chat"

export function DecisionDetail() {
  const params = useParams<{ id: string }>()
  const id = params?.id || ""
  const router = useRouter()
  const client = useQueryClient()
  const [activeTab, setActiveTab] = useState<"overview" | "compare" | "advisor">("overview")

  const query = useQuery<Decision>({
    queryKey: ["decision", id],
    enabled: !!id,
    queryFn: () => getDecisionById(id),
  })

  const comparisonQuery = useQuery<ScenarioComparisonDashboard>({
    queryKey: ["decision-comparison", id],
    enabled: !!id && activeTab === "compare",
    queryFn: () => getScenarioComparison(id),
  })

  const remove = useMutation({
    mutationFn: () => deleteDecision(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["decisions"] })
      toast.success("Decision deleted from MongoDB Compass.")
      router.push("/decisions")
    },
    onError: () => toast.error("Could not remove this decision from database."),
  })

  const decision = query.data

  return (
    <PageFrame>
      <div className="page-content">
        <Link href="/decisions" className="back-link">
          <ArrowLeft size={15} /> Back to all decisions
        </Link>

        {query.isLoading ? (
          <div className="decision-card-skeleton" />
        ) : query.error || !decision ? (
          <div className="page-error">
            <CircleHelp size={22} />
            <strong>This decision could not be retrieved from MongoDB.</strong>
            <p>It may have been removed, or your backend database connection may be offline.</p>
            <button className="button button-outline" onClick={() => query.refetch()}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="detail-hero">
              <span className="eyebrow">{decision.category || "DECISION DETAILS"}</span>
              <h1>{decision.title}</h1>
              <p>{decision.description || decision.goal || "Life decision record."}</p>
              <div className="detail-meta">
                <span className={`status-pill status-${decision.status || "draft"}`}>
                  <span />
                  {decision.status || "draft"}
                </span>
                {decision.createdAt && (
                  <span>
                    <CalendarDays size={13} /> Created{" "}
                    {new Date(decision.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {typeof decision.budget === "number" && (
                  <span>
                    <DollarSign size={13} /> Budget: ${decision.budget.toLocaleString()}
                  </span>
                )}
                {typeof decision.timeAvailable === "number" && (
                  <span>
                    <Clock size={13} /> Timeframe: {decision.timeAvailable} days
                  </span>
                )}
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 20,
                marginBottom: 24,
                borderBottom: "1px solid #ebd9be",
                paddingBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: activeTab === "overview" ? "#24201c" : "#f5f0e8",
                  color: activeTab === "overview" ? "#ffffff" : "#4a453e",
                  border: "1px solid " + (activeTab === "overview" ? "#24201c" : "#e5dfd5"),
                  transition: "all 0.15s ease",
                }}
              >
                <Layers size={14} /> Decision Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("compare")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: activeTab === "compare" ? "#24201c" : "#f5f0e8",
                  color: activeTab === "compare" ? "#ffffff" : "#4a453e",
                  border: "1px solid " + (activeTab === "compare" ? "#24201c" : "#e5dfd5"),
                  transition: "all 0.15s ease",
                }}
              >
                <Columns3 size={14} /> Compare Scenarios
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("advisor")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: activeTab === "advisor" ? "#24201c" : "#f5f0e8",
                  color: activeTab === "advisor" ? "#ffffff" : "#4a453e",
                  border: "1px solid " + (activeTab === "advisor" ? "#24201c" : "#e5dfd5"),
                  transition: "all 0.15s ease",
                }}
              >
                <Bot size={14} /> Ask AI Decision Advisor
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <section className="detail-grid">
                  <article className="surface detail-panel">
                    <span className="detail-panel-icon">
                      <Target size={17} />
                    </span>
                    <span className="eyebrow">PRIMARY OBJECTIVE</span>
                    <h2>Target Outcome</h2>
                    <p>{decision.goal}</p>
                    {decision.currentSituation && (
                      <div className="detail-subtext">
                        <strong>Current Situation:</strong>
                        <p>{decision.currentSituation}</p>
                      </div>
                    )}
                  </article>

                  <article className="surface detail-panel">
                    <span className="detail-panel-icon detail-icon-green">
                      <Sparkles size={17} />
                    </span>
                    <span className="eyebrow">AI EXPLORATION</span>
                    <h2>Model Potential Scenarios</h2>
                    <p>Generate optimistic, realistic, and pessimistic futures using our AI integration.</p>
                    <Link
                      className="text-link"
                      href={`/ai-studio?decision=${encodeURIComponent(decision.title)}`}
                    >
                      Launch AI Studio <ArrowRight size={14} />
                    </Link>
                  </article>
                </section>

                <section className="detail-next">
                  <div>
                    <span className="eyebrow">VISUAL GRAPH SIMULATION</span>
                    <h2>Map this choice into an interactive graph</h2>
                    <p>Lay out decisions, action steps, and outcomes on a visual canvas stored in MongoDB.</p>
                  </div>
                  <Link
                    href={`/simulations/new?title=${encodeURIComponent(decision.title)}&goal=${encodeURIComponent(
                      decision.goal,
                    )}`}
                    className="button button-dark"
                  >
                    <GitBranch size={15} /> Build visual simulation
                  </Link>
                </section>
              </>
            )}

            {/* TAB 2: COMPARE SCENARIOS */}
            {activeTab === "compare" && (
              <div style={{ marginBottom: 28 }}>
                {comparisonQuery.isLoading ? (
                  <div style={{ padding: 32, textAlign: "center", color: "#6f685d" }}>
                    Loading scenario comparison matrix...
                  </div>
                ) : (
                  <ScenarioComparisonDashboardView
                    decisionTitle={decision.title}
                    category={decision.category}
                    goal={decision.goal}
                    scenarios={[]}
                    comparisonData={comparisonQuery.data}
                    onViewFullScenario={() =>
                      router.push(`/ai-studio?decision=${encodeURIComponent(decision.title)}`)
                    }
                  />
                )}
              </div>
            )}

            {/* TAB 3: AI DECISION ADVISOR */}
            {activeTab === "advisor" && (
              <div style={{ marginBottom: 28 }}>
                <AIDecisionAdvisorChat
                  decisionId={decision.id}
                  decisionTitle={decision.title}
                  category={decision.category}
                  goal={decision.goal}
                  scenarios={[]}
                />
              </div>
            )}

            <button
              className="delete-decision"
              onClick={() => {
                if (window.confirm("Permanently delete this decision from MongoDB?")) {
                  remove.mutate()
                }
              }}
              disabled={remove.isPending}
            >
              <Trash2 size={14} /> {remove.isPending ? "Deleting..." : "Delete this decision"}
            </button>
          </>
        )}
      </div>
    </PageFrame>
  )
}
