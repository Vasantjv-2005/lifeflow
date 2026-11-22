"use client"

import React, { useState } from "react"
import {
  BookOpen,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Code,
  Server,
  Database,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileCode,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  FolderGit2,
  Briefcase,
  TrendingUp,
} from "lucide-react"
import {
  FoundationsGuide,
  RemainingSkillsAndProjects,
  InterviewMastery,
  SolidProject,
  TechnicalQuestion,
} from "../../lib/api"

// ==================== 1. +3 MONTHS: FOUNDATIONS GUIDE VIEW ====================

interface FoundationsGuideViewProps {
  targetCareer: string
  data?: FoundationsGuide
}

export function FoundationsGuideView({ targetCareer, data }: FoundationsGuideViewProps) {
  const coreConcepts = data?.coreConcepts || [
    "V8 JavaScript Engine & Runtime Internals (Call Stack, Memory Heap, Event Loop)",
    "Asynchronous Programming (Promises, async/await, Microtasks vs Macrotasks)",
    "HTTP Protocols & RESTful Architecture (Headers, Status Codes, CORS, Authentication)",
    "Strict TypeScript Type Safety (Generics, Discriminated Unions, Utility Types)",
    "Relational & Document Database Schema Design (ACID, Normalization, Compound Indexes)",
    "Component Lifecycle & Virtual DOM Reconciliation (State Encapsulation, Custom Hooks)",
  ]

  const toolsAndLanguages = data?.toolsAndLanguages || [
    "TypeScript (Strict Mode)",
    "JavaScript (ES2023+)",
    "Node.js & Express.js",
    "React.js & Next.js 14",
    "PostgreSQL & MongoDB",
    "Git & GitHub Workflow",
    "Tailwind CSS & shadcn/ui",
  ]

  const weeklyPlan = data?.weeklyFocusPlan || [
    {
      week: "Weeks 1–2",
      focus: "Language Fundamentals & Asynchronous Concurrency",
      outcome: "Master scope, closures, event loop, and pass 25 advanced asynchronous algorithm challenges.",
    },
    {
      week: "Weeks 3–4",
      focus: "Strict TypeScript & Type-Safe Architecture",
      outcome: "Build clean, reusable TypeScript modules using generics, discriminated unions, and strict compiler configs.",
    },
    {
      week: "Weeks 5–6",
      focus: "RESTful Backend Architecture & Validation",
      outcome: "Author a production-grade REST API with centralized error handling, Zod schema validation, and request logging.",
    },
    {
      week: "Weeks 7–8",
      focus: "Database Schema Modeling & Indexing",
      outcome: "Design normalized SQL/NoSQL schemas with indexes, transactional operations, and automated seed migration scripts.",
    },
    {
      week: "Weeks 9–10",
      focus: "Component Architecture, State & Hooks",
      outcome: "Develop responsive, accessible UI components consuming backend REST APIs with optimistic state updates.",
    },
    {
      week: "Weeks 11–12",
      focus: "Authentication, Cookies & Mini-Capstone",
      outcome: "Deploy a full-stack auth-gated starter web application to Vercel/Render with automated CI/CD and secure HTTP-only cookies.",
    },
  ]

  const milestones = data?.milestones || [
    {
      title: "Type-Safe REST API with Express, TypeScript & Zod",
      description: "Develop a robust backend server with structured routing, environment variable validation, Zod request schemas, and comprehensive unit tests.",
      whyImportant: "Clean server architecture and request validation prevent runtime crashes and protect data integrity in production.",
      learningLinks: [
        { title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "documentation" },
        { title: "Full Stack Open: Node.js & Express", url: "https://fullstackopen.com/en/part3", type: "course" },
      ],
    },
    {
      title: "Normalized Database Modeling & Migrations",
      description: "Design and implement relational/document schemas with indexes, transactional operations, and automated seed scripts.",
      whyImportant: "Database schema design choices dictate application performance and scalability as data volume grows.",
      learningLinks: [
        { title: "Use The Index, Luke! A Guide to Database Performance", url: "https://use-the-index-luke.com/", type: "tutorial" },
        { title: "Prisma / Mongoose Data Modeling Guides", url: "https://www.prisma.io/docs/concepts/components/prisma-schema/data-model", type: "documentation" },
      ],
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
      {/* Horizon Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          backgroundColor: "#fffdfa",
          border: "1px solid #fde68a",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 4,
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
              }}
            >
              Month 1–3 Horizon
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
              Core Foundations & Prerequisites
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1c1917", margin: "6px 0 2px" }}>
            What You Should Learn in Your First 3 Months for {targetCareer}
          </h2>
          <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>
            Mastering these core principles and tools builds the unshakeable foundation required before advancing to production capstones.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#b45309", fontWeight: 600 }}>
          <BookOpen size={16} /> 12-Week Foundation Curriculum
        </div>
      </div>

      {/* Grid: Core Concepts & Essential Tooling */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        {/* Core Concepts */}
        <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Terminal size={17} style={{ color: "#d97706" }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: 0 }}>
              Foundational Concepts to Master
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {coreConcepts.map((concept, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  backgroundColor: "#faf8f5",
                  border: "1px solid #f0eee6",
                  fontSize: 12,
                  color: "#292524",
                  lineHeight: 1.45,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  0{idx + 1}
                </span>
                <span>{concept}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Languages & Tools */}
        <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Code size={17} style={{ color: "#2563eb" }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: 0 }}>
                Essential Languages & Tooling
              </h3>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {toolsAndLanguages.map((tool, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: "#f0f9ff",
                    color: "#0369a1",
                    border: "1px solid #bae6fd",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={12} /> {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Curated Resources */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0eee6" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#44403c", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={13} style={{ color: "#d97706" }} /> Curated Learning Documentation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {milestones.flatMap((m) => m.learningLinks || []).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "7px 10px",
                    borderRadius: 6,
                    backgroundColor: "#faf8f5",
                    border: "1px solid #e7e2da",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  <span>{link.title}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 12-Week Sprint Learning Plan */}
      <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: 0 }}>
              12-Week Structured Sprint Syllabus
            </h3>
            <p style={{ fontSize: 12, color: "#78716c", margin: "2px 0 0" }}>
              Focus areas and concrete verification deliverables across 2-week learning sprints.
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, backgroundColor: "#fef3c7", color: "#92400e" }}>
            Sprints 1 to 6
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {weeklyPlan.map((sprint, idx) => (
            <div
              key={idx}
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                backgroundColor: "#faf8f5",
                border: "1px solid #e7e2da",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: "#b45309",
                      backgroundColor: "#fef3c7",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {sprint.week}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>
                  {sprint.focus}
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 10px",
                  backgroundColor: "#fff",
                  borderRadius: 6,
                  border: "1px solid #f0eee6",
                  fontSize: 11,
                  color: "#44403c",
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: "#059669" }}>Outcome: </strong>
                {sprint.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== 2. +6 MONTHS: REMAINING SKILLS & PROJECTS WITH FULL STACK DOCS ====================

interface RemainingSkillsAndProjectsViewProps {
  targetCareer: string
  data?: RemainingSkillsAndProjects
  onCopyBullet?: (text: string, id: string) => void
  copiedBulletIdx?: string | null
}

export function RemainingSkillsAndProjectsView({
  targetCareer,
  data,
  onCopyBullet,
  copiedBulletIdx,
}: RemainingSkillsAndProjectsViewProps) {
  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0)
  const [activeDocTab, setActiveDocTab] = useState<string>("arch")

  const remainingSkills = data?.remainingSkills || [
    "Advanced State Management & Optimistic UI Updates (Zustand, React Query / TanStack)",
    "Real-Time Event Streaming & WebSockets (Socket.io, Server-Sent Events, Redis Pub/Sub)",
    "Distributed Caching & Invalidation Strategies (Redis LRU Cache, Read-Through, Write-Behind)",
    "Asynchronous Background Job Queues (BullMQ / Celery, Dead-Letter Queues, Worker Threads)",
    "Production Security Hardening (OWASP Top 10, CSP Headers, CSRF Tokens, Rate Limiting)",
    "Container Orchestration & Microservices (Docker Compose, Multi-Stage Builds, Nginx Reverse Proxy)",
    "Automated CI/CD Workflows & Cloud Deployment (GitHub Actions, Vercel, AWS ECS / Render)",
  ]

  const projects: SolidProject[] = data?.solidProjects && data.solidProjects.length > 0
    ? data.solidProjects
    : [
        {
          title: "LifeFlow Real-Time Collaborative Decision & Workflow Engine",
          tagline: "A production-grade, distributed web platform enabling multiple users to collaborate on interactive decision matrices, node graphs, and workflows in real time with optimistic UI updates.",
          difficulty: "Production-Ready",
          technologies: ["Next.js 14", "TypeScript", "Node.js", "Express", "Socket.io", "Redis", "PostgreSQL / MongoDB", "Tailwind CSS", "Docker"],
          fullStackDocumentation: {
            architectureOverview: "A modular full-stack web architecture with a Next.js frontend communicating via HTTP REST APIs for structured transactions and WebSockets for real-time multiplayer updates. Redis acts as a pub/sub message broker, allowing horizontal scaling across multiple Node.js server instances while synchronizing active canvas states.",
            frontendSpec: "Built with Next.js 14 App Router and TypeScript. Features an interactive SVG/HTML5 canvas, Zustand for atomic state management, TanStack React Query for cached data fetching, and optimistic UI rendering for instantaneous user feedback.",
            backendSpec: "Express.js REST & WebSocket microservices layer written in strict TypeScript. Features JWT authentication in HTTP-only secure cookies, Zod schema validation on all inputs, rate-limiting middleware, and centralized error logging with Winston.",
            databaseSchema: "Relational or Document schema modeling:\n- Users (id, name, email, passwordHash, avatarUrl, createdAt)\n- Workspaces (id, ownerId, name, planType, settings)\n- DecisionCanvases (id, workspaceId, title, nodesJson, edgesJson, version, updatedAt)\n- Collaborators (id, canvasId, userId, role: 'viewer' | 'editor' | 'admin')\n- AuditLogs (id, canvasId, userId, action, timestamp)",
            apiEndpoints: [
              { method: "POST", path: "/api/v1/auth/login", description: "Authenticates user credentials and issues secure HTTP-only cookies" },
              { method: "GET", path: "/api/v1/workspaces/:id/canvases", description: "Fetches user accessible canvases with collaborator permissions" },
              { method: "POST", path: "/api/v1/canvases", description: "Creates a new decision canvas with initial node schema" },
              { method: "PATCH", path: "/api/v1/canvases/:id/nodes", description: "Batch updates canvas nodes with optimistic concurrency lock verification" },
              { method: "POST", path: "/api/v1/canvases/:id/invite", description: "Invites team collaborators with role-based access control (RBAC)" },
              { method: "GET", path: "/api/v1/canvases/:id/export", description: "Generates high-resolution PDF or SVG document export" },
            ],
            deploymentAndDevOps: "Containerized using multi-stage Dockerfiles with lightweight Alpine Node bases. Orchestrated locally with Docker Compose (web, api, redis, db). Automated GitHub Actions pipeline runs ESLint, TypeScript check, unit test suites, and pushes to cloud hosting.",
            stepByStepGuide: [
              "Step 1: Initialize monorepo or dual-repo structure with TypeScript, ESLint, and Prettier configurations.",
              "Step 2: Build Express API with Mongoose/Prisma models, JWT authentication, and Zod validation middleware.",
              "Step 3: Integrate Socket.io server with Redis adapter for multi-instance distributed websocket broadcasting.",
              "Step 4: Develop Next.js canvas UI with responsive drag-and-drop nodes, undo/redo history, and presence cursors.",
              "Step 5: Implement Redis caching layer reducing database read queries on active workspaces by 80%.",
              "Step 6: Write integration tests with Vitest/Supertest and deploy to production with automated CI/CD.",
            ],
            keyResumeBullets: [
              "Architected a real-time collaborative workspace supporting 2,500+ concurrent active WebSocket connections with sub-40ms state synchronization.",
              "Engineered Redis pub/sub broadcasting and memory caching layer, reducing primary database load by 78% during peak collaborative sessions.",
              "Implemented strict input validation (Zod) and HTTP-only cookie JWT security, eliminating cross-site scripting (XSS) and CSRF attack surfaces.",
            ],
          },
        },
      ]

  const currentProject = projects[activeProjectIdx] || projects[0]
  const doc = currentProject.fullStackDocumentation

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
      {/* Horizon Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 4,
                backgroundColor: "#dcfce7",
                color: "#15803d",
                border: "1px solid #bbf7d0",
              }}
            >
              Month 4–6 Horizon
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
              Remaining Skills & Solid Production Projects
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1c1917", margin: "6px 0 2px" }}>
            Remaining Skills to Learn & Solid Projects to Build for {targetCareer}
          </h2>
          <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>
            Complete full-stack architecture specifications, schemas, endpoints, and deployment guides to build real production-grade portfolio evidence.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#15803d", fontWeight: 600 }}>
          <FolderGit2 size={16} /> Complete Full-Stack Architecture Included
        </div>
      </div>

      {/* Remaining Advanced Skills To Learn */}
      <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <TrendingUp size={17} style={{ color: "#059669" }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: 0 }}>
            Remaining Advanced Skills to Master (After Foundations)
          </h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {remainingSkills.map((skill, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                borderRadius: 8,
                backgroundColor: "#faf8f5",
                border: "1px solid #f0eee6",
                fontSize: 12,
                color: "#292524",
              }}
            >
              <CheckCircle2 size={14} style={{ color: "#059669", flexShrink: 0 }} />
              <span>{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Solid Projects with Full-Stack Documentation */}
      <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da", overflow: "hidden" }}>
        {/* Project Selector Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e7e2da",
            backgroundColor: "#faf8f5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>Select Project:</span>
            {projects.map((proj, idx) => {
              const isSelected = activeProjectIdx === idx
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveProjectIdx(idx)
                    setActiveDocTab("arch")
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? "#059669" : "#fff",
                    color: isSelected ? "#fff" : "#44403c",
                    border: isSelected ? "1px solid #059669" : "1px solid #d6d3d1",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Project {idx + 1}: {proj.title.split(" ").slice(0, 3).join(" ")}...
                </button>
              )
            })}
          </div>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: "#dcfce7",
              color: "#15803d",
              border: "1px solid #bbf7d0",
            }}
          >
            {currentProject.difficulty}
          </span>
        </div>

        {/* Current Project Details Banner */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0eee6" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1c1917", margin: "0 0 6px" }}>
            {currentProject.title}
          </h3>
          <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 14px", lineHeight: 1.45 }}>
            {currentProject.tagline}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {currentProject.technologies.map((tech, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 6,
                  backgroundColor: "#f5f5f4",
                  color: "#292524",
                  border: "1px solid #e7e5e4",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Documentation Sub-Tabs */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            borderBottom: "1px solid #e7e2da",
            backgroundColor: "#fff",
            padding: "0 16px",
          }}
        >
          {[
            { id: "arch", label: "Architecture", icon: Layers },
            { id: "frontend", label: "Frontend Spec", icon: Code },
            { id: "backend", label: "Backend API Spec", icon: Server },
            { id: "db", label: "Database Schema", icon: Database },
            { id: "devops", label: "Deployment & DevOps", icon: Cpu },
            { id: "steps", label: "Step-by-Step Guide", icon: Terminal },
            { id: "bullets", label: "Resume Bullet Points", icon: Award },
          ].map((tab) => {
            const isActive = activeDocTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id)}
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#059669" : "#78716c",
                  borderBottom: isActive ? "2px solid #059669" : "2px solid transparent",
                  backgroundColor: "transparent",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Documentation Content Panel */}
        <div style={{ padding: "24px", minHeight: 280 }}>
          {/* TAB 1: ARCHITECTURE */}
          {activeDocTab === "arch" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Layers size={15} style={{ color: "#059669" }} /> Full-Stack System Architecture Overview
              </div>
              <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                {doc.architectureOverview}
              </p>
            </div>
          )}

          {/* TAB 2: FRONTEND SPEC */}
          {activeDocTab === "frontend" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Code size={15} style={{ color: "#2563eb" }} /> Client-Side Architecture & UI Specification
              </div>
              <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.6, margin: 0 }}>
                {doc.frontendSpec}
              </p>
            </div>
          )}

          {/* TAB 3: BACKEND API */}
          {activeDocTab === "backend" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Server size={15} style={{ color: "#7c3aed" }} /> Backend Service Specification & REST API Endpoints
              </div>
              <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.5, marginBottom: 16 }}>
                {doc.backendSpec}
              </p>

              <div style={{ border: "1px solid #e7e2da", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 220px 1fr", padding: "9px 14px", backgroundColor: "#faf8f5", fontSize: 11, fontWeight: 700, color: "#78716c", borderBottom: "1px solid #e7e2da" }}>
                  <span>METHOD</span>
                  <span>ENDPOINT PATH</span>
                  <span>DESCRIPTION / PURPOSE</span>
                </div>
                {doc.apiEndpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 220px 1fr",
                      padding: "10px 14px",
                      borderBottom: idx === doc.apiEndpoints.length - 1 ? "none" : "1px solid #f0eee6",
                      fontSize: 12,
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor:
                            ep.method === "GET"
                              ? "#e0f2fe"
                              : ep.method === "POST"
                              ? "#dcfce7"
                              : ep.method === "PATCH" || ep.method === "PUT"
                              ? "#fef3c7"
                              : "#fee2e2",
                          color:
                            ep.method === "GET"
                              ? "#0369a1"
                              : ep.method === "POST"
                              ? "#15803d"
                              : ep.method === "PATCH" || ep.method === "PUT"
                              ? "#92400e"
                              : "#991b1b",
                        }}
                      >
                        {ep.method}
                      </span>
                    </span>
                    <code style={{ fontSize: 11, color: "#1c1917", fontWeight: 600 }}>{ep.path}</code>
                    <span style={{ color: "#57534e", fontSize: 12 }}>{ep.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE SCHEMA */}
          {activeDocTab === "db" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Database size={15} style={{ color: "#059669" }} /> Database Schema & Entity Relationships
              </div>
              <pre
                style={{
                  backgroundColor: "#faf8f5",
                  border: "1px solid #e7e2da",
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 12,
                  color: "#1c1917",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {doc.databaseSchema}
              </pre>
            </div>
          )}

          {/* TAB 5: DEPLOYMENT & DEVOPS */}
          {activeDocTab === "devops" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Cpu size={15} style={{ color: "#ea580c" }} /> Docker, CI/CD & Production Cloud Deployment
              </div>
              <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.6, margin: 0 }}>
                {doc.deploymentAndDevOps}
              </p>
            </div>
          )}

          {/* TAB 6: STEP-BY-STEP BUILD GUIDE */}
          {activeDocTab === "steps" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={15} style={{ color: "#2563eb" }} /> Step-by-Step Implementation Roadmap (Zero to Production)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {doc.stepByStepGuide.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 8,
                      backgroundColor: "#faf8f5",
                      border: "1px solid #f0eee6",
                      fontSize: 12,
                      color: "#292524",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "2px 7px",
                        borderRadius: 4,
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: KEY RESUME BULLETS */}
          {activeDocTab === "bullets" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Award size={15} style={{ color: "#b45309" }} /> Ready-to-Use Resume Bullet Points (STAR Method)
              </div>
              <p style={{ fontSize: 12, color: "#78716c", marginBottom: 14 }}>
                Once you complete and verify this project deliverable, copy these quantified bullets directly into your resume project section.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {doc.keyResumeBullets.map((bullet, idx) => {
                  const bulletId = `bullet-${activeProjectIdx}-${idx}`
                  const isCopied = copiedBulletIdx === bulletId
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px 16px",
                        borderRadius: 8,
                        backgroundColor: "#faf8f5",
                        border: "1px solid #e7e2da",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ color: "#059669", fontSize: 16, lineHeight: 1 }}>•</span>
                        <span style={{ fontSize: 12, color: "#1c1917", lineHeight: 1.5 }}>{bullet}</span>
                      </div>
                      <button
                        onClick={() => onCopyBullet && onCopyBullet(bullet, bulletId)}
                        style={{
                          padding: "5px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 6,
                          backgroundColor: isCopied ? "#059669" : "#fff",
                          color: isCopied ? "#fff" : "#57534e",
                          border: isCopied ? "1px solid #059669" : "1px solid #d6d3d1",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isCopied ? <Check size={11} /> : <Copy size={11} />}
                        {isCopied ? "Copied" : "Copy Bullet"}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== 3. +12 MONTHS: INTERVIEW MASTERY & JOB LANDING VIEW ====================

export const getInterviewQuestionsForCareer = (targetCareer: string): TechnicalQuestion[] => {
  const lower = targetCareer.toLowerCase()

  // 1. AWS Cloud Solutions Architect / DevOps / SRE
  if (lower.includes("cloud") || lower.includes("devops") || lower.includes("sre") || lower.includes("aws")) {
    return [
      {
        category: "System Design & Cloud Architecture",
        question: "How would you architect a global web application in AWS that must achieve 99.99% availability, handle peak traffic spikes of 500,000 active users, and maintain an RTO (Recovery Time Objective) under 5 minutes?",
        idealAnswer: "I would implement a multi-region active-active or active-passive architecture. At the edge, AWS Route 53 latency-based routing with health checks directs traffic to CloudFront distributions with Origin Shield. In each region, traffic passes through an Application Load Balancer to an Amazon EKS cluster with Horizontal Pod Autoscaler and Karpenter for rapid EC2 compute provisioning. For the data layer, I would use Amazon Aurora Global Database with sub-second replication latency across regions, combined with ElastiCache Redis for distributed caching. In the event of a regional outage, Route 53 DNS failover reroutes traffic instantly, fulfilling the <5 minute RTO requirement.",
        keyTalkingPoints: [
          "AWS Route 53 health-check failover and CloudFront CDN caching",
          "Amazon EKS with Karpenter auto-scaling for rapid compute elasticity",
          "Amazon Aurora Global Database for sub-second cross-region replication",
          "Recovery Time Objective (RTO) and Recovery Point Objective (RPO) metrics",
        ],
        codeSnippetOrDiagram: `[Users Worldwide] --> [Route 53 DNS Failover + CloudFront CDN]
                             |
    +------------------------+------------------------+
    | (Primary Region)                                | (Secondary Region)
    v                                                 v
[ALB Ingress]                                     [ALB Ingress]
    |                                                 |
[EKS Autoscaling Cluster]                         [EKS Standby / Active Cluster]
    |                                                 |
[ElastiCache Redis]                               [ElastiCache Redis]
    |                                                 |
[Aurora Primary DB] ----(Sub-second replication)-----> [Aurora Read Replica / DR]`,
      },
      {
        category: "Troubleshooting & Live Outage Diagnosis",
        question: "A microservice running on Kubernetes suddenly triggers a high severity CrashLoopBackOff alert during peak hours. Walk me through your step-by-step diagnostic procedure.",
        idealAnswer: "First, inspect the high-level pod status and event logs using 'kubectl describe pod <pod-name>' to check for OOMKilled exit codes (137) or failed liveness/readiness probes. Second, inspect previous container logs using 'kubectl logs <pod-name> --previous' to capture unhandled application exceptions before termination. Third, if it's an OOMKilled issue, check Prometheus metrics to see if traffic spiked or memory leaked, and temporarily adjust resource limits or scale replicas. If it's a configuration issue (e.g. failed database connection), verify Secret/ConfigMap bindings and network reachability. Finally, document an RCA with preventative limits and alerts.",
        keyTalkingPoints: [
          "kubectl describe events (spotting exit code 137 OOMKilled vs 1/128)",
          "kubectl logs --previous to capture pre-crash stack traces",
          "ConfigMap / Secret resolution and database connectivity checks",
          "Post-incident Root Cause Analysis (RCA) and mitigation plan",
        ],
      },
      {
        category: "Infrastructure as Code & GitOps",
        question: "How do you manage Terraform state in an enterprise team with 20+ engineers without experiencing state corruption or configuration drift?",
        idealAnswer: "We enforce an immutable remote backend using an Amazon S3 bucket with strict server-side KMS encryption, versioning enabled, and a DynamoDB table for distributed state locking. To prevent drift and uncontrolled manual modifications, all infrastructure changes must flow through a CI/CD pipeline (e.g. GitHub Actions / Atlantis) with automated 'terraform plan' PR comments and mandatory approvals. In production, we schedule periodic drift detection jobs and enforce least-privilege IAM policies that deny direct AWS console modification to managed resources.",
        keyTalkingPoints: [
          "S3 backend with object versioning and DynamoDB state locking",
          "Atlantis / GitHub Actions automated plan review & peer sign-off",
          "Scheduled drift detection against out-of-band manual changes",
          "Least-privilege IAM preventing direct console edits",
        ],
      },
      {
        category: "Security & Cloud Hardening",
        question: "Explain the difference between a Security Group and a Network Access Control List (NACL) in AWS VPC networking. When would you use each?",
        idealAnswer: "A Security Group operates at the EC2/ENI instance level, is stateful (inbound allowed traffic automatically permits return outbound traffic regardless of rules), and supports only ALLOW rules. A NACL operates at the subnet boundary, is stateless (explicit rules must exist for both inbound and outbound traffic including ephemeral ports 1024-65535), and processes rules in numerical order supporting both ALLOW and DENY rules. Best practice is to use Security Groups for everyday workload isolation and NACLs as a defensive perimeter to block specific blacklisted CIDR IP blocks or compromised subnets.",
        keyTalkingPoints: [
          "Security Group = Instance level, Stateful, Allow-only",
          "NACL = Subnet boundary, Stateless, Allow & Deny with rule ordering",
          "Ephemeral port range requirements for stateless NACL returns",
          "Defense-in-depth: Combining both for comprehensive network isolation",
        ],
      },
      {
        category: "Observability & Site Reliability",
        question: "What are the Google SRE Four Golden Signals, and how would you implement alerting on them to avoid alert fatigue?",
        idealAnswer: "The Four Golden Signals are Latency (time taken to service requests), Traffic (demand placed on the system, e.g. RPS), Errors (rate of requests that fail), and Saturation (how 'full' the most constrained resource is). To eliminate alert fatigue, we never alert on raw momentary spikes. Instead, we alert on Multi-Window Multi-Burn-Rate SLO error budget consumption: for example, alerting immediately only if the error budget burn rate would exhaust our 30-day budget within 1 hour, and creating a low-priority ticket if it would exhaust in 3 days. This ensures engineers are only paged for urgent, actionable threats to customer experience.",
        keyTalkingPoints: [
          "Latency (p95/p99), Traffic (RPS), Errors (5xx), Saturation (CPU/RAM/IO)",
          "SLO / SLI-based alerting rather than arbitrary thresholds",
          "Multi-window burn rate alerts to eliminate paging noise",
          "Clear runbooks attached to every actionable pager incident",
        ],
      },
      {
        category: "Containerization & Security",
        question: "How do you secure Docker container images and runtimes before deploying to a production Kubernetes cluster?",
        idealAnswer: "We secure the container lifecycle in three phases: 1) Build Phase: Use minimal base images (Chainguard or distroless), implement multi-stage builds to exclude compilers/package managers, and run as a non-privileged non-root user (USER 10001). 2) CI Phase: Scan images in the pipeline with Trivy or Clair, blocking builds with Critical CVEs, and sign images using Cosign. 3) Runtime Phase: Enforce Kubernetes Pod Security Standards (Restricted), mount file systems as readOnlyRootFilesystem, drop all Linux capabilities (drop: ['ALL']), and enforce Kyverno or OPA Gatekeeper admission controller policies.",
        keyTalkingPoints: [
          "Minimal distroless base images and non-root USER execution",
          "Pipeline vulnerability scanning (Trivy) and image signing (Cosign)",
          "Kubernetes SecurityContext: read-only root filesystem and dropped capabilities",
          "Admission controllers (Kyverno / OPA Gatekeeper) enforcing policies",
        ],
      },
    ]
  }

  // 2. Full-Stack Web Developer / Software Engineer (Default)
  return [
    {
      category: "System Design & Scalability",
      question: "Design a high-throughput URL shortening service (like Bitly) handling 100 million new URLs per month and a 10:1 read-to-write ratio. How do you design the storage, key generation, and caching layers?",
      idealAnswer: "With 100M writes/month (~40 writes/sec) and a 10:1 read ratio (~400 reads/sec), traffic is manageable, but total storage over 5 years is significant (6 billion URLs). For key generation, a 7-character Base62 string (a-z, A-Z, 0-9) yields 62^7 (~3.5 trillion) unique combinations. Rather than hashing with MD5/SHA256 and dealing with collisions, I would use a distributed sequence generator (like Twitter Snowflake or pre-allocated Redis key ranges) and encode the integer ID into Base62. For storage, a NoSQL database (like DynamoDB or MongoDB) or a sharded relational database (PostgreSQL with hash partition on the short key) provides sub-5ms lookups. For reads, I implement an in-memory Redis cache with an LRU eviction policy storing the top 20% most requested URLs (Pareto Principle), which satisfies ~80% of read traffic without touching disk.",
      keyTalkingPoints: [
        "Capacity estimation: 100M writes/month, 10:1 read ratio, 3.5T Base62 combinations",
        "Key generation: Base62 encoding of counter/Snowflake ID to guarantee zero collisions",
        "Database schema: Partitioned key-value store with primary index on short_key",
        "Caching strategy: Redis LRU cache for 20% hot URLs fulfilling 80% of read traffic",
      ],
      codeSnippetOrDiagram: `[Client Request] --> [Load Balancer] --> [API Gateway / Node.js Servers]
                                        |
           +----------------------------+----------------------------+
           | Read Path (80% hits)                                    | Write Path
           v                                                         v
   [Redis LRU Cache]                                       [Snowflake ID Counter]
           | (Cache Miss)                                            |
           v                                                         v
[Partitioned Database] <----(Store short_code + original_url)---------+`,
    },
    {
      category: "JavaScript Engine & Concurrency",
      question: "Explain the JavaScript Event Loop, microtasks, and macrotasks. What is the exact execution order of: console.log(1), setTimeout(..., 0), Promise.resolve().then(...), and queueMicrotask(...)?",
      idealAnswer: "The JavaScript V8 runtime executes synchronous code on a single call stack. When asynchronous tasks are initiated, they are registered with Web APIs / Node libuv and queued for execution. Crucially, the runtime has two queues: the Microtask Queue (Promise callbacks, queueMicrotask, MutationObserver, process.nextTick in Node) and the Macrotask / Callback Queue (setTimeout, setInterval, setImmediate, I/O events). The Event Loop prioritizes the Microtask Queue: whenever the Call Stack is empty, the Event Loop executes ALL pending microtasks before picking a single macrotask. In the given snippet, the output order is:\n1) 1 (synchronous execution on Call Stack)\n2) Promise callback (Microtask 1)\n3) queueMicrotask callback (Microtask 2)\n4) setTimeout callback (Macrotask, executed in the next loop cycle).",
      keyTalkingPoints: [
        "Call Stack executes synchronous frames to completion",
        "Microtasks (Promises, queueMicrotask) have strict priority over macrotasks",
        "Microtask queue is drained completely before the next macrotask is dequeued",
        "setTimeout(..., 0) is deferred to the next tick of the macrotask queue",
      ],
      codeSnippetOrDiagram: `console.log(1);
setTimeout(() => console.log(4), 0);
Promise.resolve().then(() => console.log(2));
queueMicrotask(() => console.log(3));

// Output:
// 1
// 2
// 3
// 4`,
    },
    {
      category: "Database Indexing & Performance",
      question: "How does a B-Tree database index work under the hood, and why might a compound index on (status, createdAt) fail to accelerate a query with WHERE createdAt > NOW() - INTERVAL '7 days' AND status = 'active'?",
      idealAnswer: "A B-Tree index maintains a balanced, sorted tree structure allowing O(log N) searches, range scans, and sequential traversals. In a compound index on (status, createdAt), the data is sorted FIRST by status, and then for identical status values, sorted by createdAt. For the query WHERE createdAt > ... AND status = 'active', modern query planners can still utilize the index because both columns are present; however, if the index was defined in reverse (createdAt, status), the range condition on createdAt would prevent the B-Tree from performing an equality seek on status. The fundamental rule of compound indexing is the Leftmost Prefix Rule and the Equality-First Rule: place exact equality columns first (status), followed by range/inequality filter columns (createdAt).",
      keyTalkingPoints: [
        "B-Tree index structure: O(log N) balanced tree traversals",
        "Equality First Rule: Always put '=' columns before '>' or '<' columns in compound indexes",
        "Leftmost prefix rule: Index usage starts from the leading column",
        "Query EXPLAIN ANALYZE: Index Scan vs Index Range Scan vs Seq Scan",
      ],
    },
    {
      category: "Production Incident & Performance Tuning",
      question: "Your production Node.js API server is experiencing sudden p99 latency spikes of 4+ seconds, and CPU utilization is pegged at 100%. Walk me through how you diagnose and fix the root cause.",
      idealAnswer: "A 100% CPU lock in Node.js indicates either a synchronous blocking computation on the single-threaded Event Loop (e.g. JSON.parse on massive payloads, uncontrolled regex backtracking / ReDoS, synchronous crypto), or severe memory pressure triggering stop-the-world Garbage Collection (GC) churn. Diagnostic steps:\n1) Take an immediate CPU profile using Node's built-in inspector ('node --prof' or Chrome DevTools via v8-profiler) to identify the specific function consuming execution time.\n2) Check Node GC telemetry (using 'v8.getHeapStatistics()') to see if scavenge or mark-sweep pauses are causing the stalls.\n3) Inspect application logs for un-indexed database queries causing long serialized response payloads.\nImmediate mitigation: Scale horizontally across multiple CPU cores using Node cluster mode or PM2/Kubernetes replicas. Permanent fix: Offload CPU-heavy tasks to Node worker threads, replace blocking regex with non-backtracking alternatives, and paginate large payload responses.",
      keyTalkingPoints: [
        "Differentiating event loop CPU lock vs memory GC thrashing",
        "V8 CPU profiling and Chrome DevTools remote inspection",
        "Common culprits: ReDoS regex backtracking, massive JSON serialization, sync crypto",
        "Remediation: Worker threads, cluster mode, and input pagination",
      ],
    },
    {
      category: "Frontend Architecture & Web Vitals",
      question: "What are Core Web Vitals (LCP, INP, CLS), and what concrete architectural techniques would you use to improve each in a Next.js / React application?",
      idealAnswer: "Core Web Vitals measure real-world user experience across three dimensions:\n1) LCP (Largest Contentful Paint - target <2.5s): Measures loading performance. Improved by prioritizing critical hero images using Next.js <Image priority>, preloading key fonts, optimizing server response times with edge caching, and server-side rendering (SSR).\n2) INP (Interaction to Next Paint - target <200ms): Replaced FID to measure page responsiveness to user clicks/taps. Improved by splitting long tasks (>50ms) using requestAnimationFrame or setTimeout/scheduler.yield, debouncing expensive state computations, and using React 18 useTransition for non-blocking UI updates.\n3) CLS (Cumulative Layout Shift - target <0.1): Measures visual stability. Improved by always specifying explicit width and height aspect ratios on images and video containers, reserving space for dynamic ad banners, and using font-display: optional or size-adjust to prevent FOIT/FOUT font jumping.",
      keyTalkingPoints: [
        "LCP (<2.5s): Image optimization, priority loading, edge caching",
        "INP (<200ms): Task chunking, React 18 useTransition, non-blocking rendering",
        "CLS (<0.1): Explicit aspect ratio placeholders, font size-adjust metric overrides",
        "Continuous monitoring using Chrome User Experience Report (CrUX) and Lighthouse CI",
      ],
    },
    {
      category: "Web Security & Authentication Architecture",
      question: "How do you securely implement JWT-based authentication in a modern single-page or SSR application to defend against both XSS and CSRF attacks?",
      idealAnswer: "Never store JWT access tokens in localStorage or sessionStorage because any Cross-Site Scripting (XSS) vulnerability can allow malicious scripts to read and exfiltrate the token. The industry-standard approach is a two-token system:\n1) Access Token: Short-lived (e.g. 15 minutes) containing minimal user claims, stored in application memory (React state) or in an HTTP-only, Secure, SameSite=Lax cookie.\n2) Refresh Token: Long-lived (e.g. 7 days), stored strictly in an HTTP-only, Secure, SameSite=Strict cookie with a restricted path (e.g. /api/auth/refresh).\nTo defend against CSRF on state-changing requests, we use SameSite cookies combined with custom CSRF token verification (Double Submit Cookie pattern) or Origin/Referer header validation on the server. Furthermore, we implement Refresh Token Rotation with automatic family invalidation: if a previously used refresh token is presented again, the server detects potential token theft and immediately revokes all sessions for that user.",
      keyTalkingPoints: [
        "Why localStorage is dangerous for tokens (vulnerable to XSS exfiltration)",
        "Short-lived access token + long-lived HTTP-only SameSite refresh token",
        "Refresh Token Rotation and automatic token family invalidation on reuse",
        "Defense-in-depth: CSP (Content Security Policy) headers and Zod input sanitization",
      ],
    },
  ]
}

interface InterviewMasteryViewProps {
  targetCareer: string
  data?: InterviewMastery
}

export function InterviewMasteryView({ targetCareer, data }: InterviewMasteryViewProps) {
  const defaultQuestions = data?.technicalQuestions && data.technicalQuestions.length > 0
    ? data.technicalQuestions
    : getInterviewQuestionsForCareer(targetCareer)

  // Expand all questions by default so user can immediately read them
  const initialExpanded: Record<number, boolean> = {}
  defaultQuestions.forEach((_, idx) => {
    initialExpanded[idx] = true
  })

  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>(initialExpanded)
  const [filterCategory, setFilterCategory] = useState<string>("All")
  const [allExpanded, setAllExpanded] = useState<boolean>(true)

  const toggleQuestion = (idx: number) => {
    setExpandedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const toggleExpandAll = () => {
    const nextState = !allExpanded
    setAllExpanded(nextState)
    const updated: Record<number, boolean> = {}
    defaultQuestions.forEach((_, idx) => {
      updated[idx] = nextState
    })
    setExpandedIndices(updated)
  }

  const categories = ["All", ...Array.from(new Set(defaultQuestions.map((q) => q.category)))]
  const filteredQuestions = filterCategory === "All"
    ? defaultQuestions
    : defaultQuestions.filter((q) => q.category === filterCategory)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
      {/* Horizon Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          backgroundColor: "#f5f3ff",
          border: "1px solid #ddd6fe",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 4,
                backgroundColor: "#ede9fe",
                color: "#6d28d9",
                border: "1px solid #ddd6fe",
              }}
            >
              12 Months Horizon
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6d28d9" }}>
              Technical Interview Mastery
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1c1917", margin: "6px 0 2px" }}>
            Technical Interview Questions to Land the Job for {targetCareer}
          </h2>
          <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>
            Master senior-level technical Q&A, system design architecture, live outage troubleshooting, and core concepts to ace your interviews.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={toggleExpandAll}
            style={{
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              backgroundColor: "#fff",
              color: "#6d28d9",
              border: "1px solid #c4b5fd",
              cursor: "pointer",
            }}
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6d28d9", fontWeight: 600 }}>
            <Briefcase size={16} /> {filteredQuestions.length} Interview Questions
          </div>
        </div>
      </div>

      {/* Technical Interview Q&A Section — Focused ONLY on Interview Questions */}
      <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e7e2da", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#44403c" }}>
            Filter Questions by Domain:
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map((cat) => {
              const isSelected = filterCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? "#7c3aed" : "#faf8f5",
                    color: isSelected ? "#fff" : "#57534e",
                    border: isSelected ? "1px solid #7c3aed" : "1px solid #e7e2da",
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Questions Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredQuestions.map((q, idx) => {
            const isExpanded = !!expandedIndices[idx]
            return (
              <div
                key={idx}
                style={{
                  borderRadius: 10,
                  border: isExpanded ? "1px solid #c4b5fd" : "1px solid #e7e2da",
                  backgroundColor: isExpanded ? "#faf5ff" : "#faf8f5",
                  overflow: "hidden",
                  transition: "border 0.15s ease",
                }}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleQuestion(idx)}
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 4,
                        backgroundColor: "#ede9fe",
                        color: "#6d28d9",
                        flexShrink: 0,
                      }}
                    >
                      {q.category}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>
                      Q{idx + 1}: {q.question}
                    </span>
                  </div>

                  {isExpanded ? <ChevronUp size={16} style={{ color: "#7c3aed", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "#a8a29e", flexShrink: 0 }} />}
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "16px 20px 20px",
                      backgroundColor: "#fff",
                      borderTop: "1px solid #ede9fe",
                    }}
                  >
                    {/* Ideal Answer */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6d28d9", letterSpacing: 0.5, marginBottom: 4 }}>
                        Ideal Model Answer (How to Respond)
                      </div>
                      <div style={{ fontSize: 13, color: "#292524", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                        {q.idealAnswer}
                      </div>
                    </div>

                    {/* Key Talking Points */}
                    {q.keyTalkingPoints && q.keyTalkingPoints.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#059669", letterSpacing: 0.5, marginBottom: 6 }}>
                          Key Points to Hit Verbally
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {q.keyTalkingPoints.map((point, pIdx) => (
                            <div key={pIdx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#44403c" }}>
                              <CheckCircle2 size={13} style={{ color: "#059669", flexShrink: 0, marginTop: 2 }} />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code or Diagram Snippet */}
                    {q.codeSnippetOrDiagram && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#78716c", letterSpacing: 0.5, marginBottom: 4 }}>
                          Code Snippet / Architecture Blueprint
                        </div>
                        <pre
                          style={{
                            backgroundColor: "#1c1917",
                            color: "#f5f5f4",
                            padding: 14,
                            borderRadius: 8,
                            fontSize: 11,
                            fontFamily: "monospace",
                            overflowX: "auto",
                            lineHeight: 1.5,
                            margin: 0,
                          }}
                        >
                          {q.codeSnippetOrDiagram}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
