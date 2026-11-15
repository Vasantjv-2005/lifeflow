"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles,
  GitBranch,
  BrainCircuit,
  CheckCircle2,
  ArrowRight,
  Lock,
  Share2,
  ExternalLink,
  ShieldCheck,
  Layers,
  TrendingUp,
  Database,
  Activity,
  Check,
  RotateCcw,
  Sliders,
  FileText,
  ChevronRight,
  Compass,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useAuthStore } from "@/lib/use-auth-store"
import { toast } from "sonner"

type ScenarioType = "optimistic" | "realistic" | "pessimistic"

export function LandingPage() {
  const { user, fetchUser, isInitialized, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("optimistic")
  const [activeTab, setActiveTab] = useState<"roadmap" | "canvas">("roadmap")
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light")

  useEffect(() => {
    setMounted(true)
    fetchUser().catch(() => { })
  }, [fetchUser])

  const scenarioData = {
    optimistic: {
      name: "Rapid Mastery & Promotion",
      badge: "OPTIMISTIC PROJECTION",
      risk: "Low Risk",
      clarity: "88%",
      delta: "+14 pts",
      timeline: "10-12 Months",
      target: "Senior Full-Stack AI Engineer",
      steps: [
        {
          num: "01",
          title: "Complete Core AI & LLM Systems",
          desc: "Master modern embedding models, vector retrieval, and prompt architecture alongside enterprise React.",
          time: "Months 1-3",
        },
        {
          num: "02",
          title: "Ship Production Open-Source Showcase",
          desc: "Build and deploy an autonomous AI agent workflow application with live cloud telemetry.",
          time: "Months 4-6",
        },
        {
          num: "03",
          title: "Lead Internal AI Architecture Initiatives",
          desc: "Present high-throughput pipelines to engineering leads, securing executive mentorship.",
          time: "Months 7-9",
        },
        {
          num: "04",
          title: "Negotiate Senior AI Role",
          desc: "Leverage measurable project impact and verified portfolio to step into senior compensation tier.",
          time: "Months 10-12",
        },
      ],
      nodes: [
        { title: "Current Baseline", subtitle: "Full Stack Engineer", tag: "Active", active: false },
        { title: "Fast-Track LLM Specialization", subtitle: "Production Vector & RAG", tag: "Completed", active: false },
        { title: "Portfolio Cloud Deployment", subtitle: "10k+ Monthly Events", tag: "In Progress", active: true },
        { title: "Senior AI Engineer ($180k+)", subtitle: "Executive Alignment", tag: "88% Confidence", active: false },
      ],
    },
    realistic: {
      name: "Steady Skill Growth & Transition",
      badge: "REALISTIC FORECAST",
      risk: "Medium Risk",
      clarity: "74%",
      delta: "+8 pts",
      timeline: "16-20 Months",
      target: "Mid-to-Senior AI Developer",
      steps: [
        {
          num: "01",
          title: "Structured Machine Learning Foundations",
          desc: "Complete enterprise coursework on transformer pipelines, fine-tuning, and model evaluations.",
          time: "Months 1-5",
        },
        {
          num: "02",
          title: "Incremental Work Projects",
          desc: "Integrate LLM features into existing company tools, gaining real-world performance tuning data.",
          time: "Months 6-12",
        },
        {
          num: "03",
          title: "Technical Writing & Peer Networking",
          desc: "Publish architectural teardowns and build relationships with senior AI hiring managers.",
          time: "Months 13-16",
        },
        {
          num: "04",
          title: "Strategic Role Transition",
          desc: "Transition smoothly into a dedicated AI team with validated production experience.",
          time: "Months 17-20",
        },
      ],
      nodes: [
        { title: "Current Baseline", subtitle: "Full Stack Engineer", tag: "Active", active: false },
        { title: "Core ML Foundations", subtitle: "Coursework & Practice", tag: "Completed", active: false },
        { title: "Company AI Feature Integration", subtitle: "Hands-on Experience", tag: "In Progress", active: true },
        { title: "Full-Stack AI Developer", subtitle: "Steady Career Shift", tag: "74% Confidence", active: false },
      ],
    },
    pessimistic: {
      name: "Skill Gaps & Pivot Resistance",
      badge: "CONSERVATIVE ASSESSMENT",
      risk: "High Risk",
      clarity: "46%",
      delta: "-12 pts",
      timeline: "24+ Months",
      target: "Lateral Transition with Skill Buffer",
      steps: [
        {
          num: "01",
          title: "Self-Directed Study with Bottlenecks",
          desc: "Navigate rapidly changing model frameworks independently without established mentorship.",
          time: "Months 1-6",
        },
        {
          num: "02",
          title: "Prototype Stalls & Technical Debt",
          desc: "Local prototypes face integration friction and latency hurdles without production infrastructure.",
          time: "Months 7-14",
        },
        {
          num: "03",
          title: "Market Competition & Role Tightening",
          desc: "Market shifts toward specialized PhD backgrounds, increasing competition for entry-level AI roles.",
          time: "Months 15-20",
        },
        {
          num: "04",
          title: "Pivot to AI-Enhanced Full Stack",
          desc: "Pivot strategy to champion AI tooling in current domain rather than pure-play AI research.",
          time: "Months 21+",
        },
      ],
      nodes: [
        { title: "Current Baseline", subtitle: "Full Stack Engineer", tag: "Active", active: false },
        { title: "Self-Paced Fragmented Study", subtitle: "Unstructured Learning", tag: "Risk Point", active: false },
        { title: "Technical Friction & Stalls", subtitle: "Need Production Support", tag: "In Progress", active: true },
        { title: "AI-Enhanced Full-Stack Role", subtitle: "Safer Downside Hedge", tag: "46% Confidence", active: false },
      ],
    },
  }

  const current = scenarioData[activeScenario]

  return (
    <div className="home-page">
      <div className="home-glow-top" />
      <div className="home-glow-bottom" />

      {/* TOP NAVIGATION */}
      <header className="home-nav-container">
        <div className="home-nav">
          <Link href="/" className="home-nav-brand">
            <img
              src="/logo.png"
              alt="LifeFlow Logo"
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
            />
            <span>life</span>flow
          </Link>

          <nav className="home-nav-links">
            <a href="#showcase" className="home-nav-link">Interactive Showcase</a>
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#how-it-works" className="home-nav-link">How It Works</a>
            <Link href="/simulations" className="home-nav-link">Simulation Canvas</Link>
            <Link href="/ai-studio" className="home-nav-link">AI Studio</Link>
          </nav>

          <div className="home-nav-actions" suppressHydrationWarning>
            {mounted && isInitialized && user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/dashboard" className="home-btn-primary">
                  Go to Workspace ({user.name?.split(" ")[0] || "User"})
                  <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                    toast.success("Logged out successfully.")
                  }}
                  className="home-btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "12px", cursor: "pointer" }}
                  title="Sign out of LifeFlow"
                >
                  Sign out
                </button>
              </div>
            ) : mounted && isInitialized && !user ? (
              <>
                <Link href="/login" className="home-btn-secondary">
                  Sign in
                </Link>
                <Link href="/register" className="home-btn-primary">
                  Launch Free
                  <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <div style={{ minWidth: 150 }} />
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="home-badge">
          <Sparkles size={14} />
          <span>NEXT-GENERATION LIFE SIMULATION & DECISION ENGINE</span>
        </div>

        <h1>
          Stop Overthinking. <span>Simulate Life&apos;s Crossroads</span> Before You Leap.
        </h1>

        <p className="home-hero-subtitle">
          Map career shifts, relocations, and big life bets with visual branching simulation trees,
          multi-scenario AI forecasting, and real-time MongoDB database persistence.
        </p>

        <div className="home-hero-ctas">
          <Link href="/dashboard" className="home-btn-primary home-btn-hero">
            Open Your Workspace Free
            <ArrowRight size={16} />
          </Link>
          <a href="#showcase" className="home-btn-secondary home-btn-hero">
            Explore Interactive Demo
          </a>
        </div>

        {/* STATS STRIP */}
        <div className="home-stats-strip">
          <div className="home-stat-item">
            <span className="home-stat-val">10,000+</span>
            <span className="home-stat-lbl">Decisions Simulated</span>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div className="home-stat-item">
            <span className="home-stat-val">3-Way</span>
            <span className="home-stat-lbl">AI Scenario Models</span>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div className="home-stat-item">
            <span className="home-stat-val">100%</span>
            <span className="home-stat-lbl">MongoDB Compass Synced</span>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div className="home-stat-item">
            <span className="home-stat-val">88%</span>
            <span className="home-stat-lbl">Avg. Clarity Increase</span>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION: LAPTOP / BROWSER INTERFACE MOCKUP (Hiremast Style) */}
      <section id="showcase" className="showcase-container">
        <div className="browser-mockup">
          {/* BROWSER TITLEBAR */}
          <div className="browser-titlebar">
            <div className="browser-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>

            <div className="browser-tab-pill">
              <img src="/logo.png" alt="LifeFlow Logo" className="browser-tab-logo" />
              <span className="browser-tab-name">LifeFlow — Decision Studio</span>
            </div>

            <div className="browser-url-bar">
              <Lock size={12} />
              <span>lifeflow.app</span>/workspace/decisions/career-pivot-ai
            </div>

            <div className="browser-title-actions">
              <Share2 size={13} />
              <ExternalLink size={13} />
            </div>
          </div>

          {/* BROWSER APP BODY */}
          <div className="browser-body">
            {/* LEFT MOCKUP SIDEBAR */}
            <aside className="mockup-sidebar">
              <div className="mockup-brand">
                <img
                  src="/logo.png"
                  alt="LifeFlow Logo"
                  style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }}
                />
                <span>lifeflow</span>
              </div>

              <div className="mockup-nav">
                <div className="mockup-nav-item">
                  <Compass size={14} />
                  <span>Overview</span>
                </div>
                <div className="mockup-nav-item active">
                  <Layers size={14} />
                  <span>My decisions</span>
                  <span className="mockup-nav-badge">3</span>
                </div>
                <div className="mockup-nav-item">
                  <GitBranch size={14} />
                  <span>Simulations</span>
                </div>
                <div className="mockup-nav-item">
                  <Sparkles size={14} />
                  <span>AI studio</span>
                </div>
              </div>

              <div className="mockup-sidebar-subheading">RECENT DECISIONS</div>
              <div className="mockup-recent-list">
                <div className="mockup-recent-item" style={{ color: "#dfc3a7" }}>
                  <span>•</span> Transition to AI Eng.
                </div>
                <div className="mockup-recent-item">
                  <span>•</span> Zurich Relocation
                </div>
                <div className="mockup-recent-item">
                  <span>•</span> Seed vs Bootstrap
                </div>
              </div>

              <div className="mockup-user-bar">
                <div className="mockup-avatar" suppressHydrationWarning>
                  {mounted && user?.name ? user.name[0].toUpperCase() : "L"}
                </div>
                <div className="mockup-user-info">
                  <span className="mockup-user-name" suppressHydrationWarning>
                    {mounted && user?.name ? user.name : "Active Workspace"}
                  </span>
                  <span className="mockup-db-status">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                    MongoDB Atlas
                  </span>
                </div>
              </div>
            </aside>

            {/* MAIN APP WORKSPACE PANE */}
            <main className="mockup-main">
              {/* TOP HEADER */}
              <div className="mockup-top-header">
                <div className="mockup-breadcrumbs">
                  Workspace / Career Decisions / <strong>Transition to Full-Stack AI</strong>
                </div>
                <div className="mockup-actions-row">
                  <Link href="/simulations" className="mockup-btn-sm mockup-btn-dark">
                    <GitBranch size={12} />
                    Open Canvas
                  </Link>
                  <Link href="/dashboard" className="mockup-btn-sm mockup-btn-accent">
                    <Activity size={12} />
                    Live Workspace
                  </Link>
                </div>
              </div>

              {/* DECISION HERO BANNER (Similar to Hiremast Score Card) */}
              <div className="mockup-hero-card">
                <div className="mockup-decision-title-group">
                  <h2>Transition into Full-Stack AI Engineering</h2>
                  <div className="mockup-decision-meta">
                    <span>
                      <Activity size={12} color="#c9ab8d" /> High Leverage
                    </span>
                    <span>•</span>
                    <span>3 Branching Pathways</span>
                    <span>•</span>
                    <span>6 Month Financial Buffer</span>
                  </div>
                </div>

                {/* BIG CLARITY SCORE BLOCK */}
                <div className="mockup-score-block">
                  <div className="mockup-score-num">
                    {current.clarity}
                    <small>{current.delta}</small>
                  </div>
                  <div className="mockup-score-desc">
                    <strong>Clarity Score</strong>
                    <span>Bayesian probability model</span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE CONTROLS: SCENARIO SELECTOR */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div className="mockup-tabs">
                  <button
                    className={`mockup-tab-btn ${activeScenario === "optimistic" ? "active" : ""}`}
                    onClick={() => setActiveScenario("optimistic")}
                  >
                    Optimistic (88%)
                  </button>
                  <button
                    className={`mockup-tab-btn ${activeScenario === "realistic" ? "active" : ""}`}
                    onClick={() => setActiveScenario("realistic")}
                  >
                    Realistic (74%)
                  </button>
                  <button
                    className={`mockup-tab-btn ${activeScenario === "pessimistic" ? "active" : ""}`}
                    onClick={() => setActiveScenario("pessimistic")}
                  >
                    Conservative (46%)
                  </button>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className={`mockup-tab-btn ${activeTab === "roadmap" ? "active" : ""}`}
                    onClick={() => setActiveTab("roadmap")}
                  >
                    Milestones Roadmap
                  </button>
                  <button
                    className={`mockup-tab-btn ${activeTab === "canvas" ? "active" : ""}`}
                    onClick={() => setActiveTab("canvas")}
                  >
                    Visual Decision Tree
                  </button>
                </div>
              </div>

              {/* SPLIT SHOWCASE PANELS */}
              <div className="mockup-split-grid">
                {/* LEFT: ROADMAP & ACTIONABLE STEPS */}
                <div className="mockup-panel-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#c9ab8d" }}>
                      {current.badge}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 12,
                        background:
                          activeScenario === "optimistic"
                            ? "rgba(16, 185, 129, 0.15)"
                            : activeScenario === "realistic"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                        color:
                          activeScenario === "optimistic"
                            ? "#34d399"
                            : activeScenario === "realistic"
                              ? "#fbbf24"
                              : "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {current.risk}
                    </span>
                  </div>

                  <strong style={{ fontSize: 15, color: "#ffffff" }}>{current.name}</strong>
                  <p style={{ margin: 0, fontSize: 11, color: "#8c867c" }}>
                    Projected target: <span style={{ color: "#ded8ce" }}>{current.target}</span> • Est. Horizon: {current.timeline}
                  </p>

                  <div className="mockup-step-list">
                    {current.steps.map((step) => (
                      <div className="mockup-step-row" key={step.num}>
                        <span className="mockup-step-num">{step.num}</span>
                        <div className="mockup-step-info">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>{step.title}</strong>
                            <span style={{ fontSize: 9, color: "#c9ab8d", fontWeight: 600 }}>{step.time}</span>
                          </div>
                          <p>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: VISUAL TREE / CANVAS PREVIEW */}
                <div className="mockup-canvas-preview">
                  <div className="mockup-canvas-grid-bg" />

                  <div className="mockup-canvas-header">
                    <div className="mockup-canvas-title">
                      <GitBranch size={14} color="#c9ab8d" />
                      <span>Decision Graph Simulation</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#8c867c", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 6 }}>
                      React Flow Powered
                    </span>
                  </div>

                  <div className="mockup-canvas-tree">
                    {current.nodes.map((node, i) => (
                      <div key={node.title}>
                        <div className={`mockup-node ${node.active ? "mockup-node-active" : ""}`}>
                          <div className="mockup-node-left">
                            <div className="mockup-node-icon">
                              {i === 0 ? (
                                <Activity size={14} />
                              ) : i === current.nodes.length - 1 ? (
                                <Check size={14} />
                              ) : (
                                <GitBranch size={14} />
                              )}
                            </div>
                            <div className="mockup-node-text">
                              <strong>{node.title}</strong>
                              <span>{node.subtitle}</span>
                            </div>
                          </div>
                          <span className="mockup-node-tag">{node.tag}</span>
                        </div>
                        {i < current.nodes.length - 1 && (
                          <div className="mockup-tree-connector">
                            <span style={{ width: 2, height: 12, background: "rgba(201, 171, 141, 0.3)" }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 11, color: "#8c867c" }}>
                      Nodes & edges auto-sync with MongoDB
                    </span>
                    <Link href="/simulations" style={{ fontSize: 11, color: "#c9ab8d", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      Edit Canvas <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* CORE VALUE PILLARS */}
      <section id="features" className="home-section">
        <div className="home-section-header">
          <div className="home-badge">
            <Layers size={13} />
            <span>BUILT FOR HIGH-STAKES DECISIONS</span>
          </div>
          <h2>Everything You Need to Navigate Ambiguity with Confidence</h2>
          <p>
            Traditional pros-and-cons lists fail because they ignore compounding risk and timeframes.
            LifeFlow gives you an engineering-grade simulation environment for life.
          </p>
        </div>

        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <GitBranch size={22} />
            </div>
            <h3>Visual Branching Canvas</h3>
            <p>
              Interactive node graph powered by React Flow. Connect choices, financial buffers,
              probabilistic outcomes, and fallback safety nets.
            </p>
            <span className="home-feature-tag">
              Drag-and-drop node graph <ArrowRight size={12} />
            </span>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <Sparkles size={22} />
            </div>
            <h3>3-Way AI Scenario Engine</h3>
            <p>
              Instantly simulate Optimistic, Realistic, and Conservative futures.
              Get clear phased milestones, timeframes, and probability tags.
            </p>
            <span className="home-feature-tag">
              Structured roadmap cards <ArrowRight size={12} />
            </span>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <Database size={22} />
            </div>
            <h3>MongoDB Persistence & No Duplicates</h3>
            <p>
              Every decision, scenario, and simulation graph is normalized and saved in your personal
              MongoDB Compass cluster with complete integrity.
            </p>
            <span className="home-feature-tag">
              Full CRUD & sync <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="home-section" style={{ paddingTop: 0 }}>
        <div className="home-section-header">
          <div className="home-badge">
            <Compass size={13} />
            <span>THE 3-STEP DECISION METHODOLOGY</span>
          </div>
          <h2>From Analysis Paralysis to Total Conviction</h2>
          <p>A proven structured loop used by founders, engineers, and high-performers.</p>
        </div>

        <div className="home-steps-grid">
          <div className="home-step-card">
            <span className="home-step-number">01</span>
            <h3>Frame the Decision</h3>
            <p>
              Capture what&apos;s really at stake: core goals, critical constraints, financial runway,
              and hard emotional boundaries.
            </p>
          </div>

          <div className="home-step-card">
            <span className="home-step-number">02</span>
            <h3>Simulate Pathways</h3>
            <p>
              Branch options on the visual canvas or let the AI Decision Studio project
              realistic milestones and downside risk factors.
            </p>
          </div>

          <div className="home-step-card">
            <span className="home-step-number">03</span>
            <h3>Commit & Execute</h3>
            <p>
              Track your clarity score, execute the highest-probability phased roadmap,
              and review outcomes as circumstances unfold.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="home-cta-wrap">
        <div className="home-cta-banner">
          <h2>Ready to See Where Your Next Choice Leads?</h2>
          <p>
            Join thousands of professionals modeling career leaps, relocations, and ventures with total clarity.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="home-btn-primary home-btn-hero">
              Launch LifeFlow Workspace
              <ArrowRight size={16} />
            </Link>
            <Link href="/signup" className="home-btn-secondary home-btn-hero">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* MODERN FLOATING FOOTER CARD */}
      <footer className="showcase-footer-wrap">
        <div className="showcase-footer-card">
          {/* Upper Section */}
          <div className="footer-top-grid">
            {/* Left Brand Column */}
            <div className="footer-brand-col">
              <div className="footer-brand-header">
                <img
                  src="/logo.png"
                  alt="LifeFlow Logo"
                  style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }}
                />
                <span className="footer-brand-name">LifeFlow</span>
              </div>
              <p className="footer-brand-desc">
                One decision. Every outcome. Built to simulate your life before you leap.
              </p>
              <a href="mailto:support@lifeflow.ai" className="footer-email-link">
                support@lifeflow.ai
              </a>
              <div className="footer-social-row">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-btn"
                  aria-label="LinkedIn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-btn"
                  aria-label="Instagram"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-btn"
                  aria-label="X (Twitter)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Nav Links Columns */}
            <div className="footer-nav-grid">
              <div className="footer-nav-col">
                <h4>PRODUCT</h4>
                <a href="#how-it-works" className="footer-nav-link">How it works</a>
                <a href="#showcase" className="footer-nav-link">Interactive Showcase</a>
                <Link href="/simulations" className="footer-nav-link">Simulation Canvas</Link>
                <Link href="/ai-studio" className="footer-nav-link">AI Decision Studio</Link>
                <a href="#faq" className="footer-nav-link">FAQ</a>
              </div>

              <div className="footer-nav-col">
                <h4>RESOURCES</h4>
                <Link href="/decisions" className="footer-nav-link">Free Clarity Check</Link>
                <Link href="/simulations" className="footer-nav-link">Roadmap Guides</Link>
                <Link href="/simulations" className="footer-nav-link">Playbook & Courses</Link>
                <a href="https://www.mongodb.com/docs" target="_blank" rel="noreferrer" className="footer-nav-link">
                  Documentation
                </a>
              </div>

              <div className="footer-nav-col">
                <h4>COMPANY</h4>
                <Link href="/dashboard" className="footer-nav-link">Founder&apos;s note</Link>
                <Link href="/dashboard" className="footer-nav-link">About LifeFlow</Link>
                <Link href="/settings" className="footer-nav-link">Your data & MongoDB</Link>
                <a href="mailto:support@lifeflow.ai" className="footer-nav-link">Contact</a>
              </div>
            </div>
          </div>

          {/* Lower Watermark & Meta Section */}
          <div className="footer-bottom-grid">
            <div className="footer-watermark">
              LifeFlow
            </div>

            <div className="footer-bottom-meta">
              <div className="footer-theme-toggle">
                <button
                  type="button"
                  className={`theme-toggle-btn ${themeMode === "light" ? "active" : ""}`}
                  onClick={() => setThemeMode("light")}
                  title="Light mode"
                  aria-label="Light mode"
                >
                  <Sun size={14} />
                </button>
                <button
                  type="button"
                  className={`theme-toggle-btn ${themeMode === "dark" ? "active" : ""}`}
                  onClick={() => setThemeMode("dark")}
                  title="Dark mode"
                  aria-label="Dark mode"
                >
                  <Moon size={14} />
                </button>
                <button
                  type="button"
                  className={`theme-toggle-btn ${themeMode === "system" ? "active" : ""}`}
                  onClick={() => setThemeMode("system")}
                  title="System mode"
                  aria-label="System mode"
                >
                  <Monitor size={14} />
                </button>
              </div>

              <div className="footer-copyright">© 2026 LifeFlow</div>
              <div className="footer-tagline">Made for clarity. Powered by MongoDB Atlas.</div>

              <div className="footer-legal-links">
                <Link href="/dashboard" className="footer-legal-link">Terms</Link>
                <Link href="/dashboard" className="footer-legal-link">Privacy</Link>
                <Link href="/dashboard" className="footer-legal-link">Security</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

