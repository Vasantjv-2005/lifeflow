"use client"

import React, { useState, useMemo } from "react"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  Cpu,
  DollarSign,
  ExternalLink,
  Filter,
  Flame,
  FolderGit2,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  ListChecks,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import type {
  Scenario,
  LearningRoadmap,
  InterviewPreparation,
  OpportunitiesAndBackup,
  JobListing,
  PracticalProject,
  AlternativeCareerRoute,
} from "@/lib/api"
import { fetchCareerJobs } from "@/lib/api"

interface CareerScenarioStudioProps {
  decisionTitle: string
  category: string
  goal: string
  scenarios: Scenario[]
  onRefreshJobs?: () => void
}

export function CareerScenarioStudioView({
  decisionTitle,
  category,
  goal,
  scenarios,
}: CareerScenarioStudioProps) {
  // Find the three purpose-driven scenarios
  const optimisticScenario = scenarios.find((s) => s.type === "optimistic")
  const realisticScenario = scenarios.find((s) => s.type === "realistic")
  const pessimisticScenario = scenarios.find((s) => s.type === "pessimistic")

  const learningRoadmap: LearningRoadmap | undefined = optimisticScenario?.learningRoadmap
  const interviewPrep: InterviewPreparation | undefined = realisticScenario?.interviewPreparation
  const opportunities: OpportunitiesAndBackup | undefined = pessimisticScenario?.opportunitiesAndBackup

  const [activeTab, setActiveTab] = useState<"roadmap" | "interview" | "jobs">("roadmap")

  // Interactive Checklist State
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})
  const toggleItem = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Expanded items state
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({ 1: true, 2: true })
  const toggleStage = (idx: number) => {
    setExpandedStages((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({})
  const toggleSubject = (name: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({})
  const toggleHint = (qKey: string) => {
    setExpandedHints((prev) => ({ ...prev, [qKey]: !prev[qKey] }))
  }

  // Job Search & Filter State
  const [jobPlatformFilter, setJobPlatformFilter] = useState<"All" | "LinkedIn" | "Naukri" | "Wellfound">("All")
  const [jobSearchTerm, setJobSearchTerm] = useState("")
  const [liveJobs, setLiveJobs] = useState<JobListing[]>(opportunities?.internshipOpportunities || [])
  const [refreshingJobs, setRefreshingJobs] = useState(false)

  const handleRefreshJobs = async () => {
    setRefreshingJobs(true)
    try {
      const res = await fetchCareerJobs(decisionTitle)
      if (res.jobs && res.jobs.length > 0) {
        setLiveJobs(res.jobs)
        toast.success(`Refreshed ${res.jobs.length} verified listings and search channels.`)
      } else {
        toast.info("Active channels are already up to date.")
      }
    } catch {
      toast.error("Could not refresh listings. Check backend connection.")
    } finally {
      setRefreshingJobs(false)
    }
  }

  const filteredJobs = useMemo(() => {
    const list = liveJobs.length ? liveJobs : opportunities?.internshipOpportunities || []
    return list.filter((job) => {
      const matchesPlatform = jobPlatformFilter === "All" || job.platform === jobPlatformFilter
      const textToSearch = `${job.title} ${job.company} ${job.location} ${job.requiredSkills.join(" ")}`.toLowerCase()
      const matchesSearch = !jobSearchTerm.trim() || textToSearch.includes(jobSearchTerm.toLowerCase().trim())
      return matchesPlatform && matchesSearch
    })
  }, [liveJobs, opportunities, jobPlatformFilter, jobSearchTerm])

  // Count completed learning milestones
  const totalChecklistItems = useMemo(() => {
    let count = 0
    if (learningRoadmap?.stages) count += learningRoadmap.stages.length
    if (interviewPrep?.subjects) {
      interviewPrep.subjects.forEach((s) => (count += s.checklist.length))
    }
    return count
  }, [learningRoadmap, interviewPrep])

  const completedCount = useMemo(() => {
    return Object.values(completedItems).filter(Boolean).length
  }, [completedItems])

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #24201c 0%, #36302a 100%)",
          color: "#ffffff",
          borderRadius: 12,
          padding: "24px 28px",
          border: "1px solid #4a423a",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  background: "#8c6e3b",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: "3px 9px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                }}
              >
                Intelligent Career Studio
              </span>
              <span style={{ fontSize: 13, color: "#d9d0c3" }}>
                Targeting: <strong>{decisionTitle}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 8px", color: "#fdfbf7" }}>
              3 Purpose-Driven Career Pathways
            </h2>
            <p style={{ fontSize: 13.5, color: "#c8beaf", margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
              Each scenario serves a unique role in your career journey: master your syllabus, prepare for technical interviews, and execute practical projects with live verified job opportunities.
            </p>
          </div>

          {/* Progress Tracker Pill */}
          {totalChecklistItems > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "12px 18px",
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: 11, color: "#d9d0c3", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Preparation Progress
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>
                {completedCount} / {totalChecklistItems}{" "}
                <span style={{ fontSize: 13, fontWeight: 500, color: "#d9d0c3" }}>
                  ({Math.round((completedCount / (totalChecklistItems || 1)) * 100)}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* THREE DISTINCT SCENARIO TABS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* TAB 1: OPTIMISTIC */}
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            style={{
              background: activeTab === "roadmap" ? "#ffffff" : "rgba(255,255,255,0.06)",
              color: activeTab === "roadmap" ? "#24201c" : "#fdfbf7",
              border: activeTab === "roadmap" ? "2px solid #8c6e3b" : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: activeTab === "roadmap" ? "#8c6e3b" : "#e6d5be", textTransform: "uppercase" }}>
                Optimistic Scenario
              </span>
              <BookOpen size={16} color={activeTab === "roadmap" ? "#8c6e3b" : "#e6d5be"} />
            </div>
            <strong style={{ fontSize: 15, display: "block" }}>1. Your Learning Roadmap</strong>
            <span style={{ fontSize: 11.5, opacity: 0.8, display: "block", marginTop: 2 }}>
              What to learn, in what order, and how to practice.
            </span>
          </button>

          {/* TAB 2: REALISTIC */}
          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            style={{
              background: activeTab === "interview" ? "#ffffff" : "rgba(255,255,255,0.06)",
              color: activeTab === "interview" ? "#24201c" : "#fdfbf7",
              border: activeTab === "interview" ? "2px solid #8c6e3b" : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: activeTab === "interview" ? "#8c6e3b" : "#e6d5be", textTransform: "uppercase" }}>
                Realistic Scenario
              </span>
              <GraduationCap size={16} color={activeTab === "interview" ? "#8c6e3b" : "#e6d5be"} />
            </div>
            <strong style={{ fontSize: 15, display: "block" }}>2. Your Interview Preparation</strong>
            <span style={{ fontSize: 11.5, opacity: 0.8, display: "block", marginTop: 2 }}>
              Subject syllabus, technical questions &amp; checklists.
            </span>
          </button>

          {/* TAB 3: PESSIMISTIC */}
          <button
            type="button"
            onClick={() => setActiveTab("jobs")}
            style={{
              background: activeTab === "jobs" ? "#ffffff" : "rgba(255,255,255,0.06)",
              color: activeTab === "jobs" ? "#24201c" : "#fdfbf7",
              border: activeTab === "jobs" ? "2px solid #8c6e3b" : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: activeTab === "jobs" ? "#8c6e3b" : "#e6d5be", textTransform: "uppercase" }}>
                Pessimistic Scenario
              </span>
              <Briefcase size={16} color={activeTab === "jobs" ? "#8c6e3b" : "#e6d5be"} />
            </div>
            <strong style={{ fontSize: 15, display: "block" }}>3. Projects, Internships &amp; Jobs</strong>
            <span style={{ fontSize: 11.5, opacity: 0.8, display: "block", marginTop: 2 }}>
              Practical experience, verified links &amp; recovery plan.
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: OPTIMISTIC SCENARIO — COMPLETE LEARNING ROADMAP        */}
      {/* ============================================================== */}
      {activeTab === "roadmap" && (
        <section style={{ display: "grid", gap: 18 }}>
          {/* Overview Card */}
          <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
              <div>
                <span className="eyebrow" style={{ color: "#2e7d32" }}>
                  OPTIMISTIC PATHWAY &bull; COMPREHENSIVE CURRICULUM
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "2px 0 6px", color: "#282521" }}>
                  Your Complete Learning Roadmap
                </h3>
                <p style={{ fontSize: 13, color: "#6f685d", margin: 0 }}>
                  {learningRoadmap?.overview || "Master the exact technical skills and tools in the right sequence with practical hands-on exercises."}
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ background: "#f8fbf6", border: "1px solid #dceed6", padding: "6px 12px", borderRadius: 6, fontSize: 12 }}>
                  <Clock size={13} style={{ display: "inline-block", marginRight: 4, verticalAlign: -2, color: "#2e7d32" }} />
                  <strong>Timeline:</strong> {learningRoadmap?.estimatedLearningTime || "6 to 8 Months"}
                </div>
                <div style={{ background: "#fbf8f2", border: "1px solid #ebd9be", padding: "6px 12px", borderRadius: 6, fontSize: 12 }}>
                  <Target size={13} style={{ display: "inline-block", marginRight: 4, verticalAlign: -2, color: "#8c6e3b" }} />
                  <strong>Commitment:</strong> {learningRoadmap?.dailyCommitment || "1.5 - 2 hrs/day"}
                </div>
              </div>
            </div>
          </div>

          {/* STAGES LIST */}
          <div style={{ display: "grid", gap: 14 }}>
            {learningRoadmap?.stages.map((stage) => {
              const isExpanded = expandedStages[stage.stageNumber] ?? true
              const stageKey = `stage-${stage.stageNumber}`
              const isDone = completedItems[stageKey]

              return (
                <article
                  key={stage.stageNumber}
                  style={{
                    background: "#ffffff",
                    border: isDone ? "1px solid #a7f3d0" : "1px solid #e5dfd5",
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Stage Header */}
                  <div
                    onClick={() => toggleStage(stage.stageNumber)}
                    style={{
                      background: isDone ? "#f0fdf4" : "#faf8f5",
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      borderBottom: isExpanded ? "1px solid #ebd9be" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleItem(stageKey)
                        }}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: isDone ? "2px solid #10b981" : "2px solid #c2b8a7",
                          background: isDone ? "#10b981" : "#ffffff",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0,
                          flexShrink: 0,
                        }}
                        title={isDone ? "Mark incomplete" : "Mark stage complete"}
                      >
                        {isDone && <Check size={16} />}
                      </button>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              background: "#8c6e3b",
                              color: "#ffffff",
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 4,
                            }}
                          >
                            STAGE {stage.stageNumber}
                          </span>
                          <span style={{ fontSize: 11, color: "#8c6e3b", fontWeight: 600 }}>
                            {stage.timeframe}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: "3px 0 0", color: "#282521" }}>
                          {stage.title}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11.5, color: "#776f63" }}>
                        {stage.skillsToMaster.length} skills &bull; {stage.recommendedResources.length} resources
                      </span>
                      {isExpanded ? <ChevronDown size={18} color="#8c6e3b" /> : <ChevronRight size={18} color="#8c6e3b" />}
                    </div>
                  </div>

                  {/* Stage Body */}
                  {isExpanded && (
                    <div style={{ padding: "20px", display: "grid", gap: 16 }}>
                      {/* Skills & Technologies Tags */}
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6f685d", letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                          Skills To Master at this Stage:
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {stage.skillsToMaster.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                background: "#f4ede2",
                                color: "#544324",
                                fontSize: 12,
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontWeight: 500,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Core Concepts in Simple English */}
                      <div style={{ background: "#fbfaf8", border: "1px solid #ece4d6", borderRadius: 8, padding: 14 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#8c6e3b", letterSpacing: 0.5, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                          Core Concepts Explained Simply:
                        </span>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#443e37", lineHeight: 1.6 }}>
                          {stage.coreConcepts.map((concept, cIdx) => (
                            <li key={cIdx} style={{ marginBottom: 4 }}>{concept}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies & Tools */}
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6f685d", letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                          Tools &amp; Technologies:
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {stage.technologiesAndTools.map((tool, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                background: "#24201c",
                                color: "#fcfbf9",
                                fontSize: 11.5,
                                padding: "3px 9px",
                                borderRadius: 4,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Terminal size={11} /> {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Practical Exercises & Hands-on Labs */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                        <div style={{ background: "#fefbf6", border: "1px solid #ebd9be", borderRadius: 8, padding: 14 }}>
                          <strong style={{ fontSize: 12, color: "#8c6e3b", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <Code2 size={14} /> Practical Exercises
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#544b3f", lineHeight: 1.5 }}>
                            {stage.practicalExercises.map((ex, exIdx) => (
                              <li key={exIdx} style={{ marginBottom: 6 }}>{ex}</li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ background: "#f6fbf9", border: "1px solid #cce8de", borderRadius: 8, padding: 14 }}>
                          <strong style={{ fontSize: 12, color: "#1d6a52", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <Cpu size={14} /> Hands-on Labs
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#2f5c4e", lineHeight: 1.5 }}>
                            {stage.handsOnLabs.map((lab, lIdx) => (
                              <li key={lIdx} style={{ marginBottom: 6 }}>{lab}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Recommended Learning Resources */}
                      {stage.recommendedResources.length > 0 && (
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#6f685d", letterSpacing: 0.5, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                            Recommended Learning Resources:
                          </span>
                          <div style={{ display: "grid", gap: 8 }}>
                            {stage.recommendedResources.map((res, rIdx) => (
                              <div
                                key={rIdx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  background: "#ffffff",
                                  border: "1px solid #eee6d8",
                                  padding: "8px 14px",
                                  borderRadius: 6,
                                  fontSize: 12.5,
                                }}
                              >
                                <div>
                                  <strong>{res.title}</strong>
                                  <span style={{ color: "#776f63", marginLeft: 8 }}>({res.provider})</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {res.isFree && (
                                    <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 10.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                                      100% Free
                                    </span>
                                  )}
                                  {res.url && (
                                    <a
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#8c6e3b", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}
                                    >
                                      Open <ExternalLink size={11} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestone Checkpoint */}
                      <div style={{ background: "#fcf8f2", borderLeft: "4px solid #8c6e3b", padding: "10px 14px", borderRadius: "0 6px 6px 0", fontSize: 12.5, color: "#665027" }}>
                        <strong>Stage Milestone:</strong> {stage.milestone}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: REALISTIC SCENARIO — INTERVIEW PREPARATION             */}
      {/* ============================================================== */}
      {activeTab === "interview" && (
        <section style={{ display: "grid", gap: 18 }}>
          {/* Header Overview Card */}
          <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 20 }}>
            <span className="eyebrow" style={{ color: "#8c6e3b" }}>
              REALISTIC SCENARIO &bull; ENTRY-LEVEL EVALUATION SYLLABUS
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "2px 0 6px", color: "#282521" }}>
              Your Interview Preparation Syllabus
            </h3>
            <p style={{ fontSize: 13, color: "#6f685d", margin: 0 }}>
              {interviewPrep?.overview || "Everything evaluated during technical screening, hands-on tests, and HR interviews."}
            </p>
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#fbf6ec", border: "1px solid #eadbbd", borderRadius: 6, fontSize: 12, color: "#8c6e3b" }}>
              <strong>Notice:</strong> This syllabus represents standard industry hiring standards. LifeFlow does not guarantee interview offers or employment results.
            </div>
          </div>

          {/* Frequently Tested Concepts */}
          {Boolean(interviewPrep?.frequentlyTestedConcepts?.length) && (
            <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Flame size={16} color="#c62828" />
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#282521", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Top 5 Frequently Tested Concepts
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#443e37", lineHeight: 1.6 }}>
                {interviewPrep?.frequentlyTestedConcepts.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SUBJECT-WISE SYLLABUS LIST */}
          <div style={{ display: "grid", gap: 14 }}>
            {interviewPrep?.subjects.map((subj, idx) => {
              const isExpanded = expandedSubjects[subj.subjectName] ?? true

              return (
                <article
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5dfd5",
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    onClick={() => toggleSubject(subj.subjectName)}
                    style={{
                      background: "#faf8f5",
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      borderBottom: isExpanded ? "1px solid #ebd9be" : "none",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, color: "#8c6e3b", textTransform: "uppercase" }}>
                        SUBJECT {idx + 1}
                      </span>
                      <h4 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0", color: "#282521" }}>
                        {subj.subjectName}
                      </h4>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: subj.expectedKnowledgeLevel === "Beginner" ? "#e0f2fe" : subj.expectedKnowledgeLevel === "Intermediate" ? "#fef3c7" : "#dcfce7",
                          color: subj.expectedKnowledgeLevel === "Beginner" ? "#0369a1" : subj.expectedKnowledgeLevel === "Intermediate" ? "#92400e" : "#166534",
                        }}
                      >
                        {subj.expectedKnowledgeLevel} Level
                      </span>
                      {isExpanded ? <ChevronDown size={18} color="#8c6e3b" /> : <ChevronRight size={18} color="#8c6e3b" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "20px", display: "grid", gap: 16 }}>
                      {/* What Candidate Must Understand */}
                      <div style={{ background: "#fbfaf8", border: "1px solid #ece4d6", borderRadius: 8, padding: 14 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#8c6e3b", letterSpacing: 0.5, display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                          What You Must Understand:
                        </span>
                        <p style={{ fontSize: 13, color: "#443e37", margin: 0, lineHeight: 1.5 }}>
                          {subj.whatToUnderstand}
                        </p>
                      </div>

                      {/* Important Topics & Detailed Subtopics */}
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6f685d", letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                          Important Topics &amp; Subtopics:
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                          {subj.importantTopics.map((top, tIdx) => (
                            <span key={tIdx} style={{ background: "#f4ede2", color: "#544324", fontSize: 12, padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
                              {top}
                            </span>
                          ))}
                        </div>
                        {Boolean(subj.detailedSubtopics?.length) && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5, color: "#61574a", lineHeight: 1.5 }}>
                            {subj.detailedSubtopics.map((sub, sIdx) => (
                              <li key={sIdx}>{sub}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Technical & Scenario Interview Questions */}
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6f685d", letterSpacing: 0.5, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                          Interview Questions &amp; Sample Answers:
                        </span>
                        <div style={{ display: "grid", gap: 8 }}>
                          {subj.interviewQuestions.map((q, qIdx) => {
                            const qKey = `${subj.subjectName}-q-${qIdx}`
                            const showHint = expandedHints[qKey]

                            return (
                              <div
                                key={qIdx}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #ebd9be",
                                  borderRadius: 6,
                                  padding: 12,
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: "#282521" }}>
                                    <span style={{ color: "#8c6e3b", marginRight: 6 }}>Q{qIdx + 1}:</span>
                                    {q.question}
                                  </div>
                                  <span style={{ fontSize: 10, background: "#f5f0e8", color: "#6f685d", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0 }}>
                                    {q.type}
                                  </span>
                                </div>

                                {q.answerHint && (
                                  <div style={{ marginTop: 8 }}>
                                    <button
                                      type="button"
                                      onClick={() => toggleHint(qKey)}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "#8c6e3b",
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        padding: 0,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                    >
                                      <Lightbulb size={12} /> {showHint ? "Hide Answer Guidance" : "Show How to Answer"}
                                    </button>
                                    {showHint && (
                                      <div style={{ marginTop: 6, padding: "8px 12px", background: "#fbf8f2", borderLeft: "3px solid #8c6e3b", fontSize: 12, color: "#544324", lineHeight: 1.5 }}>
                                        <strong>Expected Answer:</strong> {q.answerHint}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Preparation Checklist */}
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6f685d", letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                          Preparation Checklist:
                        </span>
                        <div style={{ display: "grid", gap: 6 }}>
                          {subj.checklist.map((item, cIdx) => {
                            const cKey = `${subj.subjectName}-chk-${cIdx}`
                            const isChecked = completedItems[cKey]

                            return (
                              <label
                                key={cIdx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  fontSize: 12.5,
                                  color: isChecked ? "#10b981" : "#443e37",
                                  textDecoration: isChecked ? "line-through" : "none",
                                  cursor: "pointer",
                                  background: "#fdfbf9",
                                  padding: "6px 10px",
                                  borderRadius: 4,
                                  border: "1px solid #ebd9be",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={Boolean(isChecked)}
                                  onChange={() => toggleItem(cKey)}
                                  style={{ accentColor: "#10b981", cursor: "pointer" }}
                                />
                                {item}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {/* HR & Resume Preparation Advice */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {/* HR Questions */}
            {Boolean(interviewPrep?.hrInterviewQuestions?.length) && (
              <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 18 }}>
                <strong style={{ fontSize: 13, color: "#8c6e3b", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <UserCheck size={16} /> HR &amp; Behavioral Questions
                </strong>
                <div style={{ display: "grid", gap: 8 }}>
                  {interviewPrep?.hrInterviewQuestions.map((hr, hIdx) => (
                    <div key={hIdx} style={{ fontSize: 12.5, borderBottom: "1px solid #f3ece0", paddingBottom: 6 }}>
                      <p style={{ fontWeight: 600, color: "#282521", margin: "0 0 2px" }}>&ldquo;{hr.question}&rdquo;</p>
                      <span style={{ fontSize: 11.5, color: "#6f685d" }}>{hr.guidance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Checklist */}
            {Boolean(interviewPrep?.resumeChecklist?.length) && (
              <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 18 }}>
                <strong style={{ fontSize: 13, color: "#2e7d32", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <ListChecks size={16} /> Resume &amp; ATS Checklist
                </strong>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#443e37", lineHeight: 1.5 }}>
                  {interviewPrep?.resumeChecklist.map((tip, tIdx) => (
                    <li key={tIdx} style={{ marginBottom: 6 }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: PESSIMISTIC SCENARIO — PROJECTS, INTERNSHIPS & BACKUP */}
      {/* ============================================================== */}
      {activeTab === "jobs" && (
        <section style={{ display: "grid", gap: 20 }}>
          {/* Header Card */}
          <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 20 }}>
            <span className="eyebrow" style={{ color: "#c62828" }}>
              PESSIMISTIC SCENARIO &bull; REAL-WORLD OPPORTUNITIES &amp; BACKUP PLAN
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "2px 0 6px", color: "#282521" }}>
              Practical Experience, Internships &amp; Stepping Stones
            </h3>
            <p style={{ fontSize: 13, color: "#6f685d", margin: 0 }}>
              {opportunities?.overview || "If you struggle to break in directly, here are 3 verified portfolio projects, live entry-level internship search links, and an alternative recovery strategy."}
            </p>
          </div>

          {/* SECTION A: PRACTICAL PROJECTS (Beginner, Intermediate, Advanced) */}
          <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FolderGit2 size={18} color="#8c6e3b" />
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#282521" }}>
                  A. 3 Practical Portfolio Projects
                </h4>
                <span style={{ fontSize: 12, color: "#776f63" }}>
                  Tiered projects to prove your real-world capabilities on GitHub.
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 14 }}>
              {opportunities?.projects.map((proj, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    background: "#fbfaf8",
                    border: "1px solid #ebd9be",
                    borderRadius: 8,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: proj.level === "Beginner" ? "#e0f2fe" : proj.level === "Intermediate" ? "#fef3c7" : "#dcfce7",
                          color: proj.level === "Beginner" ? "#0369a1" : proj.level === "Intermediate" ? "#92400e" : "#166534",
                          textTransform: "uppercase",
                        }}
                      >
                        {proj.level}
                      </span>
                    </div>

                    <h5 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#282521" }}>
                      {proj.name}
                    </h5>

                    <p style={{ fontSize: 12.5, color: "#5c554b", lineHeight: 1.5, marginBottom: 10 }}>
                      <strong>Problem Solved:</strong> {proj.problemSolved}
                    </p>

                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#8c6e3b", display: "block", marginBottom: 4 }}>
                        Technologies Used:
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} style={{ background: "#eee6d8", color: "#443e37", fontSize: 11, padding: "2px 6px", borderRadius: 4 }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: "#443e37", marginBottom: 10 }}>
                      <strong>Implementation Steps:</strong>
                      <ol style={{ margin: "4px 0 0", paddingLeft: 16, lineHeight: 1.4 }}>
                        {proj.implementationSteps.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #ebd9be", fontSize: 11.5, color: "#6b5428" }}>
                    <strong>GitHub Tip:</strong> {proj.githubRecommendations}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: INTERNSHIP OPPORTUNITIES (LinkedIn, Naukri, Wellfound) */}
          <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Briefcase size={18} color="#8c6e3b" />
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#282521" }}>
                    B. Live Job Platform Search &amp; Internship Opportunities
                  </h4>
                </div>
                <span style={{ fontSize: 12, color: "#776f63", display: "block", marginTop: 2 }}>
                  Official public search channels filtered for fresh graduates and entry-level talent.
                </span>
              </div>

              <button
                type="button"
                onClick={handleRefreshJobs}
                disabled={refreshingJobs}
                className="button button-outline"
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                <RefreshCw size={13} className={refreshingJobs ? "animate-spin" : ""} />
                {refreshingJobs ? "Refreshing Channels..." : "Refresh Job Opportunities"}
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 16,
                padding: "10px 14px",
                background: "#fbf9f5",
                borderRadius: 8,
                border: "1px solid #ebd9be",
              }}
            >
              {/* Platform Filter Tabs */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["All", "LinkedIn", "Naukri", "Wellfound"] as const).map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setJobPlatformFilter(platform)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: jobPlatformFilter === platform ? "#24201c" : "#ffffff",
                      color: jobPlatformFilter === platform ? "#ffffff" : "#4a453e",
                      border: "1px solid " + (jobPlatformFilter === platform ? "#24201c" : "#e5dfd5"),
                    }}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              {/* Text Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ffffff", padding: "4px 8px", borderRadius: 6, border: "1px solid #e5dfd5" }}>
                <Search size={14} color="#8c6e3b" />
                <input
                  type="text"
                  placeholder="Filter by title, company, skill..."
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: 12, width: 180 }}
                />
              </div>
            </div>

            {/* Notice distinguishing verified from search */}
            <div style={{ marginBottom: 14, fontSize: 11.5, color: "#8c6e3b", background: "#fdf8ee", padding: "8px 12px", borderRadius: 6, border: "1px solid #ebd9be" }}>
              <ShieldCheck size={14} style={{ display: "inline-block", marginRight: 5, verticalAlign: -2, color: "#10b981" }} />
              <strong>Permitted Public Integration:</strong> External links open the official public search results on LinkedIn, Naukri, or Wellfound with exact 0-1 year experience and internship filters applied. No unauthorized web scraping is performed.
            </div>

            {/* Job Listings Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, jIdx) => (
                  <div
                    key={jIdx}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #ebd9be",
                      borderRadius: 8,
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: job.platform === "LinkedIn" ? "#0a66c2" : job.platform === "Naukri" ? "#2874f0" : "#ff5a5f",
                            color: "#ffffff",
                          }}
                        >
                          {job.platform}
                        </span>
                        <span style={{ fontSize: 10.5, color: "#8c6e3b", fontWeight: 600 }}>
                          {job.experienceLevel}
                        </span>
                      </div>

                      <h5 style={{ fontSize: 14, fontWeight: 700, margin: "2px 0 4px", color: "#282521" }}>
                        {job.title}
                      </h5>
                      <span style={{ fontSize: 12, color: "#6f685d", display: "block", marginBottom: 8 }}>
                        {job.company} &bull; {job.location}
                      </span>

                      {job.descriptionSnippet && (
                        <p style={{ fontSize: 12, color: "#544e45", lineHeight: 1.4, margin: "0 0 10px" }}>
                          {job.descriptionSnippet}
                        </p>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                        {job.requiredSkills.map((sk, sIdx) => (
                          <span key={sIdx} style={{ background: "#f4ede2", color: "#544324", fontSize: 10.5, padding: "2px 6px", borderRadius: 4 }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3ece0", paddingTop: 10 }}>
                      <span style={{ fontSize: 10.5, color: "#8c6e3b" }}>
                        Verified: {job.lastVerifiedDate}
                      </span>
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-dark"
                        style={{ fontSize: 11.5, padding: "5px 10px", textDecoration: "none" }}
                      >
                        Search on {job.platform} <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#776f63", gridColumn: "1/-1" }}>
                  No job opportunities matched your current filter. Try selecting &apos;All&apos; or clearing your search term.
                </div>
              )}
            </div>
          </div>

          {/* SECTION C & D: JOB MARKET ANALYSIS & ALTERNATIVE ROUTES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 14 }}>
            {/* C. Job Market Analysis */}
            {opportunities?.jobMarketAnalysis && (
              <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 18 }}>
                <strong style={{ fontSize: 14, color: "#282521", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <TrendingUp size={16} color="#8c6e3b" /> C. Job Market Analysis
                </strong>
                <div style={{ fontSize: 12.5, color: "#443e37", lineHeight: 1.6, display: "grid", gap: 8 }}>
                  <div>
                    <strong>Most Requested Skills:</strong>{" "}
                    {opportunities.jobMarketAnalysis.mostRequestedSkills.join(", ")}
                  </div>
                  <div>
                    <strong>Common Tools:</strong>{" "}
                    {opportunities.jobMarketAnalysis.commonTools.join(", ")}
                  </div>
                  <div>
                    <strong>Experience Expectation:</strong>{" "}
                    {opportunities.jobMarketAnalysis.experienceRequirements}
                  </div>
                  {opportunities.jobMarketAnalysis.userSkillGaps.length > 0 && (
                    <div style={{ background: "#fef8f6", border: "1px solid #f6ded5", padding: "8px 10px", borderRadius: 6, color: "#991b1b" }}>
                      <strong>Your Critical Skill Gaps to Bridge:</strong>{" "}
                      {opportunities.jobMarketAnalysis.userSkillGaps.join("; ")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* D. Alternative Career Routes */}
            {Boolean(opportunities?.alternativeRoutes?.length) && (
              <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 18 }}>
                <strong style={{ fontSize: 14, color: "#282521", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <Compass size={16} color="#2e7d32" /> D. Stepping-Stone Entry Routes
                </strong>
                <p style={{ fontSize: 12, color: "#6f685d", margin: "0 0 10px" }}>
                  If immediate hiring is slow, these related entry roles build direct credibility toward your target:
                </p>
                <div style={{ display: "grid", gap: 8 }}>
                  {opportunities?.alternativeRoutes.map((alt, aIdx) => (
                    <div key={aIdx} style={{ background: "#fbfaf8", border: "1px solid #eee6d8", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
                      <strong style={{ color: "#282521", display: "block" }}>{alt.role}</strong>
                      <span style={{ color: "#544b3f", display: "block", margin: "2px 0" }}>{alt.description}</span>
                      <span style={{ color: "#2e7d32", fontSize: 11, fontWeight: 500 }}>
                        &bull; How it helps: {alt.howItHelpsProgression}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION E: 30-DAY RECOVERY STRATEGY */}
          {opportunities?.recoveryStrategy && (
            <div style={{ background: "#ffffff", border: "1px solid #ebd9be", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ShieldAlert size={18} color="#c62828" />
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#282521" }}>
                  E. 30-Day Recovery Strategy (If You Struggle to Get Hired)
                </h4>
              </div>
              <p style={{ fontSize: 13, color: "#6f685d", margin: "0 0 14px" }}>
                Rejection and initial delays are standard. Follow this structured 30-day plan to diagnose gaps and accelerate callbacks:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 16 }}>
                <div style={{ background: "#fef8f6", border: "1px solid #f6ded5", padding: 12, borderRadius: 8 }}>
                  <strong style={{ fontSize: 12, color: "#c62828", display: "block", marginBottom: 6 }}>
                    Common Reasons for Rejection:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#6e3f36", lineHeight: 1.4 }}>
                    {opportunities.recoveryStrategy.reasonsForStruggle.map((r, rIdx) => (
                      <li key={rIdx} style={{ marginBottom: 4 }}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: "#f6fbf9", border: "1px solid #cce8de", padding: 12, borderRadius: 8 }}>
                  <strong style={{ fontSize: 12, color: "#1d6a52", display: "block", marginBottom: 6 }}>
                    Key Resume Adjustments:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#2f5c4e", lineHeight: 1.4 }}>
                    {opportunities.recoveryStrategy.resumeImprovements.map((tip, tIdx) => (
                      <li key={tIdx} style={{ marginBottom: 4 }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 30-Day Action Plan Blocks */}
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#8c6e3b", letterSpacing: 0.5, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                  Your Concrete 30-Day Reset Schedule:
                </span>
                <div style={{ display: "grid", gap: 6 }}>
                  {opportunities.recoveryStrategy.thirtyDayActionPlan.map((action, aIdx) => (
                    <div
                      key={aIdx}
                      style={{
                        background: "#faf8f5",
                        border: "1px solid #ebd9be",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontSize: 12.5,
                        color: "#443e37",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ background: "#8c6e3b", color: "#ffffff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                        STEP {aIdx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
