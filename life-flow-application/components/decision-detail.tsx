"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleHelp,
  GitBranch,
  Sparkles,
  Target,
  Trash2,
  DollarSign,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { deleteDecision, getDecisionById, type Decision } from "@/lib/api"
import { PageFrame } from "@/components/lifeflow-dashboard"

export function DecisionDetail() {
  const params = useParams<{ id: string }>()
  const id = params?.id || ""
  const router = useRouter()
  const client = useQueryClient()

  const query = useQuery<Decision>({
    queryKey: ["decision", id],
    enabled: !!id,
    queryFn: () => getDecisionById(id),
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
