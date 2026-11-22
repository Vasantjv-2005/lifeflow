"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  History,
  Layers,
  ArrowRight,
  Printer,
  Edit3,
  Save,
  X,
  Target,
  GraduationCap,
  Plus,
  RefreshCw,
  FolderGit2,
  Code,
  Server,
  Database,
  Cpu,
  Terminal,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileCode,
} from "lucide-react"
import { toast } from "sonner"
import {
  uploadResume,
  getUserResumes,
  getResumeById,
  updateParsedResume,
  reparseResumeWithAI,
  setupCareerTargetAndAnalyze,
  getLatestAnalysis,
  getRoadmapWithMilestones,
  updateMilestoneStatus,
  completeMilestoneWithEvidence,
  getProjections,
  createResumeSnapshot,
  getResumeSnapshots,
  getResumeExportData,
  type ResumeRecord,
  type ResumeAnalysis,
  type ResumeRoadmap,
  type ResumeMilestone,
  type ResumeProjection,
  type ResumeSnapshot,
  type ParsedResumeContent,
  type CareerTargetSetupPayload,
} from "@/lib/api"
import {
  FoundationsGuideView,
  RemainingSkillsAndProjectsView,
  InterviewMasteryView,
  getInterviewQuestionsForCareer,
} from "./horizon-guides"

const POPULAR_CAREERS = [
  "AWS Cloud Solutions Architect",
  "Full-Stack Java Developer",
  "Cybersecurity SOC Analyst",
  "Machine Learning & AI Engineer",
  "Data Scientist & Analytics Lead",
  "UI/UX Product Designer",
  "DevOps & Platform SRE",
  "Mobile Flutter / iOS Engineer",
]

export function ResumeTimeMachine() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<"upload" | "analysis" | "roadmap" | "timeline" | "compare" | "snapshots">("upload")
  const [loading, setLoading] = useState<boolean>(false)
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [reparsing, setReparsing] = useState<boolean>(false)

  // Resumes list & selected resume
  const [resumes, setResumes] = useState<ResumeRecord[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [currentResume, setCurrentResume] = useState<ResumeRecord | null>(null)

  // AI Analysis, Roadmap, Projections, Snapshots
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [roadmap, setRoadmap] = useState<ResumeRoadmap | null>(null)
  const [milestones, setMilestones] = useState<ResumeMilestone[]>([])
  const [projections, setProjections] = useState<ResumeProjection[]>([])
  const [snapshots, setSnapshots] = useState<ResumeSnapshot[]>([])

  // Setup Form State
  const [targetCareer, setTargetCareer] = useState<string>("AWS Cloud Solutions Architect")
  const [targetRoleLevel, setTargetRoleLevel] = useState<"entry" | "junior" | "mid" | "senior">("entry")
  const [timelineMonths, setTimelineMonths] = useState<3 | 6 | 12>(6)
  const [weeklyHours, setWeeklyHours] = useState<number>(15)
  const [currentExpLevel, setCurrentExpLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner")

  // Selected Timeline for Projected Resume view (+0, +3, +6, +12)
  const [selectedHorizonMonths, setSelectedHorizonMonths] = useState<number>(3)

  // Modals
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false)
  const [activeMilestoneForEvidence, setActiveMilestoneForEvidence] = useState<ResumeMilestone | null>(null)
  const [evidenceDescription, setEvidenceDescription] = useState<string>("")
  const [evidenceUrl, setEvidenceUrl] = useState<string>("")
  const [evidenceConfirmed, setEvidenceConfirmed] = useState<boolean>(false)

  // Export / Print Modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false)
  const [exportData, setExportData] = useState<any>(null)
  const [exportHorizon, setExportHorizon] = useState<number>(0)
  const [printModalView, setPrintModalView] = useState<"full" | "interview_only">("full")

  // Timeline view mode & copy state
  const [timelineViewMode, setTimelineViewMode] = useState<"both" | "guide" | "canvas">("both")
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<string | null>(null)

  const handleCopyBullet = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedBulletIdx(id)
    toast.success("Resume bullet copied to clipboard!")
    setTimeout(() => setCopiedBulletIdx(null), 2500)
  }

  // Edit Parsed Resume State
  const [isEditingResume, setIsEditingResume] = useState<boolean>(false)
  const [editableContent, setEditableContent] = useState<ParsedResumeContent | null>(null)

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState<boolean>(false)

  // Initial load
  useEffect(() => {
    loadUserResumes()
  }, [])

  const loadUserResumes = async () => {
    try {
      setLoading(true)
      const data = await getUserResumes()
      setResumes(data)
      if (data.length > 0) {
        selectResume(data[0].id || data[0]._id)
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false)
    }
  }

  const selectResume = async (resumeId: string) => {
    try {
      setSelectedResumeId(resumeId)
      setLoading(true)

      const [resDoc, analysisDoc, roadmapData, projectionsList, snapshotList] = await Promise.all([
        getResumeById(resumeId),
        getLatestAnalysis(resumeId).catch(() => null),
        getRoadmapWithMilestones(resumeId).catch(() => ({ roadmap: null, milestones: [] })),
        getProjections(resumeId).catch(() => []),
        getResumeSnapshots(resumeId).catch(() => []),
      ])

      setCurrentResume(resDoc)
      setEditableContent(resDoc.parsedContent)
      setAnalysis(analysisDoc)
      setRoadmap(roadmapData.roadmap)
      setMilestones(roadmapData.milestones)
      setProjections(projectionsList)
      setSnapshots(snapshotList)

      if (analysisDoc) {
        setTargetCareer(analysisDoc.targetCareer)
        setTargetRoleLevel(analysisDoc.targetRoleLevel)
        setTimelineMonths(analysisDoc.timelineMonths)
        setWeeklyHours(analysisDoc.weeklyHoursAvailable)
        setCurrentExpLevel(analysisDoc.currentExperienceLevel)
        // If analysis already exists, show analysis or roadmap
        setActiveTab("analysis")
      } else {
        setActiveTab("upload")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load resume details")
    } finally {
      setLoading(false)
    }
  }

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Client-side validations
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext !== "pdf" && ext !== "docx") {
      toast.error("Please upload a PDF or DOCX file format.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size cannot exceed 5MB.")
      return
    }

    try {
      setLoading(true)
      toast.loading("Analyzing and parsing resume signatures...", { id: "upload-toast" })
      const uploaded = await uploadResume(file)
      toast.success("Resume uploaded and parsed successfully!", { id: "upload-toast" })
      await loadUserResumes()
      selectResume(uploaded.id || uploaded._id)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed. Please check file format.", { id: "upload-toast" })
    } finally {
      setLoading(false)
    }
  }

  // Handle Career Target Setup & AI Analysis
  const handleRunAnalysis = async () => {
    if (!selectedResumeId) {
      toast.error("Please select or upload a resume first.")
      return
    }

    try {
      setAnalyzing(true)
      const payload: CareerTargetSetupPayload = {
        targetCareer,
        targetRoleLevel,
        timelineMonths,
        weeklyHoursAvailable: weeklyHours,
        currentExperienceLevel: currentExpLevel,
      }

      toast.loading("AI synthesizing career roadmap, skill gaps, and projected resumes...", { id: "analysis-toast" })
      const result = await setupCareerTargetAndAnalyze(selectedResumeId, payload)

      setAnalysis(result.analysis)
      setRoadmap(result.roadmap)
      setMilestones(result.milestones)
      setProjections(result.projections)

      // Refresh snapshots
      const updatedSnapshots = await getResumeSnapshots(selectedResumeId)
      setSnapshots(updatedSnapshots)

      toast.success("Career evolution journey generated successfully!", { id: "analysis-toast" })
      setActiveTab("analysis")
    } catch (err: any) {
      const detailedMsg = err.response?.data?.errors?.length
        ? `${err.response.data.message}: ${err.response.data.errors.join(", ")}`
        : err.response?.data?.message || "Failed to generate analysis and roadmap"
      toast.error(detailedMsg, { id: "analysis-toast" })
    } finally {
      setAnalyzing(false)
    }
  }

  // Handle Milestone Status Change
  const handleUpdateMilestoneStatus = async (milestone: ResumeMilestone, status: "planned" | "in_progress") => {
    try {
      const updated = await updateMilestoneStatus(milestone.id || milestone._id, status)
      setMilestones((prev) => prev.map((m) => (m.id === updated.id || m._id === updated._id ? updated : m)))
      toast.success(`Milestone set to ${status.replace("_", " ")}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update milestone")
    }
  }

  // Open Evidence Submission Modal
  const openEvidenceModal = (milestone: ResumeMilestone) => {
    setActiveMilestoneForEvidence(milestone)
    setEvidenceDescription(milestone.completionDescription || "")
    setEvidenceUrl(milestone.evidenceUrl || "")
    setEvidenceConfirmed(false)
    setShowEvidenceModal(true)
  }

  // Submit Milestone Evidence with Verification Confirmation
  const handleSubmitEvidence = async () => {
    if (!activeMilestoneForEvidence) return

    if (!evidenceDescription || evidenceDescription.trim().length < 10) {
      toast.error("Please provide at least 10 characters describing the work completed.")
      return
    }

    if (!evidenceConfirmed) {
      toast.error("Please check the verification confirmation checkbox.")
      return
    }

    try {
      setLoading(true)
      const res = await completeMilestoneWithEvidence(
        activeMilestoneForEvidence.id || activeMilestoneForEvidence._id,
        {
          completionDescription: evidenceDescription,
          evidenceUrl: evidenceUrl.trim() || undefined,
          confirmed: true,
        }
      )

      // Update local state
      setMilestones((prev) =>
        prev.map((m) => (m.id === res.milestone.id || m._id === res.milestone._id ? res.milestone : m))
      )
      setRoadmap(res.updatedRoadmap)

      // Refresh projections & snapshots
      if (selectedResumeId) {
        const [updatedProj, updatedSnaps] = await Promise.all([
          getProjections(selectedResumeId),
          getResumeSnapshots(selectedResumeId),
        ])
        setProjections(updatedProj)
        setSnapshots(updatedSnaps)
      }

      toast.success("Milestone verified and completed! Your projected resume has evolved.")
      setShowEvidenceModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  // Save Manual Edit of Parsed Resume
  const handleSaveResumeEdit = async () => {
    if (!selectedResumeId || !editableContent) return
    try {
      setLoading(true)
      const updated = await updateParsedResume(selectedResumeId, editableContent)
      setCurrentResume(updated)
      setIsEditingResume(false)
      const snaps = await getResumeSnapshots(selectedResumeId)
      setSnapshots(snaps)
      toast.success("Resume updated and version snapshot saved.")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update resume")
    } finally {
      setLoading(false)
    }
  }

  // Re-run Comprehensive AI Extraction from Raw Document
  const handleReparseWithAI = async () => {
    if (!selectedResumeId) return
    try {
      setReparsing(true)
      toast.loading("Re-extracting full resume document with enhanced AI...", { id: "reparse-toast" })
      const reParsed = await reparseResumeWithAI(selectedResumeId)
      setCurrentResume(reParsed)
      setEditableContent(reParsed.parsedContent)
      const snaps = await getResumeSnapshots(selectedResumeId)
      setSnapshots(snaps)
      toast.success("Complete resume re-extracted successfully from original text!", { id: "reparse-toast" })
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to re-extract resume", { id: "reparse-toast" })
    } finally {
      setReparsing(false)
    }
  }

  // Open Export Modal
  const openExportPreview = async (months: number) => {
    if (!selectedResumeId) return
    try {
      setLoading(true)
      const data = await getResumeExportData(selectedResumeId, months > 0 ? months : undefined)
      setExportData(data)
      setExportHorizon(months)
      setShowExportModal(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to prepare export data")
    } finally {
      setLoading(false)
    }
  }

  // Active Projected Content based on selected horizon (0 = current, 3, 6, 12)
  const currentOrProjectedContent: ParsedResumeContent | undefined =
    selectedHorizonMonths === 0
      ? currentResume?.parsedContent
      : projections.find((p) => p.projectionTimelineMonths === selectedHorizonMonths)?.projectedContent ||
        currentResume?.parsedContent

  const activeProjectionRecord = projections.find((p) => p.projectionTimelineMonths === selectedHorizonMonths)

  return (
    <div className="resume-time-machine-container" style={{ padding: "24px 28px", maxWidth: 1240, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1f1d1a", letterSpacing: "-0.02em", margin: 0 }}>
              Resume Time Machine
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: 20,
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Sparkles size={12} /> Forward-Looking Career Evolution
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#78716c", marginTop: 4, maxWidth: 640 }}>
            Analyze your current resume, set a target career destination, and watch your resume evolve through
            structured development milestones across 3, 6, and 12-month projected horizons.
          </p>
        </div>

        {/* Resumes Switcher & Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {resumes.length > 0 && (
            <select
              value={selectedResumeId || ""}
              onChange={(e) => selectResume(e.target.value)}
              style={{
                padding: "7px 12px",
                fontSize: 13,
                borderRadius: 8,
                border: "1px solid #e7e2da",
                backgroundColor: "#fff",
                color: "#292524",
                fontWeight: 500,
              }}
            >
              {resumes.map((r) => (
                <option key={r.id || r._id} value={r.id || r._id}>
                  {r.originalFileName} ({new Date(r.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              backgroundColor: "#292524",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Upload size={14} /> Upload Resume
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.docx"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
            }}
          />
        </div>
      </div>

      {/* Trust & Zero-Fabrication Guarantee Notice */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          backgroundColor: "#fbf9f5",
          border: "1px solid #ebd8b5",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 12,
          color: "#78561d",
        }}
      >
        <ShieldCheck size={18} style={{ color: "#b45309", flexShrink: 0 }} />
        <div>
          <strong>Strict Zero-Fabrication Policy:</strong> LifeFlow never manufactures unearned employment, degrees, or
          certifications. Current facts are strictly separated from planned aspirations. Projected resumes are clearly watermarked
          and require verified milestone completion before graduating into active achievements.
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e7e2da",
          marginBottom: 24,
          gap: 4,
          overflowX: "auto",
        }}
      >
        {[
          { id: "upload", label: "Resume & Target Setup", icon: FileText },
          { id: "analysis", label: "AI Gap Analysis", icon: Target, badge: analysis ? `${analysis.readinessAssessment.score}% Ready` : null },
          { id: "roadmap", label: "Development Roadmap", icon: Layers, badge: roadmap ? `${roadmap.completedMilestones}/${roadmap.totalMilestones}` : null },
          { id: "timeline", label: "Time Machine (+3M/+6M/+12M)", icon: Clock },
          { id: "compare", label: "Side-by-Side Diff", icon: TrendingUp },
          { id: "snapshots", label: "Version History", icon: History, badge: snapshots.length > 0 ? `v${snapshots[0].version}` : null },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#1c1917" : "#78716c",
                borderBottom: isActive ? "2px solid #1c1917" : "2px solid transparent",
                backgroundColor: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={15} style={{ color: isActive ? "#1c1917" : "#a8a29e" }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 12,
                    backgroundColor: isActive ? "#f3f0ea" : "#faf8f5",
                    color: "#57534e",
                    border: "1px solid #e7e2da",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: RESUME & TARGET SETUP */}
      {activeTab === "upload" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left Column: Target Career Setup Form */}
          <div
            style={{
              padding: 24,
              backgroundColor: "#fff",
              borderRadius: 12,
              border: "1px solid #e7e2da",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Target size={18} style={{ color: "#d97706" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#1c1917" }}>
                1. Define Your Career Destination
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#78716c", marginBottom: 20 }}>
              Specify the target role you want your resume to evolve into. AI will assess your current qualifications and build a personalized transition roadmap.
            </p>

            {/* Target Career Role */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 6 }}>
                Target Career Title
              </label>
              <input
                type="text"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                placeholder="e.g. AWS Cloud Solutions Architect"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  borderRadius: 8,
                  border: "1px solid #d6d3d1",
                  boxSizing: "border-box",
                }}
              />
              {/* Popular career suggestions pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {POPULAR_CAREERS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTargetCareer(c)}
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #e7e2da",
                      backgroundColor: targetCareer === c ? "#292524" : "#faf8f5",
                      color: targetCareer === c ? "#fff" : "#57534e",
                      cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role Level & Current Level */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 6 }}>
                  Target Seniority Level
                </label>
                <select
                  value={targetRoleLevel}
                  onChange={(e) => setTargetRoleLevel(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 13,
                    borderRadius: 8,
                    border: "1px solid #d6d3d1",
                    backgroundColor: "#fff",
                  }}
                >
                  <option value="entry">Entry-Level (0-1 yrs)</option>
                  <option value="junior">Junior (1-3 yrs)</option>
                  <option value="mid">Mid-Level (3-5 yrs)</option>
                  <option value="senior">Senior (5+ yrs)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 6 }}>
                  Current Background Level
                </label>
                <select
                  value={currentExpLevel}
                  onChange={(e) => setCurrentExpLevel(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 13,
                    borderRadius: 8,
                    border: "1px solid #d6d3d1",
                    backgroundColor: "#fff",
                  }}
                >
                  <option value="beginner">Beginner / Career Changer</option>
                  <option value="intermediate">Adjacent Experience</option>
                  <option value="advanced">Experienced Practitioner</option>
                </select>
              </div>
            </div>

            {/* Target Timeline */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 6 }}>
                Evolution Horizon: <span style={{ color: "#d97706" }}>{timelineMonths} Months</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTimelineMonths(m as any)}
                    style={{
                      padding: "10px",
                      borderRadius: 8,
                      border: timelineMonths === m ? "2px solid #292524" : "1px solid #e7e2da",
                      backgroundColor: timelineMonths === m ? "#faf8f5" : "#fff",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1917" }}>{m} Months</div>
                    <div style={{ fontSize: 10, color: "#78716c", marginTop: 2 }}>
                      {m === 3 ? "Sprint Pace" : m === 6 ? "Balanced Rhythm" : "Deep Mastery"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Commitment Hours Slider */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#44403c" }}>Weekly Commitment</label>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#292524" }}>{weeklyHours} hrs / week</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#292524" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#a8a29e" }}>
                <span>5 hrs (Part-time)</span>
                <span>20 hrs (Focused)</span>
                <span>40 hrs (Full-time)</span>
              </div>
            </div>

            {/* Run AI Analysis CTA */}
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !currentResume}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
                backgroundColor: currentResume ? "#292524" : "#a8a29e",
                color: "#fff",
                border: "none",
                cursor: currentResume ? "pointer" : "not-allowed",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              {analyzing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Synthesizing Career Evolution...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Gap Analysis & Roadmap <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Right Column: Parsed Resume Overview / Upload Zone */}
          <div>
            {currentResume ? (
              <div
                style={{
                  padding: 24,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e7e2da",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={18} style={{ color: "#059669" }} />
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#1c1917" }}>
                      Active Resume Details
                    </h2>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={handleReparseWithAI}
                      disabled={reparsing}
                      title="Re-extract all sections from the raw resume document using AI"
                      style={{
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: "1px solid #d6d3d1",
                        backgroundColor: "#faf8f5",
                        cursor: reparsing ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Sparkles size={11} style={{ color: "#d97706" }} />
                      {reparsing ? "Re-extracting..." : "⚡ Re-extract Entire Document"}
                    </button>
                    <button
                      onClick={() => setIsEditingResume(!isEditingResume)}
                      style={{
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: "1px solid #d6d3d1",
                        backgroundColor: isEditingResume ? "#fef3c7" : "#faf8f5",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Edit3 size={11} /> {isEditingResume ? "Cancel Edit" : "Edit Fields"}
                    </button>
                  </div>
                </div>

                {isEditingResume ? (
                  /* Editable Mode */
                  <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#78716c" }}>Full Name</label>
                        <input
                          type="text"
                          value={editableContent?.personalInfo.fullName || ""}
                          onChange={(e) =>
                            setEditableContent((prev: any) => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                            }))
                          }
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #d6d3d1" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#78716c" }}>Email</label>
                        <input
                          type="text"
                          value={editableContent?.personalInfo.email || ""}
                          onChange={(e) =>
                            setEditableContent((prev: any) => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value },
                            }))
                          }
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #d6d3d1" }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#78716c" }}>Professional Summary</label>
                      <textarea
                        rows={3}
                        value={editableContent?.summary || ""}
                        onChange={(e) => setEditableContent((prev: any) => ({ ...prev, summary: e.target.value }))}
                        style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #d6d3d1" }}
                      />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#78716c" }}>Skills (comma separated)</label>
                      <input
                        type="text"
                        value={editableContent?.skills.join(", ") || ""}
                        onChange={(e) =>
                          setEditableContent((prev: any) => ({
                            ...prev,
                            skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          }))
                        }
                        style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #d6d3d1" }}
                      />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#78716c" }}>Technical Tools (comma separated)</label>
                      <input
                        type="text"
                        value={editableContent?.technicalTools?.join(", ") || ""}
                        onChange={(e) =>
                          setEditableContent((prev: any) => ({
                            ...prev,
                            technicalTools: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          }))
                        }
                        style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #d6d3d1" }}
                      />
                    </div>

                    <button
                      onClick={handleSaveResumeEdit}
                      style={{
                        padding: "8px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: "#059669",
                        color: "#fff",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 10,
                      }}
                    >
                      <Save size={13} /> Save & Snapshot Version
                    </button>
                  </div>
                ) : (
                  /* Display Comprehensive Readonly Mode */
                  <div style={{ maxHeight: 540, overflowY: "auto", paddingRight: 4 }}>
                    {/* Header & Contact Information */}
                    <div style={{ padding: "12px 14px", backgroundColor: "#faf8f5", borderRadius: 8, marginBottom: 14 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1c1917" }}>
                        {currentResume.parsedContent.personalInfo.fullName || "Candidate"}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4, fontSize: 11, color: "#57534e" }}>
                        {currentResume.parsedContent.personalInfo.email && (
                          <span style={{ backgroundColor: "#fff", padding: "1px 6px", borderRadius: 4, border: "1px solid #e7e2da" }}>
                            ✉ {currentResume.parsedContent.personalInfo.email}
                          </span>
                        )}
                        {currentResume.parsedContent.personalInfo.phone && (
                          <span style={{ backgroundColor: "#fff", padding: "1px 6px", borderRadius: 4, border: "1px solid #e7e2da" }}>
                            ☎ {currentResume.parsedContent.personalInfo.phone}
                          </span>
                        )}
                        {currentResume.parsedContent.personalInfo.location && (
                          <span style={{ backgroundColor: "#fff", padding: "1px 6px", borderRadius: 4, border: "1px solid #e7e2da" }}>
                            📍 {currentResume.parsedContent.personalInfo.location}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#44403c", marginTop: 8, lineHeight: 1.45 }}>
                        {currentResume.parsedContent.summary || "No professional summary provided."}
                      </div>
                    </div>

                    {/* Demonstrated Skills & Tools */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#44403c" }}>
                          Demonstrated Skills ({currentResume.parsedContent.skills.length})
                        </span>
                        {currentResume.parsedContent.technicalTools?.length > 0 && (
                          <span style={{ fontSize: 10, color: "#78716c" }}>
                            {currentResume.parsedContent.technicalTools.length} tools
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {currentResume.parsedContent.skills.map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 11,
                              padding: "2px 7px",
                              borderRadius: 4,
                              backgroundColor: "#f5f5f4",
                              color: "#292524",
                              border: "1px solid #e7e5e4",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Experience Items */}
                    {currentResume.parsedContent.experience.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#44403c", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                          <Briefcase size={13} style={{ color: "#d97706" }} /> Work Experience ({currentResume.parsedContent.experience.length})
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {currentResume.parsedContent.experience.map((exp, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #f0eee6",
                                backgroundColor: "#faf8f5",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: "#1c1917" }}>{exp.role}</span>
                                <span style={{ fontSize: 10, color: "#78716c" }}>
                                  {exp.startDate || ""} {exp.endDate ? `– ${exp.endDate}` : exp.current ? "– Present" : ""}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: "#57534e", fontWeight: 500 }}>{exp.company}</div>
                              {exp.description && (
                                <div style={{ fontSize: 11, color: "#78716c", marginTop: 3, lineHeight: 1.35 }}>
                                  {exp.description}
                                </div>
                              )}
                              {exp.achievements && exp.achievements.length > 0 && (
                                <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 10, color: "#57534e" }}>
                                  {exp.achievements.slice(0, 3).map((ach, aIdx) => (
                                    <li key={aIdx}>{ach}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {currentResume.parsedContent.projects && currentResume.parsedContent.projects.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#44403c", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                          <FolderGit2 size={13} style={{ color: "#2563eb" }} /> Projects & Capstones ({currentResume.parsedContent.projects.length})
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {currentResume.parsedContent.projects.map((proj, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #f0eee6",
                                backgroundColor: "#faf8f5",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: "#1c1917" }}>{proj.name}</span>
                                {proj.link && (
                                  <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#2563eb", textDecoration: "none" }}>
                                    View Link ↗
                                  </a>
                                )}
                              </div>
                              {proj.description && (
                                <div style={{ fontSize: 11, color: "#57534e", marginTop: 2, lineHeight: 1.35 }}>
                                  {proj.description}
                                </div>
                              )}
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                                  {proj.technologies.map((t, tIdx) => (
                                    <span key={tIdx} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, backgroundColor: "#fff", border: "1px solid #e7e2da", color: "#44403c" }}>
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education & Certifications Summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11, color: "#57534e" }}>
                      <div style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #f0eee6", backgroundColor: "#faf8f5" }}>
                        <div style={{ fontWeight: 700, color: "#1c1917", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                          <GraduationCap size={12} style={{ color: "#059669" }} /> Education ({currentResume.parsedContent.education.length})
                        </div>
                        {currentResume.parsedContent.education.map((edu, idx) => (
                          <div key={idx} style={{ fontSize: 10, color: "#44403c", marginBottom: 2 }}>
                            • <strong>{edu.degree}</strong> ({edu.institution})
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #f0eee6", backgroundColor: "#faf8f5" }}>
                        <div style={{ fontWeight: 700, color: "#1c1917", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                          <Award size={12} style={{ color: "#7c3aed" }} /> Certifications ({currentResume.parsedContent.certifications.length})
                        </div>
                        {currentResume.parsedContent.certifications.length > 0 ? (
                          currentResume.parsedContent.certifications.map((cert, idx) => (
                            <div key={idx} style={{ fontSize: 10, color: "#44403c", marginBottom: 2 }}>
                              • <strong>{cert.name}</strong> ({cert.issuer})
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: 10, color: "#a8a29e" }}>No formal certifications listed</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0])
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#292524" : "#d6d3d1"}`,
                  borderRadius: 12,
                  padding: "48px 24px",
                  textAlign: "center",
                  backgroundColor: dragOver ? "#f5f5f4" : "#faf8f5",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Upload size={36} style={{ color: "#78716c", margin: "0 auto 12px" }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1c1917" }}>
                  Upload Your Current Resume
                </div>
                <p style={{ fontSize: 12, color: "#78716c", margin: "6px 0 16px" }}>
                  Drag and drop your PDF or DOCX resume here, or click to browse (Max 5MB)
                </p>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 6,
                    backgroundColor: "#e7e2da",
                    color: "#44403c",
                  }}
                >
                  Supports PDF & DOCX
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI GAP ANALYSIS & READINESS ASSESSMENT */}
      {activeTab === "analysis" && (
        <div>
          {analysis ? (
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
              {/* Readiness Score Card */}
              <div
                style={{
                  padding: 24,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e7e2da",
                  height: "fit-content",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#78716c", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Target Role Readiness
                  </div>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 800,
                      color:
                        analysis.readinessAssessment.score >= 70
                          ? "#059669"
                          : analysis.readinessAssessment.score >= 40
                          ? "#d97706"
                          : "#dc2626",
                      lineHeight: 1.1,
                      margin: "8px 0",
                    }}
                  >
                    {analysis.readinessAssessment.score}%
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1c1917" }}>
                    {analysis.targetCareer}
                  </div>
                  <div style={{ fontSize: 11, color: "#78716c" }}>
                    Target: {analysis.targetRoleLevel} level in {analysis.timelineMonths} months
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f0eee6", paddingTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 6 }}>
                    Assessment Breakdown
                  </div>
                  <p style={{ fontSize: 12, color: "#78716c", lineHeight: 1.4, margin: "0 0 12px" }}>
                    {analysis.readinessAssessment.summary}
                  </p>
                  <div style={{ fontSize: 11, color: "#57534e", backgroundColor: "#faf8f5", padding: 8, borderRadius: 6 }}>
                    <strong>Criteria:</strong> {analysis.readinessAssessment.criteriaExplanation}
                  </div>
                </div>

                {/* Focus Areas */}
                {analysis.readinessAssessment.recommendedFocusAreas.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 6 }}>
                      Primary Focus Areas
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "#57534e", lineHeight: 1.5 }}>
                      {analysis.readinessAssessment.recommendedFocusAreas.map((fa, i) => (
                        <li key={i}>{fa}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Strengths & Skill Gaps Detail */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Strengths */}
                <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <CheckCircle2 size={16} style={{ color: "#059669" }} />
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1c1917" }}>
                      Existing Strengths & Transferable Foundation
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {analysis.strengths.map((str, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 12,
                          padding: "6px 12px",
                          borderRadius: 8,
                          backgroundColor: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          color: "#065f46",
                        }}
                      >
                        {str}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps with Priority */}
                <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <AlertCircle size={16} style={{ color: "#d97706" }} />
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1c1917" }}>
                      Identified Skill Gaps for {analysis.targetCareer}
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {analysis.skillGaps.map((gap, i) => (
                      <div
                        key={i}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          border: "1px solid #f0eee6",
                          backgroundColor: "#faf8f5",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "#1c1917" }}>{gap.skill}</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor:
                                gap.priority === "high" ? "#fee2e2" : gap.priority === "medium" ? "#fef3c7" : "#e0e7ff",
                              color:
                                gap.priority === "high" ? "#991b1b" : gap.priority === "medium" ? "#92400e" : "#3730a3",
                            }}
                          >
                            {gap.priority} Priority
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#78716c" }}>{gap.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience & Certification Recommendations */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ padding: 18, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
                      <FolderGit2 size={16} style={{ color: "#2563eb" }} /> Recommended Capstones
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#44403c", lineHeight: 1.5 }}>
                      {analysis.portfolioRecommendations.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ padding: 18, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
                      <Award size={16} style={{ color: "#7c3aed" }} /> Recommended Credentials
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#44403c", lineHeight: 1.5 }}>
                      {analysis.certificationRecommendations.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 48, backgroundColor: "#faf8f5", borderRadius: 12 }}>
              <Target size={32} style={{ color: "#a8a29e", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>No Gap Analysis Generated Yet</div>
              <p style={{ fontSize: 12, color: "#78716c" }}>
                Switch to the "Resume & Target Setup" tab to select your target career and run the analysis.
              </p>
              <button
                onClick={() => setActiveTab("upload")}
                style={{
                  marginTop: 8,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: "#292524",
                  color: "#fff",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Go to Target Setup
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONALIZED ROADMAP & MILESTONE TRACKER */}
      {activeTab === "roadmap" && (
        <div>
          {roadmap ? (
            <div>
              {/* Progress Summary Header */}
              <div
                style={{
                  padding: 20,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e7e2da",
                  marginBottom: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1917" }}>
                    {roadmap.targetCareer} — Multi-Phase Journey
                  </div>
                  <div style={{ fontSize: 12, color: "#78716c", marginTop: 2 }}>
                    {roadmap.phases.length} Phases • {roadmap.completedMilestones} of {roadmap.totalMilestones} Milestones Completed
                  </div>
                </div>

                <div style={{ width: 280 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <span>Journey Completion</span>
                    <span>{roadmap.overallProgressPercentage}%</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: "#f3f0ea", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${roadmap.overallProgressPercentage}%`,
                        backgroundColor: "#059669",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Phases & Milestone Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {roadmap.phases.map((phase) => {
                  const phaseMilestones = milestones.filter((m) => m.phaseNumber === phase.phaseNumber)
                  return (
                    <div
                      key={phase.phaseNumber}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        border: "1px solid #e7e2da",
                        padding: 20,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>
                            Phase {phase.phaseNumber} • {phase.durationWeeks} Weeks
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", marginTop: 2 }}>
                            {phase.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#78716c" }}>{phase.description}</div>
                        </div>
                      </div>

                      {/* Milestones grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {phaseMilestones.map((m) => {
                          const isCompleted = m.status === "completed"
                          const isInProgress = m.status === "in_progress"

                          return (
                            <div
                              key={m.id || m._id}
                              style={{
                                padding: 16,
                                borderRadius: 10,
                                border: isCompleted ? "1px solid #a7f3d0" : isInProgress ? "1px solid #fde68a" : "1px solid #e7e5e4",
                                backgroundColor: isCompleted ? "#f0fdf4" : isInProgress ? "#fffdf5" : "#faf8f5",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1917" }}>{m.title}</div>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      backgroundColor: isCompleted ? "#dcfce7" : isInProgress ? "#fef3c7" : "#e5e7eb",
                                      color: isCompleted ? "#15803d" : isInProgress ? "#b45309" : "#4b5563",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {m.status.replace("_", " ")}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: "#57534e", margin: "6px 0 10px", lineHeight: 1.4 }}>
                                  {m.description}
                                </div>

                                <div style={{ fontSize: 11, color: "#78716c", marginBottom: 8 }}>
                                  <strong>Deliverable:</strong> {m.expectedDeliverable}
                                </div>

                                {/* Curated Resource Links */}
                                {m.recommendedResources && m.recommendedResources.length > 0 && (
                                  <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "#44403c", marginBottom: 4 }}>
                                      Study Resources:
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                      {m.recommendedResources.map((res, idx) => (
                                        <a
                                          key={idx}
                                          href={res.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            fontSize: 10,
                                            padding: "2px 8px",
                                            borderRadius: 4,
                                            backgroundColor: "#fff",
                                            border: "1px solid #d6d3d1",
                                            color: "#1d4ed8",
                                            textDecoration: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 3,
                                          }}
                                        >
                                          {res.title} <ExternalLink size={9} />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Milestone Actions */}
                              <div
                                style={{
                                  borderTop: "1px solid #e7e5e4",
                                  paddingTop: 10,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                {isCompleted ? (
                                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <CheckCircle2 size={13} /> Verified on {new Date(m.completedAt || Date.now()).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    {m.status !== "in_progress" && (
                                      <button
                                        onClick={() => handleUpdateMilestoneStatus(m, "in_progress")}
                                        style={{
                                          fontSize: 11,
                                          padding: "4px 8px",
                                          borderRadius: 4,
                                          border: "1px solid #d6d3d1",
                                          backgroundColor: "#fff",
                                          cursor: "pointer",
                                        }}
                                      >
                                        Start Working
                                      </button>
                                    )}
                                  </div>
                                )}

                                <button
                                  onClick={() => openEvidenceModal(m)}
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "5px 10px",
                                    borderRadius: 6,
                                    backgroundColor: isCompleted ? "#faf8f5" : "#059669",
                                    color: isCompleted ? "#44403c" : "#fff",
                                    border: isCompleted ? "1px solid #d6d3d1" : "none",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  {isCompleted ? "View Evidence" : "Complete & Verify"}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 48, backgroundColor: "#faf8f5", borderRadius: 12 }}>
              <Layers size={32} style={{ color: "#a8a29e", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>No Roadmap Generated Yet</div>
              <p style={{ fontSize: 12, color: "#78716c" }}>
                Generate your career gap analysis first to build your structured development roadmap.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TIME MACHINE TIMELINE (+3M / +6M / +12M) */}
      {activeTab === "timeline" && (
        <div>
          {/* Time Machine Horizon Selector Slider */}
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#fff",
              borderRadius: 12,
              border: "1px solid #e7e2da",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1917" }}>
                Travel Across Development Horizons
              </div>
              <div style={{ fontSize: 12, color: "#78716c" }}>
                See how your resume dynamically transforms as you achieve planned milestones.
              </div>
            </div>

            {/* Horizon Pills */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { months: 0, label: "Current (Verified)" },
                { months: 3, label: "+3 Months (Foundations)" },
                { months: 6, label: "+6 Months (Capstone)" },
                { months: 12, label: "+12 Months (Career-Ready)" },
              ].map((h) => {
                const isSelected = selectedHorizonMonths === h.months
                return (
                  <button
                    key={h.months}
                    onClick={() => setSelectedHorizonMonths(h.months)}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      borderRadius: 8,
                      backgroundColor: isSelected ? "#292524" : "#faf8f5",
                      color: isSelected ? "#fff" : "#57534e",
                      border: isSelected ? "1px solid #292524" : "1px solid #e7e2da",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {h.label}
                  </button>
                )
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* View Switcher: Guide vs Resume */}
              {selectedHorizonMonths > 0 && (
                <div style={{ display: "flex", gap: 4, backgroundColor: "#faf8f5", padding: 3, borderRadius: 8, border: "1px solid #e7e2da" }}>
                  {[
                    { id: "both", label: "Guide + Resume" },
                    { id: "guide", label: "Action Guide" },
                    { id: "canvas", label: "Projected Resume" },
                  ].map((v) => {
                    const isSel = timelineViewMode === v.id
                    return (
                      <button
                        key={v.id}
                        onClick={() => setTimelineViewMode(v.id as any)}
                        style={{
                          padding: "5px 10px",
                          fontSize: 11,
                          fontWeight: isSel ? 700 : 500,
                          borderRadius: 6,
                          backgroundColor: isSel ? "#292524" : "transparent",
                          color: isSel ? "#fff" : "#78716c",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              )}

              <button
                onClick={() => openExportPreview(selectedHorizonMonths)}
                style={{
                  padding: "7px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  border: "1px solid #d6d3d1",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Printer size={13} /> Export / Print View
              </button>
            </div>
          </div>

          {/* HORIZON ACTION GUIDE: +3M FOUNDATIONS */}
          {selectedHorizonMonths === 3 && timelineViewMode !== "canvas" && (
            <FoundationsGuideView
              targetCareer={targetCareer}
              data={activeProjectionRecord?.foundationsGuide}
            />
          )}

          {/* HORIZON ACTION GUIDE: +6M REMAINING SKILLS & PROJECTS WITH FULL-STACK DOCS */}
          {selectedHorizonMonths === 6 && timelineViewMode !== "canvas" && (
            <RemainingSkillsAndProjectsView
              targetCareer={targetCareer}
              data={activeProjectionRecord?.remainingSkillsAndProjects}
              onCopyBullet={handleCopyBullet}
              copiedBulletIdx={copiedBulletIdx}
            />
          )}

          {/* HORIZON ACTION GUIDE: +12M INTERVIEW MASTERY & JOB LANDING (Shows ONLY Interview Questions) */}
          {selectedHorizonMonths === 12 && (
            <InterviewMasteryView
              targetCareer={targetCareer}
              data={activeProjectionRecord?.interviewMastery}
            />
          )}

          {/* PROJECTED RESUME CANVAS SECTION: Visible for Current, +3M, and +6M. Hidden on +12M which shows ONLY interview questions */}
          {selectedHorizonMonths !== 12 && (timelineViewMode !== "guide" || selectedHorizonMonths === 0) && (
            <div>
              {/* Header Title for Projected Resume Section */}
              {selectedHorizonMonths > 0 && timelineViewMode === "both" && (
                <div style={{ margin: "28px 0 14px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px dashed #d6d3d1", paddingTop: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>
                    Projected Resume Paper Preview (+{selectedHorizonMonths} Months)
                  </span>
                  <span style={{ fontSize: 11, color: "#78716c" }}>
                    — Reflects skills, capstones, and achievements gained from the roadmap above
                  </span>
                </div>
              )}

              {/* Watermark Banner for Projected Resumes */}
              {selectedHorizonMonths > 0 && (
                <div
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: 8,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 12,
                    color: "#92400e",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>PROJECTED RESUME (+{selectedHorizonMonths} MONTHS) — NOT YET ACHIEVED:</strong> Sections marked
                    with planned tags represent future learning goals. They will transform into verified achievements as you
                    complete milestone deliverables.
                  </div>
                </div>
              )}

              {/* Planned Achievements Summary Bar */}
              {selectedHorizonMonths > 0 && activeProjectionRecord && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#faf8f5",
                    borderRadius: 8,
                    border: "1px solid #e7e2da",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 6 }}>
                    Target Achievements Projected for this Horizon:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {activeProjectionRecord.plannedAchievements.map((ach, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          backgroundColor: ach.plannedOrAchieved === "achieved" ? "#dcfce7" : "#fef3c7",
                          color: ach.plannedOrAchieved === "achieved" ? "#15803d" : "#92400e",
                          border: ach.plannedOrAchieved === "achieved" ? "1px solid #bbf7d0" : "1px solid #fde68a",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {ach.plannedOrAchieved === "achieved" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {ach.title} ({ach.plannedOrAchieved.toUpperCase()})
                      </span>
                    ))}
                  </div>
                </div>
              )}

          {/* Render Full Resume Paper Canvas */}
          {currentOrProjectedContent ? (
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "1px solid #e7e2da",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "36px 44px",
                maxWidth: 860,
                margin: "0 auto",
              }}
            >
              {/* Header Contact */}
              <div style={{ borderBottom: "2px solid #1c1917", paddingBottom: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1c1917", letterSpacing: "-0.01em" }}>
                    {currentOrProjectedContent.personalInfo.fullName || "Candidate"}
                  </h1>
                  {selectedHorizonMonths > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 4,
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                      }}
                    >
                      PROJECTED +{selectedHorizonMonths}M
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#57534e", marginTop: 4 }}>
                  {[
                    currentOrProjectedContent.personalInfo.email,
                    currentOrProjectedContent.personalInfo.phone,
                    currentOrProjectedContent.personalInfo.location,
                    currentOrProjectedContent.personalInfo.linkedin,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>

              {/* Summary */}
              {currentOrProjectedContent.summary && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#78716c", letterSpacing: 0.5, marginBottom: 4 }}>
                    Professional Summary
                  </div>
                  <p style={{ fontSize: 13, color: "#292524", lineHeight: 1.5, margin: 0 }}>
                    {currentOrProjectedContent.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#78716c", letterSpacing: 0.5, marginBottom: 6 }}>
                  Technical Skills & Competencies
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {currentOrProjectedContent.skills.map((skill, i) => {
                    const isNew = selectedHorizonMonths > 0 && !currentResume?.parsedContent.skills.includes(skill)
                    return (
                      <span
                        key={i}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 4,
                          backgroundColor: isNew ? "#eff6ff" : "#f5f5f4",
                          color: isNew ? "#1e40af" : "#292524",
                          border: isNew ? "1px solid #bfdbfe" : "1px solid #e7e5e4",
                          fontWeight: isNew ? 600 : 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {skill}
                        {isNew && <span style={{ fontSize: 9, color: "#2563eb", fontWeight: 700 }}>[PLANNED]</span>}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Projects */}
              {currentOrProjectedContent.projects.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#78716c", letterSpacing: 0.5, marginBottom: 8 }}>
                    Projects & Capstones
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentOrProjectedContent.projects.map((proj, i) => (
                      <div key={i} style={{ borderLeft: proj.isPlanned ? "3px solid #f59e0b" : "3px solid #d6d3d1", paddingLeft: 10 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#1c1917" }}>{proj.name}</span>
                          {proj.isPlanned && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", backgroundColor: "#fef3c7", padding: "1px 5px", borderRadius: 3 }}>
                              PLANNED CAPSTONE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#44403c", marginTop: 2 }}>{proj.description}</div>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div style={{ fontSize: 11, color: "#78716c", marginTop: 2 }}>
                            <strong>Tech Stack:</strong> {proj.technologies.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {currentOrProjectedContent.certifications.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#78716c", letterSpacing: 0.5, marginBottom: 6 }}>
                    Certifications & Credentials
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {currentOrProjectedContent.certifications.map((cert, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        <Award size={14} style={{ color: cert.isPlanned ? "#d97706" : "#059669" }} />
                        <span style={{ fontWeight: 600, color: "#1c1917" }}>{cert.name}</span>
                        <span style={{ color: "#78716c" }}>— {cert.issuer}</span>
                        {cert.isPlanned && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#d97706", backgroundColor: "#fef3c7", padding: "1px 4px", borderRadius: 3 }}>
                            PLANNED
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {currentOrProjectedContent.experience.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#78716c", letterSpacing: 0.5, marginBottom: 8 }}>
                    Professional Experience
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentOrProjectedContent.experience.map((exp, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#1c1917" }}>{exp.role}</span>
                          <span style={{ fontSize: 11, color: "#78716c" }}>{exp.company}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#44403c", marginTop: 2 }}>{exp.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {currentOrProjectedContent.education.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#78716c", letterSpacing: 0.5, marginBottom: 6 }}>
                    Education
                  </div>
                  {currentOrProjectedContent.education.map((edu, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#292524" }}>
                      <strong>{edu.degree}</strong> — {edu.institution}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 36, color: "#78716c" }}>No resume loaded.</div>
          )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SIDE-BY-SIDE DIFF COMPARISON */}
      {activeTab === "compare" && (
        <div>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1c1917" }}>
                Side-by-Side Evolution Diff
              </div>
              <div style={{ fontSize: 12, color: "#78716c" }}>
                Compare your current verified resume against your projected horizon (+3, +6, or +12 months).
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedHorizonMonths(m)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: selectedHorizonMonths === m ? 700 : 500,
                    borderRadius: 6,
                    backgroundColor: selectedHorizonMonths === m ? "#292524" : "#faf8f5",
                    color: selectedHorizonMonths === m ? "#fff" : "#57534e",
                    border: "1px solid #e7e2da",
                    cursor: "pointer",
                  }}
                >
                  +{m} Months
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left: Current Resume */}
            <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
              <div style={{ borderBottom: "1px solid #e7e2da", paddingBottom: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
                  Current Baseline (Verified)
                </span>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", marginTop: 2 }}>
                  {currentResume?.parsedContent.personalInfo.fullName || "Candidate"}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#78716c", marginBottom: 4 }}>Skills ({currentResume?.parsedContent.skills.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {currentResume?.parsedContent.skills.map((s, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "2px 7px", backgroundColor: "#f5f5f4", borderRadius: 4, color: "#44403c" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#78716c", marginBottom: 4 }}>Projects</div>
                {currentResume?.parsedContent.projects.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#44403c", marginBottom: 4 }}>
                    • <strong>{p.name}</strong>: {p.description}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Projected Horizon */}
            <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #fde68a" }}>
              <div style={{ borderBottom: "1px solid #fde68a", paddingBottom: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>
                  Projected +{selectedHorizonMonths} Months (Planned Horizon)
                </span>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", marginTop: 2 }}>
                  {currentOrProjectedContent?.personalInfo.fullName || "Candidate"} — {targetCareer}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#78716c", marginBottom: 4 }}>
                  Evolved Skills ({currentOrProjectedContent?.skills.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {currentOrProjectedContent?.skills.map((s, i) => {
                    const isNew = !currentResume?.parsedContent.skills.includes(s)
                    return (
                      <span
                        key={i}
                        style={{
                          fontSize: 11,
                          padding: "2px 7px",
                          borderRadius: 4,
                          backgroundColor: isNew ? "#dbeafe" : "#f5f5f4",
                          color: isNew ? "#1e40af" : "#44403c",
                          fontWeight: isNew ? 700 : 400,
                          border: isNew ? "1px solid #93c5fd" : "none",
                        }}
                      >
                        {s} {isNew && "★"}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#78716c", marginBottom: 4 }}>
                  Planned Capstones & Certifications
                </div>
                {currentOrProjectedContent?.projects
                  .filter((p) => p.isPlanned)
                  .map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#92400e", marginBottom: 6, backgroundColor: "#fef3c7", padding: 6, borderRadius: 4 }}>
                      ★ <strong>{p.name}</strong>: {p.description}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: VERSION SNAPSHOTS & AUDIT LOG */}
      {activeTab === "snapshots" && (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1917" }}>
                Immutable Resume Snapshots
              </div>
              <div style={{ fontSize: 12, color: "#78716c" }}>
                Every upload, manual edit, and milestone verification automatically creates an audited version record.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {snapshots.map((snap) => (
              <div
                key={snap.id || snap._id}
                style={{
                  padding: 16,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  border: "1px solid #e7e2da",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        backgroundColor: "#292524",
                        color: "#fff",
                      }}
                    >
                      v{snap.version}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1c1917" }}>{snap.title}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 4,
                        backgroundColor: "#faf8f5",
                        color: "#78716c",
                        border: "1px solid #e7e2da",
                      }}
                    >
                      {snap.snapshotType}
                    </span>
                  </div>

                  {snap.changeLog && snap.changeLog.length > 0 && (
                    <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12, color: "#57534e" }}>
                      {snap.changeLog.map((log, idx) => (
                        <li key={idx}>{log}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ fontSize: 11, color: "#a8a29e", whiteSpace: "nowrap" }}>
                  {new Date(snap.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVIDENCE SUBMISSION MODAL */}
      <AnimatePresence>
        {showEvidenceModal && activeMilestoneForEvidence && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                width: "100%",
                maxWidth: 540,
                padding: 24,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck size={20} style={{ color: "#059669" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#1c1917" }}>
                    Milestone Completion & Verification
                  </h3>
                </div>
                <button
                  onClick={() => setShowEvidenceModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 12, backgroundColor: "#faf8f5", borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1917" }}>
                  {activeMilestoneForEvidence.title}
                </div>
                <div style={{ fontSize: 12, color: "#57534e", marginTop: 4 }}>
                  {activeMilestoneForEvidence.description}
                </div>
                <div style={{ fontSize: 11, color: "#78716c", marginTop: 6 }}>
                  <strong>Expected Deliverable:</strong> {activeMilestoneForEvidence.expectedDeliverable}
                </div>
              </div>

              {/* Description Input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 4 }}>
                  Completion Summary & Artifacts Built *
                </label>
                <textarea
                  rows={3}
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="Describe the projects built, concepts mastered, or labs finished (min 10 characters)..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #d6d3d1",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Evidence URL Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 4 }}>
                  Evidence Link (GitHub Repo, Deployment, or Certificate)
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/your-username/repo-name"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #d6d3d1",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Confirmation Checkbox (Strict Trust Rule) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "10px 12px",
                  backgroundColor: "#fffdf5",
                  border: "1px solid #fde68a",
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <input
                  type="checkbox"
                  id="confirm-evidence"
                  checked={evidenceConfirmed}
                  onChange={(e) => setEvidenceConfirmed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#059669" }}
                />
                <label htmlFor="confirm-evidence" style={{ fontSize: 11, color: "#92400e", lineHeight: 1.4, cursor: "pointer" }}>
                  <strong>Integrity Pledge:</strong> I confirm that I have genuinely completed this milestone and
                  produced verifiable work. Completing this milestone advances my LifeFlow roadmap and transforms this item into
                  an achieved credential.
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  onClick={() => setShowEvidenceModal(false)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    borderRadius: 8,
                    border: "1px solid #d6d3d1",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvidence}
                  disabled={loading || !evidenceConfirmed}
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    backgroundColor: evidenceConfirmed ? "#059669" : "#a8a29e",
                    color: "#fff",
                    border: "none",
                    cursor: evidenceConfirmed ? "pointer" : "not-allowed",
                  }}
                >
                  Verify & Graduate Milestone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPORT / PRINT PREVIEW MODAL */}
      <AnimatePresence>
        {showExportModal && exportData && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: 20,
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                width: "100%",
                maxWidth: 820,
                maxHeight: "90vh",
                overflowY: "auto",
                padding: 32,
              }}
            >
              {/* Print CSS Injection */}
              <style>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-export-document, #printable-export-document * {
                    visibility: visible !important;
                  }
                  #printable-export-document {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 24px !important;
                    border: none !important;
                    box-shadow: none !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}</style>

              {/* Modal Header */}
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Printer size={18} />
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Print / Export Resume Preview</span>
                  {exportHorizon === 12 && (
                    <div style={{ display: "flex", gap: 4, marginLeft: 10, backgroundColor: "#f5f3ff", padding: 3, borderRadius: 6, border: "1px solid #ddd6fe" }}>
                      <button
                        onClick={() => setPrintModalView("full")}
                        style={{
                          padding: "4px 8px",
                          fontSize: 11,
                          fontWeight: printModalView === "full" ? 700 : 500,
                          backgroundColor: printModalView === "full" ? "#6d28d9" : "transparent",
                          color: printModalView === "full" ? "#fff" : "#6d28d9",
                          borderRadius: 4,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Resume + Questions
                      </button>
                      <button
                        onClick={() => setPrintModalView("interview_only")}
                        style={{
                          padding: "4px 8px",
                          fontSize: 11,
                          fontWeight: printModalView === "interview_only" ? 700 : 500,
                          backgroundColor: printModalView === "interview_only" ? "#6d28d9" : "transparent",
                          color: printModalView === "interview_only" ? "#fff" : "#6d28d9",
                          borderRadius: 4,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Interview Questions Only
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: "#292524",
                      color: "#fff",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Printer size={13} /> Print Document
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {exportData.isProjected && (
                <div
                  className="no-print"
                  style={{
                    padding: 12,
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#92400e",
                    marginBottom: 20,
                  }}
                >
                  {exportData.disclaimer}
                </div>
              )}

              {/* Clean Printable Document View */}
              {(() => {
                const skillsToLearnList =
                  exportData.skillsStillToLearn && exportData.skillsStillToLearn.length > 0
                    ? exportData.skillsStillToLearn
                    : analysis?.skillGaps && analysis.skillGaps.length > 0
                    ? analysis.skillGaps
                    : activeProjectionRecord?.remainingSkillsAndProjects?.remainingSkills
                    ? activeProjectionRecord.remainingSkillsAndProjects.remainingSkills.map((s: string) => ({ skill: s, priority: "high", reason: `Target competency for ${targetCareer}` }))
                    : []

                const exportInterviewQuestions =
                  exportData.interviewQuestions && exportData.interviewQuestions.length > 0
                    ? exportData.interviewQuestions
                    : activeProjectionRecord?.interviewMastery?.technicalQuestions && activeProjectionRecord.interviewMastery.technicalQuestions.length > 0
                    ? activeProjectionRecord.interviewMastery.technicalQuestions
                    : getInterviewQuestionsForCareer(targetCareer)

                const is12M = exportHorizon === 12 || exportData.projectionMonths === 12

                return (
                  <div id="printable-export-document" style={{ border: "1px solid #e7e2da", padding: 28, borderRadius: 8, backgroundColor: "#fff" }}>
                    {/* If user selected "Interview Questions Only" on 12M */}
                    {printModalView === "interview_only" && is12M ? (
                      <div>
                        <div style={{ borderBottom: "2px solid #6d28d9", paddingBottom: 12, marginBottom: 16 }}>
                          <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1c1917" }}>
                            {exportData.resume.personalInfo.fullName || "Candidate"} — Technical Interview Questions
                          </h2>
                          <div style={{ fontSize: 12, color: "#6d28d9", fontWeight: 700 }}>
                            Target Role: {exportData.targetCareer || targetCareer} (+12 Months Interview Mastery)
                          </div>
                        </div>

                        {/* Technical Questions List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {exportInterviewQuestions.map((q: any, qIdx: number) => (
                            <div key={qIdx} style={{ padding: "12px 14px", backgroundColor: "#faf8f5", borderRadius: 8, border: "1px solid #e7e2da" }}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, backgroundColor: "#ede9fe", color: "#6d28d9" }}>
                                  {q.category || "Technical"}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>
                                  Q{qIdx + 1}: {q.question}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: "#292524", lineHeight: 1.5, marginTop: 4 }}>
                                <strong style={{ color: "#6d28d9" }}>Ideal Answer: </strong>
                                {q.idealAnswer}
                              </div>
                              {q.keyTalkingPoints && q.keyTalkingPoints.length > 0 && (
                                <div style={{ marginTop: 6, fontSize: 11, color: "#065f46" }}>
                                  <strong>Key Verbal Talking Points: </strong> {q.keyTalkingPoints.join(" • ")}
                                </div>
                              )}
                              {q.codeSnippetOrDiagram && (
                                <pre style={{ marginTop: 8, padding: 10, backgroundColor: "#1c1917", color: "#f5f5f4", borderRadius: 6, fontSize: 10, fontFamily: "monospace", overflowX: "auto" }}>
                                  {q.codeSnippetOrDiagram}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Full Resume Document View (Including Skills Still to Learn & Interview Questions) */
                      <div>
                        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1c1917" }}>{exportData.resume.title}</h2>
                        <div style={{ fontSize: 12, color: "#78716c", marginBottom: 16 }}>
                          {[
                            exportData.resume.personalInfo.email,
                            exportData.resume.personalInfo.phone,
                            exportData.resume.personalInfo.location,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>

                        {exportData.resume.summary && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#78716c" }}>Summary</div>
                            <p style={{ fontSize: 12, margin: "2px 0 0", color: "#292524" }}>{exportData.resume.summary}</p>
                          </div>
                        )}

                        {/* Demonstrated Skills */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#78716c" }}>Demonstrated Skills</div>
                          <div style={{ fontSize: 12, color: "#292524", marginTop: 2 }}>{exportData.resume.skills.join(", ")}</div>
                        </div>

                        {/* SKILLS STILL TO LEARN (CRITICAL REQUIREMENT) */}
                        {skillsToLearnList.length > 0 && (
                          <div style={{ marginBottom: 16, padding: "12px 14px", backgroundColor: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#92400e", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>Skills Still to Learn for {exportData.targetCareer || targetCareer}</span>
                              <span style={{ fontSize: 10, fontWeight: 600 }}>Identified Development Gaps</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {skillsToLearnList.map((gap: any, idx: number) => (
                                <div key={idx} style={{ fontSize: 11, backgroundColor: "#fff", padding: "6px 10px", borderRadius: 6, border: "1px solid #fef3c7" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <strong style={{ color: "#1c1917" }}>{gap.skill}</strong>
                                    <span style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      padding: "1px 5px",
                                      borderRadius: 3,
                                      backgroundColor: gap.priority === "high" ? "#fee2e2" : "#fef3c7",
                                      color: gap.priority === "high" ? "#991b1b" : "#92400e",
                                    }}>
                                      {gap.priority || "gap"}
                                    </span>
                                  </div>
                                  {gap.reason && <div style={{ fontSize: 10, color: "#78716c", marginTop: 2 }}>{gap.reason}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {exportData.resume.projects.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#78716c" }}>Projects</div>
                            {exportData.resume.projects.map((p: any, i: number) => (
                              <div key={i} style={{ fontSize: 12, marginTop: 4 }}>
                                • <strong>{p.name}</strong>: {p.description}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Education */}
                        {exportData.resume.education && exportData.resume.education.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#78716c" }}>Education</div>
                            {exportData.resume.education.map((edu: any, i: number) => (
                              <div key={i} style={{ fontSize: 12, color: "#292524", marginTop: 2 }}>
                                • <strong>{edu.degree}</strong> — {edu.institution}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* TECHNICAL INTERVIEW QUESTIONS (WHEN ON 12M) */}
                        {is12M && exportInterviewQuestions.length > 0 && (
                          <div style={{ marginTop: 22, paddingTop: 16, borderTop: "2px solid #1c1917" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "#6d28d9", letterSpacing: 0.5, marginBottom: 4 }}>
                              Technical Interview Questions to Land the Job ({exportData.targetCareer || targetCareer})
                            </div>
                            <p style={{ fontSize: 11, color: "#78716c", margin: "0 0 14px" }}>
                              Master senior-level technical Q&A, system design architecture, and troubleshooting to crack {exportData.targetCareer || targetCareer} interviews.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {exportInterviewQuestions.map((q: any, qIdx: number) => (
                                <div key={qIdx} style={{ padding: "12px 14px", backgroundColor: "#faf8f5", borderRadius: 8, border: "1px solid #e7e2da" }}>
                                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, backgroundColor: "#ede9fe", color: "#6d28d9" }}>
                                      {q.category || "Technical"}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1c1917" }}>
                                      Q{qIdx + 1}: {q.question}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11, color: "#292524", lineHeight: 1.5, marginTop: 4 }}>
                                    <strong style={{ color: "#6d28d9" }}>Ideal Answer: </strong>
                                    {q.idealAnswer}
                                  </div>
                                  {q.keyTalkingPoints && q.keyTalkingPoints.length > 0 && (
                                    <div style={{ marginTop: 6, fontSize: 11, color: "#065f46" }}>
                                      <strong>Key Talking Points: </strong> {q.keyTalkingPoints.join(" • ")}
                                    </div>
                                  )}
                                  {q.codeSnippetOrDiagram && (
                                    <pre style={{ marginTop: 8, padding: 8, backgroundColor: "#1c1917", color: "#f5f5f4", borderRadius: 6, fontSize: 10, fontFamily: "monospace", overflowX: "auto" }}>
                                      {q.codeSnippetOrDiagram}
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
