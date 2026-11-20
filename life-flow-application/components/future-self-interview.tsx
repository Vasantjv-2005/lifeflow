"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CornerDownLeft,
  Flame,
  HelpCircle,
  Lightbulb,
  Mic,
  MicOff,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Square,
  Target,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  createFutureSelfProfile,
  getFutureSelfProfiles,
  createFutureSelfInterview,
  getFutureSelfInterviews,
  getFutureSelfInterview,
  getFutureSelfMessages,
  sendFutureSelfMessage,
  completeFutureSelfInterview,
  updateFutureSelfReflection,
  deleteFutureSelfInterview,
  type FutureSelfProfile,
  type FutureSelfInterview,
  type FutureSelfMessage,
  type DecisionSummary,
} from "@/lib/api"
import { useAuthStore } from "@/lib/use-auth-store"

const TIME_HORIZONS = [
  { value: "6 months", label: "6 Months", desc: "Short-term sprint: Immediate habit overhaul and rapid milestone focus." },
  { value: "1 year", label: "1 Year", desc: "Foundational shift: Significant lifestyle progression and career momentum." },
  { value: "3 years", label: "3 Years", desc: "Transformational: Career elevation, compound financial impact, deep relationships." },
  { value: "5 years", label: "5 Years", desc: "Strategic evolution: Major milestones achieved, newfound wisdom and resilience." },
  { value: "10 years", label: "10 Years", desc: "Visionary self: Reflecting on long-term compound choices that defined your identity." },
] as const

const LIFE_AREAS = [
  "Career",
  "Lifestyle",
  "Health and Fitness",
  "Financial Growth",
  "Education",
  "Relationships",
  "Personal Development",
  "Entrepreneurship",
  "Work-Life Balance",
]

/**
 * Validates that an input string consists of meaningful language
 * rather than random keysmash or gibberish (e.g. "sdfsdoinoi", "asdfghjkl").
 */
export const isValidMeaningfulStatement = (text: string): boolean => {
  if (!text || typeof text !== "string") return false
  const trimmed = text.trim()
  if (trimmed.length < 5) return false

  // Repeated identical characters like "aaaaa" or "11111"
  if (/^(.)\1+$/.test(trimmed)) return false

  // Detect random keysmash with 5 or more consecutive consonants (e.g. "sdfsd", "qwrtp", "sdfsdoinoi")
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed)) return false

  const words = trimmed.split(/\s+/).filter(Boolean)

  // If there is only 1 word and it's long without spaces, check for keysmash patterns
  if (words.length === 1 && trimmed.length > 7) {
    if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(trimmed)) return false
  }

  // Must contain letters
  const letters = trimmed.replace(/[^a-zA-Z]/g, "")
  if (letters.length < 3) return false

  // Count vowels
  const vowels = trimmed.replace(/[^aeiouyAEIOUY]/g, "")
  const vowelRatio = vowels.length / letters.length

  // In normal human language, vowel ratio is between 15% and 85%
  if (letters.length >= 6 && (vowelRatio < 0.15 || vowelRatio > 0.85)) {
    return false
  }

  // Check that at least half of the words of length >= 3 contain a vowel
  let invalidWordCount = 0
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase()
    if (cleanWord.length >= 3 && !/[aeiouy]/.test(cleanWord)) {
      invalidWordCount++
    }
  }

  if (invalidWordCount > 0 && invalidWordCount >= words.length / 2) {
    return false
  }

  return true
}

export function FutureSelfInterviewExperience() {
  const { user } = useAuthStore()

  // App Flow State: 'landing' | 'wizard' | 'interview' | 'history'
  const [view, setView] = useState<"landing" | "wizard" | "interview" | "history">("landing")

  // Profiles & Interviews
  const [profiles, setProfiles] = useState<FutureSelfProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<FutureSelfProfile | null>(null)
  const [interviews, setInterviews] = useState<FutureSelfInterview[]>([])
  const [activeInterview, setActiveInterview] = useState<FutureSelfInterview | null>(null)
  const [messages, setMessages] = useState<FutureSelfMessage[]>([])

  // Loading States
  const [loading, setLoading] = useState(false)
  const [generatingProfile, setGeneratingProfile] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [completingDecision, setCompletingDecision] = useState(false)
  const [savingReflection, setSavingReflection] = useState(false)

  // Chat & Reflection State
  const [inputMessage, setInputMessage] = useState("")
  const [reflectionInput, setReflectionInput] = useState("")
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)

  // Multi-step Wizard State (Steps 1 to 6)
  const [wizardStep, setWizardStep] = useState(1)
  const [formData, setFormData] = useState({
    timeHorizon: "1 year" as "6 months" | "1 year" | "3 years" | "5 years" | "10 years",
    lifeAreas: ["Career", "Financial Growth"] as string[],
    currentSituation: "",
    currentHabits: "",
    strengths: "",
    challenges: "",
    responsibilities: "",
    futureGoals: "",
    desiredIdentity: "",
    desiredHabits: "",
    concerns: "",
    availableTime: "1-2 hours per day",
    monthlyBudget: "",
    currentSkills: "",
    availableSupport: "",
    constraints: "",
  })

  // ==================== VOICE / TEXT-TO-SPEECH ENGINE ====================
  const [speechSupported, setSpeechSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [speechRate, setSpeechRate] = useState<number>(1.0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [activeSpeakingText, setActiveSpeakingText] = useState("")
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true)

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices()
        if (available.length > 0) {
          setVoices(available)
          // Pick a good English default voice if available
          const preferred =
            available.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))) ||
            available.find((v) => v.lang.startsWith("en")) ||
            available[0]
          if (preferred && !selectedVoice) {
            setSelectedVoice(preferred.name)
          }
        }
      }

      updateVoices()
      window.speechSynthesis.onvoiceschanged = updateVoices
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Speech Helper
  const speakText = (text: string) => {
    if (!speechSupported || isMuted || !text) return

    try {
      window.speechSynthesis.cancel()

      const cleanText = text
        .replace(/[*_#`~[\]]/g, "")
        .replace(/\n\s*\n/g, ". ")
        .slice(0, 1000)

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = speechRate

      if (selectedVoice) {
        const foundVoice = voices.find((v) => v.name === selectedVoice)
        if (foundVoice) utterance.voice = foundVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
        setActiveSpeakingText(text)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        setActiveSpeakingText("")
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        setActiveSpeakingText("")
      }

      window.speechSynthesis.speak(utterance)
    } catch {
      setIsSpeaking(false)
    }
  }

  const pauseSpeech = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resumeSpeech = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stopSpeech = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    setActiveSpeakingText("")
  }

  // Load profiles and interviews on mount
  useEffect(() => {
    loadUserProfilesAndInterviews()
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (view === "interview") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, view])

  const loadUserProfilesAndInterviews = async () => {
    setLoading(true)
    try {
      const [fetchedProfiles, fetchedInterviews] = await Promise.all([
        getFutureSelfProfiles().catch(() => []),
        getFutureSelfInterviews(1, 20).catch(() => ({ interviews: [] })),
      ])
      setProfiles(fetchedProfiles)
      setInterviews(fetchedInterviews.interviews || [])
    } finally {
      setLoading(false)
    }
  }

  // Handle Profile Creation from Wizard
  const handleGenerateProfile = async () => {
    if (!formData.currentSituation.trim() || !formData.futureGoals.trim()) {
      toast.error("Please fill in your current situation and future goals before proceeding.")
      return
    }

    if (!isValidMeaningfulStatement(formData.currentSituation)) {
      toast.error("not a valid statement. Please enter a meaningful description for your current situation.")
      return
    }

    if (!isValidMeaningfulStatement(formData.futureGoals)) {
      toast.error("not a valid statement. Please enter your primary future goals in meaningful words.")
      return
    }

    if (!formData.availableTime.trim() || !isValidMeaningfulStatement(formData.availableTime)) {
      toast.error("not a valid statement. Please specify a realistic daily time commitment (e.g. 1-2 hours per day).")
      return
    }

    setGeneratingProfile(true)
    try {
      const newProfile = await createFutureSelfProfile({
        timeHorizon: formData.timeHorizon,
        lifeAreas: formData.lifeAreas,
        currentSituation: formData.currentSituation,
        currentHabits: formData.currentHabits,
        strengths: formData.strengths,
        challenges: formData.challenges,
        responsibilities: formData.responsibilities,
        futureGoals: formData.futureGoals,
        desiredIdentity: formData.desiredIdentity,
        desiredHabits: formData.desiredHabits,
        concerns: formData.concerns,
        availableTime: formData.availableTime,
        monthlyBudget: formData.monthlyBudget,
        currentSkills: formData.currentSkills,
        availableSupport: formData.availableSupport,
        constraints: formData.constraints,
      })

      setProfiles((prev) => [newProfile, ...prev])
      setSelectedProfile(newProfile)

      // Automatically initiate an interview session
      const { interview, openingMessage } = await createFutureSelfInterview({
        futureSelfProfileId: newProfile.id,
      })

      setActiveInterview(interview)
      setMessages([openingMessage])
      setView("interview")
      toast.success("Future self synthesized. Opening your interview.")

      // Speak opening message if voice enabled
      setTimeout(() => {
        speakText(openingMessage.content)
      }, 700)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Failed to generate future self profile. Please verify your inputs.")
    } finally {
      setGeneratingProfile(false)
    }
  }

  // Start or open existing interview
  const handleSelectInterview = async (interview: FutureSelfInterview) => {
    stopSpeech()
    setLoading(true)
    try {
      const [fullInterview, fetchedMessages] = await Promise.all([
        getFutureSelfInterview(interview.id),
        getFutureSelfMessages(interview.id),
      ])
      setActiveInterview(fullInterview)
      setMessages(fetchedMessages)

      // Set profile
      const prof =
        typeof fullInterview.futureSelfProfileId === "object"
          ? (fullInterview.futureSelfProfileId as FutureSelfProfile)
          : profiles.find((p) => p.id === fullInterview.futureSelfProfileId)
      if (prof) setSelectedProfile(prof)

      setView("interview")
    } catch {
      toast.error("Failed to load interview history.")
    } finally {
      setLoading(false)
    }
  }

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || !activeInterview || sendingMessage) return

    if (!isValidMeaningfulStatement(text)) {
      toast.error("not a valid statement. Please ask your future self a meaningful question.")
      return
    }

    stopSpeech()
    setInputMessage("")
    setSendingMessage(true)

    // Optimistic user message preview
    const tempUserMsg: FutureSelfMessage = {
      id: "temp-" + Date.now(),
      interviewId: activeInterview.id,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const { userMessage, assistantMessage } = await sendFutureSelfMessage(activeInterview.id, text)

      // Replace temp with real messages
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), userMessage, assistantMessage])

      // Automatically speak the new response if not muted
      speakText(assistantMessage.content)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Failed to deliver message to your future self.")
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
      setInputMessage(text)
    } finally {
      setSendingMessage(false)
    }
  }

  // Complete Interview & Synthesize Decision
  const handleCompleteInterview = async () => {
    if (!activeInterview) return
    setCompletingDecision(true)
    try {
      const completed = await completeFutureSelfInterview(activeInterview.id)
      setActiveInterview(completed)
      setShowSummaryModal(true)
      toast.success("Strategic decision summary generated.")

      if (completed.decisionSummary?.spokenText) {
        setTimeout(() => {
          speakText(completed.decisionSummary?.spokenText || "")
        }, 600)
      }
    } catch {
      toast.error("Failed to synthesize decision summary.")
    } finally {
      setCompletingDecision(false)
    }
  }

  // Save Reflection
  const handleSaveReflection = async () => {
    if (!activeInterview || !reflectionInput.trim()) return
    setSavingReflection(true)
    try {
      const updated = await updateFutureSelfReflection(activeInterview.id, reflectionInput.trim())
      setActiveInterview(updated)
      toast.success("Personal reflection saved to your MongoDB workspace.")
    } catch {
      toast.error("Failed to save reflection.")
    } finally {
      setSavingReflection(false)
    }
  }

  // Delete Interview
  const handleDeleteInterview = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this interview and its transcript?")) return
    try {
      await deleteFutureSelfInterview(id)
      setInterviews((prev) => prev.filter((i) => i.id !== id))
      if (activeInterview?.id === id) {
        setActiveInterview(null)
        setMessages([])
        setView("landing")
      }
      toast.success("Interview removed.")
    } catch {
      toast.error("Failed to delete interview.")
    }
  }

  const toggleLifeArea = (area: string) => {
    setFormData((prev) => {
      const exists = prev.lifeAreas.includes(area)
      if (exists) {
        if (prev.lifeAreas.length <= 1) return prev
        return { ...prev, lifeAreas: prev.lifeAreas.filter((a) => a !== area) }
      }
      return { ...prev, lifeAreas: [...prev.lifeAreas, area] }
    })
  }

  // =========================================================================
  // RENDER: LANDING SCREEN
  // =========================================================================
  if (view === "landing") {
    return (
      <div className="dashboard-content-pad" style={{ maxWidth: 1080, margin: "0 auto", paddingBottom: 64 }}>
        <header className="page-header" style={{ marginBottom: 32 }}>
          <div className="page-header-top">
            <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Compass size={13} color="#8c6e3b" />
              LIFEFLOW INTELLIGENCE &bull; FUTURE SELF INTERVIEW
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: 32, letterSpacing: "-0.03em", marginTop: 4 }}>
            Meet the person you&apos;re becoming.
          </h1>
          <p className="page-subtitle" style={{ maxWidth: 640, fontSize: 15, color: "#6e675c", marginTop: 8 }}>
            Explore a possible version of your future through meaningful conversations, personal goals, and the decisions you make today.
          </p>
        </header>

        {/* Hypothetical Simulation Disclosure Banner */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            background: "#fbf8f2",
            border: "1px solid #ebd9be",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <HelpCircle size={18} color="#8c6e3b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: "#695e50", lineHeight: 1.5 }}>
            <strong style={{ color: "#312d26" }}>Hypothetical Projection Notice:</strong> Future Self conversations are generative roleplay projections crafted to provoke self-reflection and examine potential consequences. They are not guaranteed predictions or sources of verified future events.
          </div>
        </div>

        {/* Hero Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 44 }}>
          <button
            type="button"
            className="action-btn"
            style={{
              background: "#24201c",
              color: "#fcfbf9",
              padding: "12px 24px",
              fontSize: 14,
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
            onClick={() => {
              setWizardStep(1)
              setView("wizard")
            }}
          >
            <Sparkles size={16} />
            Meet My Future Self
          </button>

          {interviews.length > 0 && (
            <button
              type="button"
              className="action-btn-outline"
              style={{
                padding: "12px 20px",
                fontSize: 14,
                borderRadius: 8,
                border: "1px solid #d5cfc4",
                background: "#ffffff",
                color: "#38342f",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
              onClick={() => setView("history")}
            >
              <Clock size={16} color="#8c6e3b" />
              View Previous Interviews ({interviews.length})
            </button>
          )}
        </div>

        {/* 3 Pillars Showcase */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 44,
          }}
        >
          <div
            style={{
              padding: 22,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #e7e2d6",
              boxShadow: "0 2px 6px rgba(40,37,33,0.03)",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5eee2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Calendar size={18} color="#8c6e3b" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#282521", marginBottom: 6 }}>Multi-Horizon Projections</h3>
            <p style={{ fontSize: 13, color: "#6f685d", lineHeight: 1.5 }}>
              Choose whether to converse with yourself 6 months, 1 year, 3 years, 5 years, or 10 years into the future based on your specific life goals.
            </p>
          </div>

          <div
            style={{
              padding: 22,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #e7e2d6",
              boxShadow: "0 2px 6px rgba(40,37,33,0.03)",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5eee2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Mic size={18} color="#8c6e3b" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#282521", marginBottom: 6 }}>Spoken Voice Conversation</h3>
            <p style={{ fontSize: 13, color: "#6f685d", lineHeight: 1.5 }}>
              Hear your future self speak aloud in real time. Control speech rate, pause, interrupt, and listen to spoken decision guidance.
            </p>
          </div>

          <div
            style={{
              padding: 22,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #e7e2d6",
              boxShadow: "0 2px 6px rgba(40,37,33,0.03)",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5eee2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Target size={18} color="#8c6e3b" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#282521", marginBottom: 6 }}>Actionable Decision Synthesis</h3>
            <p style={{ fontSize: 13, color: "#6f685d", lineHeight: 1.5 }}>
              Conclude the interview with a concise breakdown of potential benefits, risks, trade-offs, and immediate next steps.
            </p>
          </div>
        </div>

        {/* Recent Interviews Quick List */}
        {interviews.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#2e2b26" }}>Recent Future Self Sessions</h2>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#8c6e3b", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                onClick={() => setView("history")}
              >
                View all &rarr;
              </button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {interviews.slice(0, 3).map((interview) => (
                <div
                  key={interview.id}
                  onClick={() => handleSelectInterview(interview)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 10,
                    background: "#ffffff",
                    border: "1px solid #e4dfd4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c4bcae")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e4dfd4")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5eee2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bot size={16} color="#8c6e3b" />
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: "#2b2823", display: "block" }}>{interview.title}</strong>
                      <span style={{ fontSize: 11, color: "#827a6e" }}>
                        Started {interview.startedAt ? new Date(interview.startedAt).toLocaleDateString() : "Recently"} &bull; Status: {interview.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        background: interview.status === "completed" ? "#edf5ea" : "#fbf6ec",
                        color: interview.status === "completed" ? "#436c3e" : "#8c6e3b",
                      }}
                    >
                      {interview.status}
                    </span>
                    <ChevronRight size={16} color="#9a9284" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // RENDER: PREVIOUS INTERVIEWS HISTORY
  // =========================================================================
  if (view === "history") {
    return (
      <div className="dashboard-content-pad" style={{ maxWidth: 880, margin: "0 auto", paddingBottom: 64 }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className="action-btn-outline"
            style={{ padding: "6px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
            onClick={() => setView("landing")}
          >
            <ArrowLeft size={13} /> Back
          </button>
          <span style={{ fontSize: 12, color: "#777" }}>/ Previous Interviews</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#282521", marginBottom: 8 }}>Interview Archive</h1>
        <p style={{ fontSize: 13, color: "#6f685d", marginBottom: 28 }}>
          Review past conversations with your hypothetical future selves, inspect synthesized decisions, and revisit reflection notes.
        </p>

        {interviews.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid #e4ded2" }}>
            <Compass size={32} color="#b4a997" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, color: "#312d26", marginBottom: 6 }}>No interviews conducted yet</h3>
            <p style={{ fontSize: 13, color: "#776f63", marginBottom: 18 }}>Create your first future self profile to start a conversation.</p>
            <button
              type="button"
              className="action-btn"
              style={{ background: "#24201c", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13 }}
              onClick={() => {
                setWizardStep(1)
                setView("wizard")
              }}
            >
              Start Interview Wizard
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {interviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => handleSelectInterview(interview)}
                style={{
                  padding: "18px 22px",
                  borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid #e4ded2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 15, color: "#2e2b26" }}>{interview.title}</strong>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        background: interview.status === "completed" ? "#edf5ea" : "#fbf6ec",
                        color: interview.status === "completed" ? "#436c3e" : "#8c6e3b",
                      }}
                    >
                      {interview.status}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#776f63" }}>
                    Last active: {interview.lastMessageAt ? new Date(interview.lastMessageAt).toLocaleString() : "Recently"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#a83232", cursor: "pointer", padding: 6 }}
                    title="Delete session"
                    onClick={(e) => handleDeleteInterview(interview.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} color="#8c8577" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // RENDER: MULTI-STEP CREATION WIZARD (STEPS 1-6)
  // =========================================================================
  if (view === "wizard") {
    return (
      <div className="dashboard-content-pad" style={{ maxWidth: 840, margin: "0 auto", paddingBottom: 64 }}>
        {/* Navigation & Progress Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            type="button"
            className="action-btn-outline"
            style={{ padding: "6px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
            onClick={() => {
              if (wizardStep > 1) setWizardStep((s) => s - 1)
              else setView("landing")
            }}
          >
            <ArrowLeft size={13} /> {wizardStep === 1 ? "Cancel" : "Back"}
          </button>
          <span style={{ fontSize: 12, color: "#8c6e3b", fontWeight: 600 }}>
            Step {wizardStep} of 6
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: 4, background: "#ece7de", borderRadius: 2, marginBottom: 32 }}>
          <div
            style={{
              width: `${(wizardStep / 6) * 100}%`,
              height: "100%",
              background: "#8c6e3b",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #e5dfd4", padding: 32, boxShadow: "0 2px 10px rgba(40,37,33,0.03)" }}>
          {/* STEP 1: TIME HORIZON */}
          {wizardStep === 1 && (
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>STEP 1 &bull; TIME HORIZON</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#282521", marginBottom: 8 }}>
                Choose your future horizon
              </h2>
              <p style={{ fontSize: 13, color: "#6f685d", marginBottom: 24 }}>
                How far into the future would you like to travel for this conversation?
              </p>

              <div style={{ display: "grid", gap: 12 }}>
                {TIME_HORIZONS.map((h) => {
                  const isSelected = formData.timeHorizon === h.value
                  return (
                    <div
                      key={h.value}
                      onClick={() => setFormData({ ...formData, timeHorizon: h.value })}
                      style={{
                        padding: "16px 20px",
                        borderRadius: 10,
                        border: isSelected ? "2px solid #8c6e3b" : "1px solid #e4ded2",
                        background: isSelected ? "#fbf8f2" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 15, color: "#2e2b26", display: "block" }}>{h.label}</strong>
                        <span style={{ fontSize: 12, color: "#776f63" }}>{h.desc}</span>
                      </div>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: isSelected ? "5px solid #8c6e3b" : "2px solid #ccc",
                          background: "#fff",
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: LIFE AREAS */}
          {wizardStep === 2 && (
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>STEP 2 &bull; FOCUS AREAS</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#282521", marginBottom: 8 }}>
                Select relevant life areas
              </h2>
              <p style={{ fontSize: 13, color: "#6f685d", marginBottom: 24 }}>
                Choose the domains that this future self journey will focus on (select one or more).
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {LIFE_AREAS.map((area) => {
                  const isSelected = formData.lifeAreas.includes(area)
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleLifeArea(area)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 500,
                        border: isSelected ? "1.5px solid #8c6e3b" : "1px solid #ded8cc",
                        background: isSelected ? "#fbf8f2" : "#ffffff",
                        color: isSelected ? "#8c6e3b" : "#443f38",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      {area}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CURRENT SITUATION */}
          {wizardStep === 3 && (
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>STEP 3 &bull; YOUR STARTING POINT</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#282521", marginBottom: 8 }}>
                Where are you right now?
              </h2>
              <p style={{ fontSize: 13, color: "#6f685d", marginBottom: 24 }}>
                Ground the conversation in your current reality so your future self remembers where you began.
              </p>

              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#36322b", display: "block", marginBottom: 6 }}>
                    Current Situation <span style={{ color: "#a83232" }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="auth-input"
                    placeholder="e.g. Working as a junior software engineer, feeling stuck in routine with low energy..."
                    value={formData.currentSituation}
                    onChange={(e) => setFormData({ ...formData, currentSituation: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 12,
                      fontSize: 13,
                      borderColor:
                        formData.currentSituation.trim().length > 0 &&
                        !isValidMeaningfulStatement(formData.currentSituation)
                          ? "#dc2626"
                          : undefined,
                    }}
                  />
                  {formData.currentSituation.trim().length > 0 &&
                    !isValidMeaningfulStatement(formData.currentSituation) && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#dc2626",
                          marginTop: 6,
                          display: "block",
                          fontWeight: 500,
                        }}
                      >
                        not a valid statement
                      </span>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FUTURE GOALS */}
          {wizardStep === 4 && (
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>STEP 4 &bull; YOUR TARGET HORIZON</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#282521", marginBottom: 8 }}>
                What do you want to achieve?
              </h2>
              <p style={{ fontSize: 13, color: "#6f685d", marginBottom: 24 }}>
                Describe what success and personal transformation look like across this time horizon.
              </p>

              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#36322b", display: "block", marginBottom: 6 }}>
                    Primary Future Goals <span style={{ color: "#a83232" }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="auth-input"
                    placeholder="e.g. Build and launch a profitable side product, achieve financial independence, and run a half-marathon..."
                    value={formData.futureGoals}
                    onChange={(e) => setFormData({ ...formData, futureGoals: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 12,
                      fontSize: 13,
                      borderColor:
                        formData.futureGoals.trim().length > 0 &&
                        !isValidMeaningfulStatement(formData.futureGoals)
                          ? "#dc2626"
                          : undefined,
                    }}
                  />
                  {formData.futureGoals.trim().length > 0 &&
                    !isValidMeaningfulStatement(formData.futureGoals) && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#dc2626",
                          marginTop: 6,
                          display: "block",
                          fontWeight: 500,
                        }}
                      >
                        not a valid statement
                      </span>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AVAILABLE RESOURCES */}
          {wizardStep === 5 && (
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>STEP 5 &bull; RESOURCES & COMMITMENT</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#282521", marginBottom: 8 }}>
                What resources do you have available?
              </h2>
              <p style={{ fontSize: 13, color: "#6f685d", marginBottom: 24 }}>
                Keep your hypothetical future grounded in realistic constraints and daily hours.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#36322b", display: "block", marginBottom: 6 }}>
                    Available Time Per Day <span style={{ color: "#a83232" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. 1-2 hours per day, weekends open"
                    value={formData.availableTime}
                    onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 10,
                      fontSize: 13,
                      borderColor:
                        formData.availableTime.trim().length > 0 &&
                        !isValidMeaningfulStatement(formData.availableTime)
                          ? "#dc2626"
                          : undefined,
                    }}
                  />
                  {formData.availableTime.trim().length > 0 &&
                    !isValidMeaningfulStatement(formData.availableTime) && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#dc2626",
                          marginTop: 6,
                          display: "block",
                          fontWeight: 500,
                        }}
                      >
                        not a valid statement
                      </span>
                    )}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#36322b", display: "block", marginBottom: 6 }}>
                    Monthly Budget (Optional)
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. $100 - $300 for courses and tools"
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                    style={{ width: "100%", padding: 10, fontSize: 13 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SUMMARY & GENERATE */}
          {wizardStep === 6 && (
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>STEP 6 &bull; REVIEW & SYNTHESIS</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#282521", marginBottom: 8 }}>
                Ready to synthesize your future self
              </h2>
              <p style={{ fontSize: 13, color: "#6f685d", marginBottom: 24 }}>
                Review your parameters before we generate the hypothetical persona and interview session.
              </p>

              <div style={{ background: "#fbf9f5", padding: 20, borderRadius: 10, border: "1px solid #ebd9be", marginBottom: 24, fontSize: 13, lineHeight: 1.6 }}>
                <p><strong>Horizon:</strong> {formData.timeHorizon}</p>
                <p><strong>Focus Areas:</strong> {formData.lifeAreas.join(", ")}</p>
                <p><strong>Current Situation:</strong> {formData.currentSituation}</p>
                <p><strong>Future Goals:</strong> {formData.futureGoals}</p>
                <p><strong>Daily Commitment:</strong> {formData.availableTime}</p>
                {formData.monthlyBudget && <p><strong>Monthly Budget:</strong> {formData.monthlyBudget}</p>}
              </div>

              {generatingProfile ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div className="waveform-container" style={{ justifyContent: "center", marginBottom: 16 }}>
                    <div className="waveform-bar active" style={{ height: 24, width: 4 }} />
                    <div className="waveform-bar active" style={{ height: 28, width: 4 }} />
                    <div className="waveform-bar active" style={{ height: 32, width: 4 }} />
                    <div className="waveform-bar active" style={{ height: 26, width: 4 }} />
                    <div className="waveform-bar active" style={{ height: 20, width: 4 }} />
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#2c2822", marginBottom: 4 }}>
                    Synthesizing Future Self Projection...
                  </h4>
                  <span style={{ fontSize: 12, color: "#776f63" }}>
                    Analyzing compounding habits, constraints, and trajectory for {formData.timeHorizon}...
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="action-btn"
                  style={{
                    width: "100%",
                    background: "#24201c",
                    color: "#fcfbf9",
                    padding: "14px",
                    fontSize: 15,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                  onClick={handleGenerateProfile}
                >
                  <Sparkles size={16} />
                  Generate My Future Self & Start Interview
                </button>
              )}
            </div>
          )}

          {/* Wizard Next Button */}
          {wizardStep < 6 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28, paddingTop: 18, borderTop: "1px solid #eee8de" }}>
              <button
                type="button"
                className="action-btn"
                style={{
                  background: "#24201c",
                  color: "#fcfbf9",
                  padding: "10px 20px",
                  fontSize: 13,
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (wizardStep === 1 && !formData.timeHorizon) {
                    toast.error("Please choose a time horizon.")
                    return
                  }
                  if (wizardStep === 2 && formData.lifeAreas.length === 0) {
                    toast.error("Please select at least one life area.")
                    return
                  }
                  if (wizardStep === 3) {
                    if (!formData.currentSituation.trim()) {
                      toast.error("Please describe your current situation.")
                      return
                    }
                    if (!isValidMeaningfulStatement(formData.currentSituation)) {
                      toast.error("not a valid statement. Please enter a meaningful description.")
                      return
                    }
                  }
                  if (wizardStep === 4) {
                    if (!formData.futureGoals.trim()) {
                      toast.error("Please specify your future goals.")
                      return
                    }
                    if (!isValidMeaningfulStatement(formData.futureGoals)) {
                      toast.error("not a valid statement. Please describe your future goals in meaningful words.")
                      return
                    }
                  }
                  if (wizardStep === 5) {
                    if (!formData.availableTime.trim()) {
                      toast.error("Please state your available time per day.")
                      return
                    }
                    if (formData.availableTime.trim().length < 2 || !isValidMeaningfulStatement(formData.availableTime)) {
                      toast.error("not a valid statement. Please provide a realistic time commitment (e.g. 1-2 hours per day).")
                      return
                    }
                  }
                  setWizardStep((s) => s + 1)
                }}
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // =========================================================================
  // RENDER: CONVERSATIONAL INTERVIEW INTERFACE (CHAT + VOICE)
  // =========================================================================
  return (
    <div style={{ display: "flex", height: "calc(100vh - 72px)", overflow: "hidden", background: "#f8f6f0" }}>
      {/* LEFT PANEL: PROFILE DETAILS & SESSIONS */}
      <div
        style={{
          width: leftPanelOpen ? 340 : 0,
          opacity: leftPanelOpen ? 1 : 0,
          overflowY: "auto",
          transition: "all 0.25s ease",
          background: "#ffffff",
          borderRight: "1px solid #e5dfd4",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee8de", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span className="eyebrow" style={{ fontSize: 10 }}>PROJECTED SELF</span>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#282521", margin: 0 }}>
              {selectedProfile?.timeHorizon || "1 Year"} Perspective
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setLeftPanelOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8c8475" }}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Profile Attributes */}
        <div style={{ padding: 18, borderBottom: "1px solid #eee8de" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {selectedProfile?.lifeAreas.map((a) => (
              <span key={a} style={{ fontSize: 10, background: "#f5eee2", color: "#8c6e3b", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                {a}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#6f685d", lineHeight: 1.5, background: "#faf8f4", padding: 12, borderRadius: 8, border: "1px solid #ebe4d8" }}>
            <strong style={{ color: "#312d26", display: "block", marginBottom: 4 }}>Hypothetical Lifestyle:</strong>
            {selectedProfile?.generatedProfile?.futureLifestyle || "Structured progression with compound daily habits."}
          </div>
        </div>

        {/* Key Turning Points & Advice */}
        <div style={{ padding: 18, borderBottom: "1px solid #eee8de", flex: 1, overflowY: "auto" }}>
          <strong style={{ fontSize: 11, color: "#312d26", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
            Key Turning Points
          </strong>
          <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: "#6f685d", lineHeight: 1.5, marginBottom: 16 }}>
            {selectedProfile?.generatedProfile?.turningPoints.slice(0, 3).map((pt, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>{pt}</li>
            ))}
          </ul>

          <strong style={{ fontSize: 11, color: "#312d26", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
            Core Lessons
          </strong>
          <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: "#6f685d", lineHeight: 1.5 }}>
            {selectedProfile?.generatedProfile?.lessons.slice(0, 3).map((ls, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>{ls}</li>
            ))}
          </ul>
        </div>

        {/* Action: Complete Decision */}
        <div style={{ padding: 16, background: "#fdfbf7", borderTop: "1px solid #eee8de" }}>
          <button
            type="button"
            className="action-btn"
            style={{
              width: "100%",
              background: "#24201c",
              color: "#fff",
              padding: "10px",
              fontSize: 12,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
            }}
            onClick={handleCompleteInterview}
            disabled={completingDecision}
          >
            <Sparkles size={14} />
            {completingDecision ? "Synthesizing Summary..." : "Complete & Synthesize Decision"}
          </button>
        </div>
      </div>

      {/* MAIN PANEL: CHAT & VOICE INTERFACE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
        {/* Top Header / Voice Controls Bar */}
        <div
          style={{
            padding: "12px 24px",
            background: "#ffffff",
            borderBottom: "1px solid #e5dfd4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!leftPanelOpen && (
              <button
                type="button"
                onClick={() => setLeftPanelOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8c8475" }}
                title="Open Profile Panel"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 15, color: "#282521" }}>
                  {activeInterview?.title || "Future Self Conversation"}
                </strong>
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background: activeInterview?.status === "completed" ? "#edf5ea" : "#fbf6ec",
                    color: activeInterview?.status === "completed" ? "#436c3e" : "#8c6e3b",
                  }}
                >
                  {activeInterview?.status || "active"}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "#827a6e" }}>
                AI-Driven Roleplay &bull; Speaks in your future voice
              </span>
            </div>
          </div>

          {/* Voice Controls Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#faf8f4",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #ebd9be",
            }}
          >
            {/* Waveform indicator */}
            <div className="waveform-container" title={isSpeaking ? "Speaking aloud" : "Audio ready"}>
              <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
              <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
              <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
              <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
              <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
            </div>

            {/* Play/Pause/Stop Buttons */}
            {isSpeaking && !isPaused && (
              <button
                type="button"
                onClick={pauseSpeech}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                title="Pause Speech"
              >
                <Pause size={15} color="#8c6e3b" />
              </button>
            )}

            {isSpeaking && isPaused && (
              <button
                type="button"
                onClick={resumeSpeech}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                title="Resume Speech"
              >
                <Play size={15} color="#8c6e3b" />
              </button>
            )}

            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeech}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                title="Stop Speaking"
              >
                <Square size={13} color="#a83232" />
              </button>
            )}

            {/* Mute/Unmute toggle */}
            <button
              type="button"
              onClick={() => {
                if (!isMuted && isSpeaking) stopSpeech()
                setIsMuted(!isMuted)
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isMuted ? <VolumeX size={15} color="#999" /> : <Volume2 size={15} color="#8c6e3b" />}
            </button>

            {/* Speed Selector */}
            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              style={{
                fontSize: 11,
                border: "1px solid #d5cfc4",
                borderRadius: 4,
                padding: "2px 4px",
                background: "#ffffff",
                color: "#443f38",
              }}
              title="Speech Speed"
            >
              <option value="0.85">0.85x</option>
              <option value="1.0">1.0x</option>
              <option value="1.15">1.15x</option>
            </select>

            {/* Voice Dropdown */}
            {voices.length > 0 && (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{
                  fontSize: 11,
                  border: "1px solid #d5cfc4",
                  borderRadius: 4,
                  padding: "2px 6px",
                  background: "#ffffff",
                  color: "#443f38",
                  maxWidth: 130,
                }}
                title="Select Voice"
              >
                {voices.slice(0, 10).map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name.slice(0, 16)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Message Transcript Container */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === "user"
            const isLastAssistant = !isUser && index === messages.length - 1

            return (
              <div
                key={msg.id || index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                  maxWidth: 780,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isUser ? "#6f685d" : "#8c6e3b" }}>
                    {isUser ? (user?.name?.split(" ")[0] || "You") : "Future Self"}
                  </span>
                  <span style={{ fontSize: 10, color: "#a59d90" }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>

                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    background: isUser ? "#24201c" : "#ffffff",
                    color: isUser ? "#ffffff" : "#282521",
                    border: isUser ? "none" : "1px solid #e5dfd4",
                    boxShadow: "0 1px 4px rgba(40,37,33,0.04)",
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>

                {/* Assistant Controls: Listen / Replay */}
                {!isUser && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => speakText(msg.content)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 11,
                        color: "#8c6e3b",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      <Volume2 size={12} /> Listen
                    </button>
                  </div>
                )}

                {/* Suggested Questions below the latest assistant response */}
                {isLastAssistant && msg.metadata?.suggestedQuestions && msg.metadata.suggestedQuestions.length > 0 && (
                  <div style={{ marginTop: 14, width: "100%" }}>
                    <span style={{ fontSize: 11, color: "#776f63", fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Suggested questions to ask:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {msg.metadata.suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          disabled={sendingMessage}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 11.5,
                            background: "#faf7f2",
                            border: "1px solid #ebd9be",
                            color: "#8c6e3b",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f4ece0")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#faf7f2")}
                        >
                          &ldquo;{q}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {sendingMessage && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fff", borderRadius: 8, border: "1px solid #e5dfd4" }}>
              <div className="waveform-container">
                <div className="waveform-bar active" />
                <div className="waveform-bar active" />
                <div className="waveform-bar active" />
              </div>
              <span style={{ fontSize: 12, color: "#8c6e3b" }}>Future self is contemplating and answering...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Input Area */}
        <div style={{ padding: "14px 24px", background: "#ffffff", borderTop: "1px solid #e5dfd4" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                placeholder="Ask your future self anything... (e.g., 'What was our hardest obstacle?', 'What should I start doing today?')"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sendingMessage}
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "1px solid #dcd6c9",
                  fontSize: 13.5,
                  background: "#faf9f6",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || sendingMessage}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: inputMessage.trim() ? "#24201c" : "#e5dfd4",
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: inputMessage.trim() ? "pointer" : "not-allowed",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* =========================================================================
          DECISION SUMMARY & SPOKEN GUIDANCE MODAL
         ========================================================================= */}
      {showSummaryModal && activeInterview?.decisionSummary && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30, 26, 22, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: 14,
              border: "1px solid #ebd9be",
              padding: 28,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ color: "#8c6e3b" }}>STRATEGIC SYNTHESIS</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#282521", margin: 0 }}>
                  Decision Summary &amp; Spoken Guidance
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Audio Spoken Guidance Player */}
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 10,
                background: "#fbf8f2",
                border: "1px solid #ebd9be",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                  type="button"
                  onClick={() => speakText(activeInterview.decisionSummary?.spokenText || "")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#8c6e3b",
                    color: "#ffffff",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Play Spoken Guidance"
                >
                  <Play size={18} style={{ marginLeft: 2 }} />
                </button>
                <div>
                  <strong style={{ fontSize: 13, color: "#2b2823", display: "block" }}>Spoken Guidance Audio</strong>
                  <span style={{ fontSize: 11, color: "#7a7265" }}>Click to hear your future self read this executive advice</span>
                </div>
              </div>
              <div className="waveform-container">
                <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
                <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
                <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
                <div className={`waveform-bar ${isSpeaking ? "active" : ""}`} />
              </div>
            </div>

            {/* Executive Summary */}
            <div style={{ fontSize: 13.5, color: "#443e37", lineHeight: 1.6, marginBottom: 22, background: "#faf8f4", padding: 16, borderRadius: 8 }}>
              {activeInterview.decisionSummary.fullSummary}
            </div>

            {/* Benefits & Risks Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 14, borderRadius: 8, background: "#f2f7f0", border: "1px solid #d9e8d4" }}>
                <strong style={{ fontSize: 12, color: "#365e31", display: "block", marginBottom: 6 }}>
                  Key Potential Benefits
                </strong>
                <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: "#445e40", lineHeight: 1.5 }}>
                  {activeInterview.decisionSummary.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: "#fdf4f0", border: "1px solid #f2dbd3" }}>
                <strong style={{ fontSize: 12, color: "#8a3c26", display: "block", marginBottom: 6 }}>
                  Potential Risks &amp; Obstacles
                </strong>
                <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: "#774233", lineHeight: 1.5 }}>
                  {activeInterview.decisionSummary.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trade-offs & Next Steps */}
            <div style={{ marginBottom: 24 }}>
              <strong style={{ fontSize: 12, color: "#312d26", display: "block", marginBottom: 6 }}>
                Immediate Next Steps
              </strong>
              <div style={{ display: "grid", gap: 6 }}>
                {activeInterview.decisionSummary.nextSteps.map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#554e45" }}>
                    <CheckCircle2 size={14} color="#8c6e3b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Reflection Section */}
            <div style={{ borderTop: "1px solid #eee8de", paddingTop: 18 }}>
              <strong style={{ fontSize: 12, color: "#312d26", display: "block", marginBottom: 6 }}>
                Your Personal Reflection
              </strong>
              <textarea
                rows={3}
                placeholder="Write your personal reflections or realizations from this interview..."
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 12.5,
                  borderRadius: 6,
                  border: "1px solid #dcd6c9",
                  outline: "none",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="action-btn"
                  style={{
                    background: "#24201c",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                  onClick={handleSaveReflection}
                  disabled={savingReflection}
                >
                  {savingReflection ? "Saving..." : "Save Reflection to Workspace"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
