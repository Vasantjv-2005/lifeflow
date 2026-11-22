"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Compass,
  ExternalLink,
  FilePlus2,
  GitBranch,
  History,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { getDecisions, getSimulations, type Decision, logout } from "@/lib/api"
import { useAuthStore } from "@/lib/use-auth-store"

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My decisions", href: "/decisions", icon: ListTodo },
  { label: "Simulations", href: "/simulations", icon: GitBranch },
  { label: "AI studio", href: "/ai-studio", icon: Sparkles },
  { label: "Future Self", href: "/workspace/future-self", icon: Compass },
  { label: "Resume Time Machine", href: "/workspace/resume-time-machine", icon: History },
]

const statusStyle: Record<string, string> = {
  active: "status-active",
  draft: "status-draft",
  completed: "status-completed",
}

function SideNav({ onNavigate, decisionsCount }: { onNavigate?: () => void; decisionsCount?: number }) {
  const pathname = usePathname()
  const { user, clear } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Ignored if network fails
    }
    clear()
    window.location.href = "/login"
  }

  const initial = user?.name ? user.name.slice(0, 1).toUpperCase() : "U"

  return (
    <>
      <Link href="/dashboard" className="brand" onClick={onNavigate}>
        <img
          src="/logo.png"
          alt="LifeFlow Logo"
          style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }}
        />
        <span>
          life<span className="brand-light">flow</span>
        </span>
      </Link>
      <div className="workspace-label">
        WORKSPACE <ChevronDown size={13} />
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`nav-item ${
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href)) ? "nav-active" : ""
            }`}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
            {label === "My decisions" && typeof decisionsCount === "number" && decisionsCount > 0 && (
              <span className="nav-count">{decisionsCount}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="side-divider" />
        <Link href="/settings" className={`nav-item ${pathname === "/settings" ? "nav-active" : ""}`}>
          <Settings2 size={17} />
          <span>Settings</span>
        </Link>
        <Link href="/ai-studio" className="nav-item side-help">
          <CircleHelp size={17} />
          <span>Help & exploration</span>
        </Link>
        <Link href="/" className="nav-item">
          <ExternalLink size={17} />
          <span>Product showcase</span>
        </Link>
        <div className="profile-row">
          <div className="avatar" suppressHydrationWarning style={{ overflow: "hidden" }}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              initial
            )}
          </div>
          <div className="profile-copy">
            <strong suppressHydrationWarning>{user?.name || "LifeFlow User"}</strong>
            <span suppressHydrationWarning>{user?.email || "Personal workspace"}</span>
          </div>
          <button aria-label="Log out" className="icon-button profile-logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, fetchUser, clear } = useAuthStore()

  useEffect(() => {
    fetchUser()
    const redirectToLogin = () => {
      clear()
      window.location.href = "/login"
    }
    window.addEventListener("lifeflow:unauthorized", redirectToLogin)
    return () => window.removeEventListener("lifeflow:unauthorized", redirectToLogin)
  }, [fetchUser, clear])

  const decisionsQuery = useQuery({ queryKey: ["decisions"], queryFn: getDecisions })
  const decisionsCount = Array.isArray(decisionsQuery.data) ? decisionsQuery.data.length : 0

  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())
  }, [])

  const initial = user?.name ? user.name.slice(0, 1).toUpperCase() : "U"
  const pageName =
    navigation.find((item) => item.href === pathname)?.label || (pathname.includes("settings") ? "Settings" : "Workspace")

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <SideNav decisionsCount={decisionsCount} />
      </aside>
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}>
            <button className="mobile-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={19} />
            </button>
            <SideNav onNavigate={() => setMobileOpen(false)} decisionsCount={decisionsCount} />
          </aside>
        </div>
      )}
      <main className="main-panel">
        <header className="topbar">
          <button aria-label="Open menu" className="icon-button mobile-menu" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>{pageName}</strong>
          </div>
          <div className="top-actions">
            <div className="today-label" suppressHydrationWarning>{todayStr}</div>
            <Link href="/decisions" className="icon-button top-search" aria-label="Search decisions">
              <Search size={18} />
            </Link>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>
            <Link href="/settings" className="avatar top-avatar" suppressHydrationWarning style={{ overflow: "hidden" }}>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name || "User"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                initial
              )}
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: React.ReactNode
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
}: {
  label: string
  value: string | number
  detail: string
  icon: typeof Target
  trend?: string
}) {
  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon size={17} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span className="stat-detail">
          {trend && (
            <span className="trend">
              <ArrowUpRight size={13} />
              {trend}
            </span>
          )}
          {detail}
        </span>
      </div>
    </motion.article>
  )
}

export function Dashboard() {
  const { user } = useAuthStore()
  const decisionsQuery = useQuery({ queryKey: ["decisions"], queryFn: getDecisions })
  const simulationsQuery = useQuery({ queryKey: ["simulations"], queryFn: getSimulations })

  const decisions: Decision[] = Array.isArray(decisionsQuery.data) ? decisionsQuery.data : []
  const simulations = Array.isArray(simulationsQuery.data) ? simulationsQuery.data : []

  const active = decisions.filter((decision) => decision.status === "active").length
  const completed = decisions.filter((item) => item.status === "completed").length
  const inProgress = decisions.filter((decision) => decision.status !== "completed").slice(0, 4)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "morning"
    if (hour < 18) return "afternoon"
    return "evening"
  }, [])

  const firstName = user?.name ? user.name.split(" ")[0] : "there"

  const clarityScore = useMemo(() => {
    if (decisions.length === 0 && simulations.length === 0) return "—"
    const score = Math.min(100, Math.round(completed * 35 + active * 15 + simulations.length * 20))
    return `${score}%`
  }, [completed, active, simulations.length, decisions.length])

  const problem = decisionsQuery.error as { response?: { status?: number }; message?: string } | null

  return (
    <AppShell>
      <div className="page-content">
        <PageHeading
          eyebrow="YOUR LIFE, IN MOTION"
          title={
            <span suppressHydrationWarning>
              Good {greeting},{" "}
              <span suppressHydrationWarning>
                {firstName}
                {firstName !== "there" ? "." : ""}
              </span>
            </span>
          }
          description="A little clarity goes a long way. What decisions are on your mind today?"
          action={
            <Link className="button button-dark" href="/decisions?new=1">
              <FilePlus2 size={16} /> New decision
            </Link>
          }
        />
        <section className="stats-grid" aria-label="Your overview">
          <StatCard
            label="Decisions in motion"
            value={decisionsQuery.isLoading ? "—" : active}
            detail="Active right now"
            icon={Target}
            trend={active ? `${active} active` : undefined}
          />
          <StatCard
            label="Paths explored"
            value={simulationsQuery.isLoading ? "—" : simulations.length}
            detail="Stored in your workspace"
            icon={GitBranch}
          />
          <StatCard
            label="Decisions made"
            value={decisionsQuery.isLoading ? "—" : completed}
            detail="Every step counts"
            icon={TrendingUp}
          />
          <StatCard
            label="Clarity score"
            value={decisionsQuery.isLoading ? "—" : clarityScore}
            detail="Builds as you explore"
            icon={Compass}
          />
        </section>
        <section className="content-grid">
          <article className="surface decision-surface">
            <div className="section-heading">
              <div>
                <span className="eyebrow">KEEP YOUR MOMENTUM</span>
                <h2>Decisions in motion</h2>
              </div>
              <Link href="/decisions" className="text-link">
                See all <ArrowRight size={15} />
              </Link>
            </div>
            {decisionsQuery.isLoading ? (
              <div className="loading-list">
                <div />
                <div />
                <div />
              </div>
            ) : problem ? (
              <div className="inline-error">
                <span className="error-dot" />
                <div>
                  <strong>We couldn&apos;t reach your backend database</strong>
                  <p>Check that your API server and MongoDB are connected.</p>
                </div>
                <button className="retry-button" onClick={() => decisionsQuery.refetch()}>
                  Retry
                </button>
              </div>
            ) : inProgress.length ? (
              <div className="decision-list">
                {inProgress.map((item, index) => (
                  <Link href={`/decisions/${item.id}`} className="decision-row" key={item.id}>
                    <span className={`decision-mark mark-${index % 4}`}>
                      <Target size={17} />
                    </span>
                    <span className="decision-main">
                      <strong>{item.title}</strong>
                      <small>
                        {item.category || "General"}{" "}
                        {item.createdAt
                          ? `· ${new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}`
                          : "· Active"}
                      </small>
                    </span>
                    <span className={`status-pill ${statusStyle[item.status] || "status-draft"}`}>
                      <span />
                      {item.status || "draft"}
                    </span>
                    <ArrowRight className="row-arrow" size={16} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-decisions">
                <div className="empty-illustration">
                  <Target size={24} />
                </div>
                <strong>Your next decision starts here.</strong>
                <p>Create a decision to map out factors and outcomes in your database.</p>
                <Link href="/decisions?new=1" className="button button-outline">
                  <span>Start a decision</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
            {decisionsQuery.error && problem?.response?.status === 429 && (
              <div className="rate-limit">You&apos;re moving quickly. Please wait a moment before trying again.</div>
            )}
          </article>
          <aside className="right-column">
            <article className="clarity-card">
              <div className="clarity-glow" />
              <div className="clarity-top">
                <span className="clarity-icon">
                  <Sparkles size={17} />
                </span>
                <span className="clarity-label">AI DECISION STUDIO</span>
              </div>
              <h2>
                Explore scenarios
                <br />
                with AI assistance.
              </h2>
              <p>Generate optimistic, realistic, and pessimistic pathways and save them directly to MongoDB.</p>
              <Link href="/ai-studio" className="clarity-link">
                Open AI studio <ArrowRight size={15} />
              </Link>
              <div className="clarity-orbit orbit-one" />
              <div className="clarity-orbit orbit-two" />
            </article>
            <article className="surface quickstart">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">QUICK ACTIONS</span>
                  <h3>Start something new</h3>
                </div>
              </div>
              <Link href="/decisions?new=1" className="quick-row">
                <span className="quick-icon quick-peach">
                  <BriefcaseBusiness size={16} />
                </span>
                <span>
                  <strong>Create a new decision</strong>
                  <small>Capture constraints, factors, and goals</small>
                </span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href={
                  decisions[0]
                    ? `/simulations/new?title=${encodeURIComponent(decisions[0].title)}&goal=${encodeURIComponent(decisions[0].goal || "")}`
                    : "/simulations/new"
                }
                className="quick-row"
              >
                <span className="quick-icon quick-green">
                  <GitBranch size={16} />
                </span>
                <span>
                  <strong>Design a visual simulation</strong>
                  <small>Map out nodes, edges, and paths</small>
                </span>
                <ArrowRight size={14} />
              </Link>
            </article>
          </aside>
        </section>
        <section className="bottom-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR WORKSPACE</span>
              <h2>Explore your options</h2>
            </div>
            <Link href="/simulations" className="text-link">
              Open simulations <ArrowRight size={15} />
            </Link>
          </div>
          <div className="feature-grid">
            <Link href="/simulations" className="feature-tile">
              <div className="feature-icon feature-lilac">
                <GitBranch size={19} />
              </div>
              <div>
                <strong>Simulation Canvas</strong>
                <p>Interactive graph canvas connected directly to your MongoDB database.</p>
              </div>
              <ArrowRight size={16} />
            </Link>
            <Link href="/ai-studio" className="feature-tile">
              <div className="feature-icon feature-sun">
                <Sparkles size={19} />
              </div>
              <div>
                <strong>AI Scenario Modeling</strong>
                <p>Simulate different potential futures and save them in batch.</p>
              </div>
              <ArrowRight size={16} />
            </Link>
            <Link href="/settings" className="feature-tile">
              <div className="feature-icon feature-mint">
                <Activity size={19} />
              </div>
              <div>
                <strong>Workspace Profile</strong>
                <p>Manage your account credentials and personal preferences.</p>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <footer className="dashboard-footer">
          <span>LifeFlow Decision Intelligence System</span>
          <span>Every decision saved and synchronized in MongoDB.</span>
        </footer>
      </div>
    </AppShell>
  )
}

export function PageFrame({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

export { PageHeading, AppShell, PageFrame as DashboardLayout }
