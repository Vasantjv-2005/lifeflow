"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleHelp,
  Clock3,
  ExternalLink,
  GitBranch,
  ListPlus,
  Play,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  createSimulation,
  deleteSimulation,
  getSimulationById,
  getSimulations,
  runAdHocSimulation,
  runSimulationById,
  updateSimulation,
  type Simulation,
  type SimulationEdge,
  type SimulationEngineResult,
  type SimulationNode,
} from "@/lib/api"
import { PageFrame } from "@/components/lifeflow-dashboard"

type FlowData = { title: string; description?: string }

function FlowCard({ data, type }: NodeProps<Node<FlowData>>) {
  const typeLabel =
    type === "start"
      ? "STARTING POINT"
      : type === "decision"
      ? "DECISION NODE"
      : type === "action"
      ? "ACTION STEP"
      : "OUTCOME NODE"

  return (
    <div className={`flow-card flow-${type}`}>
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <span className="flow-type">{typeLabel}</span>
      <strong>{data.title}</strong>
      {data.description && <small>{data.description}</small>}
      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  )
}

const nodeTypes = {
  start: FlowCard,
  decision: FlowCard,
  action: FlowCard,
  outcome: FlowCard,
}

// Clean default template for new simulations
const defaultTemplateNodes: Node<FlowData>[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 80, y: 160 },
    data: { title: "Initial Decision", description: "Current situation" },
  },
  {
    id: "choice-1",
    type: "decision",
    position: { x: 380, y: 160 },
    data: { title: "Evaluate Options", description: "Select pathway" },
  },
  {
    id: "outcome-1",
    type: "outcome",
    position: { x: 680, y: 160 },
    data: { title: "Desired Result", description: "Goal achievement" },
  },
]

const defaultTemplateEdges: Edge[] = [
  {
    id: "edge-start-choice",
    source: "start-1",
    target: "choice-1",
    animated: true,
    label: "Proceed",
    style: { stroke: "#b59a7e", strokeWidth: 1.7 },
  },
  {
    id: "edge-choice-outcome",
    source: "choice-1",
    target: "outcome-1",
    label: "Success",
    style: { stroke: "#b6c4b3", strokeWidth: 1.6 },
  },
]

export interface DomainRoadmapConfig {
  jobKeywords: string
  guideHeading: string
  courses: Array<{ title: string; provider: string; url: string; badge: string }>
  phase1: { title: string; desc: string }
  coursesTrack: { title: string; desc: string }
  phase2: { title: string; desc: string }
  marketAnalysis: { title: string; desc: string }
  phase4: { title: string; desc: string }
  phase5: { title: string; desc: string }
  outcomes: {
    optimistic: { title: string; desc: string }
    realistic: { title: string; desc: string }
    conservative: { title: string; desc: string }
  }
  guide: {
    languagesAndTools: string[]
    resumeRules: string[]
    interviewQuestions: Array<{ q: string; a: string }>
  }
}

export function getDomainRoadmapData(title: string, goal?: string, category?: string): DomainRoadmapConfig {
  const q = `${title} ${goal || ""} ${category || ""}`.toLowerCase()
  const cat = (category || "").toLowerCase()

  // 0A. RELATIONSHIPS & INTERPERSONAL DYNAMICS
  if (/(relationship|relationships|partner|marriage|dating|couple|family|spouse|friendship|co-living|relocate together)/i.test(q) || cat.includes("relationship")) {
    return {
      jobKeywords: "",
      guideHeading: "Relationship Harmony & Shared Living Playbook",
      courses: [
        {
          title: "The Seven Principles for Making Marriage Work",
          provider: "The Gottman Institute",
          url: "https://www.gottman.com/",
          badge: "Clinical Standard",
        },
        {
          title: "Nonviolent Communication (NVC) Framework",
          provider: "CNVC Organization",
          url: "https://www.cnvc.org/",
          badge: "Communication",
        },
        {
          title: "Crucial Conversations for Couples",
          provider: "Crucial Learning",
          url: "https://cruciallearning.com/",
          badge: "Conflict Resolution",
        },
        {
          title: "Adult Attachment Theory & Dynamics",
          provider: "Attachment Project",
          url: "https://www.attachmentproject.com/",
          badge: "Relational Safety",
        },
      ],
      phase1: {
        title: "Phase 1: Deep Values, Needs & Communication Alignment",
        desc: "Facilitate open dialogues on core personal values, future horizons, and emotional needs using NVC and Gottman active listening.",
      },
      coursesTrack: {
        title: "Curated Relationship Guides & Frameworks",
        desc: "The Gottman Institute, Nonviolent Communication (Marshall Rosenberg), Crucial Conversations, and Attachment Theory.",
      },
      phase2: {
        title: "Phase 2: Transparent Financial & Living Logistics Blueprint",
        desc: "Establish clear shared vs individual expenses, joint savings, personal space requirements, household chores, and work boundaries.",
      },
      marketAnalysis: {
        title: "Phase 3: Relational Dynamics & Weekly State of the Union",
        desc: "Implement weekly 20-minute check-ins using the 5:1 positive-to-negative ratio and agreed de-escalation protocols.",
      },
      phase4: {
        title: "Phase 4: Co-Living Trial Milestones & Adaptation",
        desc: "Test co-living or shared decision-making during trips or mini-trials with continuous empathy and honest feedback.",
      },
      phase5: {
        title: "Phase 5: Seamless Relocation / Harmonious Transition",
        desc: "Execute long-term living plans smoothly with balanced independence, shared traditions, and celebration rituals.",
      },
      outcomes: {
        optimistic: {
          title: "Optimistic: Flourishing Partnership & Deep Trust",
          desc: "Full emotional safety, shared life trajectory, and high compatibility across living and financial dimensions.",
        },
        realistic: {
          title: "Realistic: Balanced Step-by-Step Transition",
          desc: "Gradual logistical adaptation preserving individual independence while deepening mutual partnership.",
        },
        conservative: {
          title: "Conservative: Protected Autonomy & Clarified Compatibility",
          desc: "Independent emergency reserves maintained with honest evaluation of true long-term suitability.",
        },
      },
      guide: {
        languagesAndTools: [
          "<strong>Nonviolent Communication (NVC):</strong> 4-Step expression: Objective Observations, Authentic Feelings, Core Needs, and Actionable Requests.",
          "<strong>Gottman Method Antidotes:</strong> Replace Criticism with Gentle Start-up, Defensiveness with Responsibility, Contempt with Appreciation, and Stonewalling with Self-Soothing.",
          "<strong>Financial Transparency Blueprint:</strong> Joint operational account for shared overhead + separate individual discretionary accounts.",
          "<strong>Healthy Boundary Protocol:</strong> Preserving personal time, individual friendships, and separate quiet workspaces.",
        ],
        resumeRules: [
          "<strong>Shared Values Matrix:</strong> Align on children, finances, career sacrifices, geographic preferences, and family boundaries before cohabitating.",
          "<strong>The 5:1 Positivity Ratio:</strong> Maintain at least five positive interactions (appreciation, humor, touch) for every single critical interaction.",
          "<strong>Emotional Bank Account:</strong> Turn toward your partner's bids for connection (conversation, glances, shared meals) rather than turning away.",
        ],
        interviewQuestions: [
          {
            q: "How will we handle financial discrepancies or career sacrifices?",
            a: "Establish an equitable contributing ratio (e.g. proportional to income or equal baseline) and agree on how career relocations are mutually decided.",
          },
          {
            q: "What is our protocol when disagreements become emotionally heated?",
            a: "Agree on a designated 20-minute 'time-out' pause when pulse rates elevate, with a firm commitment to reconvene calmly to repair.",
          },
          {
            q: "How do we protect individual autonomy and personal space when living together?",
            a: "Define designated private zones or solo time blocks each week where each partner can recharge without obligation.",
          },
        ],
      },
    }
  }

  // 0B. HEALTH & WELLBEING
  if (/(health|fitness|wellness|wellbeing|weight|nutrition|workout|mental health|sleep|diet|exercise|therapy)/i.test(q) || cat.includes("health") || cat.includes("wellbeing")) {
    return {
      jobKeywords: "",
      guideHeading: "Health, Vitality & Wellness Protocol Playbook",
      courses: [
        {
          title: "Foundational Health & Sleep Toolkits",
          provider: "Huberman Lab",
          url: "https://www.hubermanlab.com/",
          badge: "Neurobiology",
        },
        {
          title: "Metabolic Nutrition & Habit Science",
          provider: "Precision Nutrition",
          url: "https://www.precisionnutrition.com/",
          badge: "Evidence-Based",
        },
        {
          title: "Resistance Training & Hypertrophy",
          provider: "Stronger by Science",
          url: "https://www.strongerbyscience.com/",
          badge: "Exercise Science",
        },
        {
          title: "Mindfulness-Based Stress Reduction",
          provider: "Palouse Mindfulness",
          url: "https://palousemindfulness.com/",
          badge: "MBSR Standard",
        },
      ],
      phase1: {
        title: "Phase 1: Baseline Health Audit & Nutrition Structure",
        desc: "Complete metabolic blood panel, determine caloric needs and protein targets (1.6g/kg), prioritize whole unprocessed foods, and daily 2.5L water.",
      },
      coursesTrack: {
        title: "Curated Scientific Health & Fitness Resources",
        desc: "Huberman Lab sleep toolkits, Precision Nutrition, Stronger by Science, and evidence-based clinical physiology.",
      },
      phase2: {
        title: "Phase 2: Progressive Resistance & Zone 2 Cardio",
        desc: "3-4 weekly hypertrophy/strength training sessions with tracked progressive overload + 120 minutes of weekly Zone 2 aerobic base.",
      },
      marketAnalysis: {
        title: "Phase 3: Circadian Light & Sleep Architecture",
        desc: "Morning outdoor sunlight within 30 min of waking, consistent sleep schedule, and 60-min pre-bed blue light elimination.",
      },
      phase4: {
        title: "Phase 4: Stress Recovery & Biomarker Calibration",
        desc: "Track resting heart rate and HRV, incorporate daily deliberate decompression or mindfulness, and evaluate physical improvements.",
      },
      phase5: {
        title: "Phase 5: Sustainable Lifelong Habit Integration",
        desc: "Automate routines to ensure lifelong adherence without burnout or extreme deprivation.",
      },
      outcomes: {
        optimistic: {
          title: "Optimistic: Peak Metabolic Vitality & Energy",
          desc: "Transformed body composition, normalized biomarkers, high cognitive clarity, and sustained daily stamina.",
        },
        realistic: {
          title: "Realistic: Sustainable Daily Healthy Lifestyle",
          desc: "Consistent 3-4x weekly workouts, balanced home meals, and reliable restorative sleep habits.",
        },
        conservative: {
          title: "Conservative: Restored Baseline & Injury Prevention",
          desc: "Gradual movement, safe mobility restoration, and injury-free progression.",
        },
      },
      guide: {
        languagesAndTools: [
          "<strong>Progressive Overload:</strong> Adding small increments of load, reps, or volume weekly while maintaining strict form.",
          "<strong>Protein Pacing:</strong> 1.6-2.2 grams of protein per kilogram of bodyweight distributed across 3-4 meals.",
          "<strong>Sleep Architecture:</strong> 7-9 hours of nightly sleep prioritizing deep sleep and REM cycles through temperature control and darkness.",
          "<strong>Zone 2 Aerobic Base:</strong> Conversational-pace cardio (walking, cycling, rowing) to improve mitochondrial density.",
        ],
        resumeRules: [
          "<strong>Consistency over Intensity:</strong> 4 moderate workouts per week executed for 6 months beats 2 weeks of extreme overtraining.",
          "<strong>Objective Tracking:</strong> Log weekly average body weight, waist circumference, strength metrics, and resting heart rate.",
          "<strong>Nutrition Quality:</strong> Prioritize 80%+ single-ingredient whole foods before worrying about micro-supplements.",
        ],
        interviewQuestions: [
          {
            q: "How do I overcome workout inconsistency when work gets busy?",
            a: "Default to a minimum viable workout: 20 minutes of high-leverage compound movements or brisk incline walking instead of skipping entirely.",
          },
          {
            q: "What is the most effective lever for mental clarity and fat loss?",
            a: "Prioritize consistent 8-hour sleep and whole-food protein targets; poor sleep spikes ghrelin (hunger) and degrades executive function.",
          },
        ],
      },
    }
  }

  // 1. ARTIFICIAL INTELLIGENCE / MACHINE LEARNING / DATA SCIENCE
  if (/(ai|artificial intelligence|machine learning|deep learning|data science|data scientist|data analyst|nlp|llm|computer vision|genai)/i.test(q)) {
    return {
      jobKeywords: "AI Machine Learning Engineer",
      guideHeading: "AI & Machine Learning Playbook",
      courses: [
        {
          title: "Machine Learning Specialization",
          provider: "DeepLearning.AI (Andrew Ng)",
          url: "https://www.coursera.org/specializations/machine-learning-introduction",
          badge: "Gold Standard",
        },
        {
          title: "Practical Deep Learning for Coders",
          provider: "fast.ai",
          url: "https://course.fast.ai/",
          badge: "Open Source PyTorch",
        },
        {
          title: "Kaggle Applied Micro-Courses",
          provider: "Kaggle Learn",
          url: "https://www.kaggle.com/learn",
          badge: "Hands-on Data",
        },
        {
          title: "CS229 Machine Learning",
          provider: "Stanford Online",
          url: "https://cs229.stanford.edu/",
          badge: "Theoretical Rigor",
        },
      ],
      phase1: {
        title: "Phase 1: Python, Math & Data Science Foundations",
        desc: "Python (NumPy, Pandas, Vectorization), Linear Algebra (Eigenvalues), Calculus (Gradients), Probability & Statistics, SQL data analysis",
      },
      coursesTrack: {
        title: "Curated ML Courses & Platforms",
        desc: "DeepLearning.AI (Andrew Ng), fast.ai, Kaggle Learn, Stanford CS229. Portals: LinkedIn AI, Internshala ML, Wellfound Startups.",
      },
      phase2: {
        title: "Phase 2: PyTorch & Deep Learning Models",
        desc: "Scikit-Learn (Trees, Ensembles), PyTorch (Neural Networks, Backpropagation, CNNs for Vision, Transformers & Hugging Face)",
      },
      marketAnalysis: {
        title: "Phase 3: AI Market Intel (LinkedIn & Naukri)",
        desc: "High global hiring demand for AI/ML engineers with PyTorch, FastAPI microservices, and RAG architectures.",
      },
      phase4: {
        title: "Phase 4: 3 GenAI Production Capstones",
        desc: "1) RAG with Vector DB (Pinecone/Chroma), 2) Fine-tuned Open LLM for domain classification, 3) FastAPI inference pipeline with Docker & MLflow",
      },
      phase5: {
        title: "Phase 5: ATS Resume & Crucial AI Interview Prep",
        desc: "Metrics-driven resume (latency <120ms, accuracy, ROC-AUC). Top interview prep: Bias-variance, Transformers, HNSW, LayerNorm.",
      },
      outcomes: {
        optimistic: {
          title: "Optimistic: AI/ML Engineer Offer (6 Months)",
          desc: "Offer secured at leading AI product company with competitive compensation & live Hugging Face capstones.",
        },
        realistic: {
          title: "Realistic: Associate ML Engineer / Data Analyst (6-8 Mo)",
          desc: "Transition into data/AI team with verified modeling, pipeline automation, and interview readiness.",
        },
        conservative: {
          title: "Conservative: Paid Data Internship & Bridge",
          desc: "Paid data analyst / annotation internship via Internshala or LinkedIn to build verified production proof.",
        },
      },
      guide: {
        languagesAndTools: [
          "<strong>Core Languages & Math:</strong> Python 3.11+ (OOP, Vectorized operations), SQL (Complex queries, Window functions), Linear Algebra, Multivariate Calculus, Probability & Statistics.",
          "<strong>ML Libraries & Frameworks:</strong> NumPy, Pandas, Scikit-Learn, Matplotlib, Seaborn, XGBoost, LightGBM.",
          "<strong>Deep Learning & GenAI:</strong> PyTorch, Hugging Face Transformers, LangChain, LlamaIndex, Vector DBs (Chroma, Pinecone, FAISS).",
          "<strong>Deployment & MLOps:</strong> FastAPI, Docker, MLflow, Git/GitHub, Hugging Face Spaces, Weights & Biases.",
        ],
        resumeRules: [
          "<strong>1-Page ATS Single-Column:</strong> Clean layout formatted for ATS parsers without nested tables.",
          "<strong>Quantified Model Metrics:</strong> Lead with business outcomes: <em>&quot;Architected RAG system with Vector DB reducing retrieval latency by 45% (&lt;90ms) over 40,000 documents&quot;</em>.",
          "<strong>Live Proof of Work:</strong> Include clickable links to interactive Hugging Face Spaces demos and public GitHub repositories.",
          "<strong>Technical Stack Section:</strong> Neatly group: Languages (Python, SQL), Libraries (PyTorch, Scikit-Learn, Pandas), Tools (FastAPI, Docker, Git).",
        ],
        interviewQuestions: [
          {
            q: "Q1: Explain the Bias-Variance Tradeoff and how to mitigate overfitting.",
            a: "High bias causes underfitting (oversimplified assumptions); high variance causes overfitting (modeling training noise). Mitigate with L1/L2 regularization, dropout, cross-validation, and pruning.",
          },
          {
            q: "Q2: How does the Transformer Self-Attention mechanism work mathematically?",
            a: "Attention computes Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. Scaled dot-product allows each token to dynamically weight relationships across the entire context sequence.",
          },
          {
            q: "Q3: What is the difference between HNSW and IVFFlat vector indexing?",
            a: "IVFFlat partitions the vector space into Voronoi cells via k-means clustering (low memory, moderate recall). HNSW constructs a multi-layer graph hierarchy providing ultra-fast nearest-neighbor search with high recall.",
          },
          {
            q: "Q4: How do you address vanishing gradients in deep networks?",
            a: "Use non-saturating activations (ReLU/GELU), residual connections (ResNet skips), Layer Normalization, and proper weight initialization (He/Xavier).",
          },
          {
            q: "Q5: When should you use ROC-AUC vs PR-AUC (Precision-Recall)?",
            a: "Use ROC-AUC for balanced class distributions. Use PR-AUC when dealing with heavy class imbalances (e.g. fraud detection or rare medical diagnosis), where true negatives dominate.",
          },
        ],
      },
    }
  }

  // 2. CLOUD INFRASTRUCTURE, DEVOPS & SRE
  if (/(devops|cloud|aws|azure|gcp|docker|kubernetes|terraform|sre|platform engineering|sysadmin)/i.test(q)) {
    return {
      jobKeywords: "DevOps Cloud Engineer",
      guideHeading: "Cloud & DevOps Engineering Playbook",
      courses: [
        {
          title: "Introduction to Linux (LFS101x)",
          provider: "Linux Foundation",
          url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
          badge: "Official Track",
        },
        {
          title: "Docker & Kubernetes Full Course",
          provider: "freeCodeCamp",
          url: "https://www.freecodecamp.org/news/kubernetes-course/",
          badge: "Hands-on Labs",
        },
        {
          title: "AWS Solutions Architect Track",
          provider: "AWS Skill Builder",
          url: "https://explore.skillbuilder.aws/",
          badge: "AWS Official",
        },
        {
          title: "Terraform Associate Certification",
          provider: "HashiCorp",
          url: "https://developer.hashicorp.com/terraform/tutorials",
          badge: "IaC Standard",
        },
      ],
      phase1: {
        title: "Phase 1: Linux Kernel, Shell Scripting & Networking",
        desc: "Linux system administration, Bash automation, TCP/IP, DNS, SSL/TLS, reverse proxies (Nginx), and Git branching strategies",
      },
      coursesTrack: {
        title: "Curated DevOps Labs & Certifications",
        desc: "Linux Foundation LFS101x, freeCodeCamp Docker/K8s, AWS Skill Builder, HashiCorp Terraform Tutorials. Portals: LinkedIn, Wellfound.",
      },
      phase2: {
        title: "Phase 2: Docker Containers & Kubernetes (K8s)",
        desc: "Multi-stage Docker builds, image hardening, Kubernetes architecture (Pods, Deployments, Services, Ingress, Helm Charts, ConfigMaps)",
      },
      marketAnalysis: {
        title: "Phase 3: Cloud Market Intel (AWS / Terraform)",
        desc: "78% of enterprise infrastructure roles require Docker, Kubernetes, Terraform IaC, and cloud provider certification.",
      },
      phase4: {
        title: "Phase 4: GitOps & CI/CD Infrastructure Capstone",
        desc: "Automated end-to-end CI/CD with GitHub Actions, ArgoCD, Terraform VPC/EKS provisioning on AWS, Prometheus & Grafana telemetry",
      },
      phase5: {
        title: "Phase 5: ATS Resume & DevOps Interview Cracking",
        desc: "Highlight AWS Solutions Architect or CKA credentials. Master: Pod lifecycle, Zero-downtime deployments, Terraform drift, DNS debugging.",
      },
      outcomes: {
        optimistic: {
          title: "Optimistic: DevOps / Cloud Engineer Offer (6 Months)",
          desc: "Secure high-value DevOps role managing production cloud infrastructure with automated CI/CD pipelines.",
        },
        realistic: {
          title: "Realistic: Junior Cloud Operations / SysAdmin (6-8 Mo)",
          desc: "Successful transition into cloud operations with certified AWS/Kubernetes foundations.",
        },
        conservative: {
          title: "Conservative: IT Infrastructure Support Bridge",
          desc: "Enter through IT systems administration or cloud helpdesk to build production operational credibility.",
        },
      },
      guide: {
        languagesAndTools: [
          "<strong>Operating Systems & Scripting:</strong> Linux (Ubuntu/Debian, RHEL), Bash/Shell scripting, Python for automation.",
          "<strong>Containers & Orchestration:</strong> Docker, Docker Compose, Kubernetes (K8s), Helm, containerd.",
          "<strong>Infrastructure as Code & Cloud:</strong> Terraform, Ansible, AWS (EC2, S3, IAM, VPC, EKS, RDS) or Azure/GCP.",
          "<strong>CI/CD & Observability:</strong> GitHub Actions, GitLab CI, ArgoCD (GitOps), Prometheus, Grafana, ELK Stack.",
        ],
        resumeRules: [
          "<strong>1-Page ATS Single-Column:</strong> Simple layout optimized for technical recruiter screening.",
          "<strong>Production SLA & Deployment Metrics:</strong> <em>&quot;Automated deployment pipeline via GitHub Actions &amp; Terraform, cutting release cycle from 3 hours to 8 minutes with 99.9% uptime&quot;</em>.",
          "<strong>Certifications First:</strong> Display AWS Certified Solutions Architect, CKA (Certified Kubernetes Administrator), or Terraform Associate prominently.",
        ],
        interviewQuestions: [
          {
            q: "Q1: What happens during a Kubernetes Pod CrashLoopBackOff and how do you debug it?",
            a: "The container starts, fails, and exits repeatedly. Debug using: 1) kubectl describe pod <name> for OOMKilled or config errors, 2) kubectl logs <name> --previous for application stack traces, 3) verify readiness/liveness probes.",
          },
          {
            q: "Q2: Compare Blue-Green vs Canary Deployment strategies.",
            a: "Blue-Green maintains two identical environments and switches traffic instantly via DNS/router (instant rollback, 2x cost). Canary routes a small percentage (e.g. 5%) of traffic to the new version to validate before 100% rollout.",
          },
          {
            q: "Q3: How does Terraform manage state and drift detection?",
            a: "Terraform maps configuration to real-world resources via terraform.tfstate (stored remotely with S3 + DynamoDB locking). terraform plan compares the real infrastructure state against the state file to identify drift.",
          },
          {
            q: "Q4: How do you achieve zero-downtime database schema migrations?",
            a: "Use the expand-contract pattern: 1) Expand by adding the new column/table alongside the old, 2) Dual-write to both, 3) Backfill historical data, 4) Switch reads to new column, 5) Contract by dropping the old column.",
          },
        ],
      },
    }
  }

  // 3. MOBILE APP DEVELOPMENT (FLUTTER / REACT NATIVE / IOS / ANDROID)
  if (/(mobile|flutter|react native|ios|swift|android|kotlin|app dev)/i.test(q)) {
    return {
      jobKeywords: "Mobile App Developer",
      guideHeading: "Mobile App Development Playbook",
      courses: [
        {
          title: "Flutter & Dart Complete Guide",
          provider: "Flutter.dev",
          url: "https://docs.flutter.dev/get-started/codelab",
          badge: "Google Official",
        },
        {
          title: "React Native Core Architecture",
          provider: "React Native Docs",
          url: "https://reactnative.dev/docs/getting-started",
          badge: "Open Source",
        },
        {
          title: "Develop in Swift Tutorials",
          provider: "Apple Developer",
          url: "https://developer.apple.com/tutorials/develop-in-swift",
          badge: "Apple Official",
        },
        {
          title: "Android Basics in Kotlin",
          provider: "Google Developers",
          url: "https://developer.android.com/courses/android-basics-kotlin/course",
          badge: "Android Official",
        },
      ],
      phase1: {
        title: "Phase 1: Mobile UI Architecture & State Management",
        desc: "Flutter & Dart or React Native & TypeScript. Responsive layouts, navigation routers, state management (Bloc/Provider or Zustand)",
      },
      coursesTrack: {
        title: "Official Mobile Guides & Learning Tracks",
        desc: "Flutter.dev Official Codelab, React Native Documentation, Apple Develop in Swift, Google Android Kotlin. Portals: LinkedIn, Internshala.",
      },
      phase2: {
        title: "Phase 2: Native APIs, Local SQLite & Offline Sync",
        desc: "Camera, GPS geolocation, push notifications, offline local database (Hive/SQLite/WatermelonDB), background synchronization",
      },
      marketAnalysis: {
        title: "Phase 3: Mobile Market Intel (iOS & Android)",
        desc: "High demand for cross-platform developers capable of shipping store-ready apps with smooth 60fps animations.",
      },
      phase4: {
        title: "Phase 4: 2 Published Apps on App Store & Play Store",
        desc: "Build, sign, and publish 2 production mobile applications: 1) Real-time collaborative mobile tool, 2) Full booking/e-commerce app",
      },
      phase5: {
        title: "Phase 5: ATS Resume & Mobile Developer Interview Prep",
        desc: "1-page ATS resume with direct Play Store / TestFlight download badges. Master: Widget lifecycle, JSI bridge, memory leaks, push alerts.",
      },
      outcomes: {
        optimistic: {
          title: "Optimistic: Mobile App Developer Offer (6 Months)",
          desc: "Secure mobile developer position with live published apps on Google Play Store and Apple App Store.",
        },
        realistic: {
          title: "Realistic: Junior Mobile Engineer (6-8 Months)",
          desc: "Transition into mobile team with validated cross-platform architecture and clean UI portfolio.",
        },
        conservative: {
          title: "Conservative: Mobile Freelance / Internship Bridge",
          desc: "Build client apps or secure mobile internships on Internshala to gain verified commercial production proof.",
        },
      },
      guide: {
        languagesAndTools: [
          "<strong>Cross-Platform Frameworks:</strong> Flutter (Dart), React Native (TypeScript, JavaScript).",
          "<strong>Native Languages:</strong> Swift / SwiftUI (iOS), Kotlin / Jetpack Compose (Android).",
          "<strong>Local Storage & Backend:</strong> SQLite, Hive, Realm, Firebase (Auth, Firestore, Cloud Messaging), REST APIs.",
          "<strong>Mobile Tooling & CI:</strong> Xcode, Android Studio, Fastlane, GitHub Actions for Mobile CI/CD, TestFlight, Play Console.",
        ],
        resumeRules: [
          "<strong>Direct Store Links:</strong> Prominently include clickable badges to live Google Play Store and iOS App Store apps.",
          "<strong>Performance Metrics:</strong> <em>&quot;Optimized mobile app rendering to maintain stable 60fps across 15+ low-end Android devices with 4.8-star rating&quot;</em>.",
          "<strong>Clean Architecture:</strong> Emphasize MVVM / BLoC separation and thorough unit test coverage.",
        ],
        interviewQuestions: [
          {
            q: "Q1: Explain the Flutter Widget Lifecycle (or React Native component lifecycle).",
            a: "In Flutter: createState ➔ initState ➔ didChangeDependencies ➔ build ➔ didUpdateWidget ➔ deactivate ➔ dispose. Expensive operations should always run in initState and cleanup in dispose.",
          },
          {
            q: "Q2: How does the new React Native Architecture (Fabric & TurboModules) improve performance?",
            a: "It replaces the asynchronous JSON bridge with the JavaScript Interface (JSI), allowing C++ and JavaScript to invoke native methods directly in memory synchronously without serialization overhead.",
          },
          {
            q: "Q3: How do you identify and fix memory leaks in mobile applications?",
            a: "Use Dart DevTools or Xcode Instruments / Android Profiler to inspect memory allocation graphs. Common culprits: uncancelled stream subscriptions, unremoved event listeners, and holding static contexts.",
          },
        ],
      },
    }
  }

  // 4. CYBERSECURITY & ETHICAL HACKING
  if (/(cyber|security|hacking|penetration|infosec|soc|ethical hack|network security)/i.test(q)) {
    return {
      jobKeywords: "Cybersecurity Analyst",
      guideHeading: "Cybersecurity & Defense Playbook",
      courses: [
        {
          title: "Pre-Security & Beginner Path",
          provider: "TryHackMe",
          url: "https://tryhackme.com/",
          badge: "Interactive Labs",
        },
        {
          title: "Web Security Academy",
          provider: "PortSwigger",
          url: "https://portswigger.net/web-security",
          badge: "Burp Suite Labs",
        },
        {
          title: "CompTIA Security+ Series",
          provider: "Professor Messer",
          url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/",
          badge: "Certification",
        },
        {
          title: "HTB Academy Penetration Testing",
          provider: "Hack The Box",
          url: "https://academy.hackthebox.com/",
          badge: "Pro Labs",
        },
      ],
      phase1: {
        title: "Phase 1: Linux, Networking Protocols & Scripting",
        desc: "OSI model, TCP/IP, packet analysis with Wireshark, Linux kernel administration, Python & Bash socket programming and automation",
      },
      coursesTrack: {
        title: "Hands-on Security Academies & Certifications",
        desc: "TryHackMe Pre-Security, PortSwigger Web Security Academy, Professor Messer CompTIA Security+, Hack The Box. Portals: LinkedIn, Naukri.",
      },
      phase2: {
        title: "Phase 2: Web App Security & OWASP Top 10",
        desc: "Hands-on exploitation: SQL injection, XSS, CSRF, SSRF, IDOR, authentication bypass using Burp Suite and PortSwigger labs",
      },
      marketAnalysis: {
        title: "Phase 3: Security Operations & SOC Demand",
        desc: "Zero unemployment rate across enterprise cybersecurity; massive recruiter search volume for Security+ and certified analysts.",
      },
      phase4: {
        title: "Phase 4: Network Penetration & Active Directory Labs",
        desc: "Metasploit, Nmap reconnaissance, privilege escalation (Linux/Windows), Active Directory attacks on TryHackMe / Hack The Box",
      },
      phase5: {
        title: "Phase 5: ATS Resume, Security+ & Interview Prep",
        desc: "Highlight CompTIA Security+ or eJPT. Master: Encryption algorithms, SQLi vs XSS mitigation, PICERL incident response, Wireshark logs.",
      },
      outcomes: {
        optimistic: {
          title: "Optimistic: Penetration Tester / SOC Analyst (6 Mo)",
          desc: "Secure offensive or defensive cybersecurity role with verified lab rankings and industry certification.",
        },
        realistic: {
          title: "Realistic: Junior Information Security Associate (6-8 Mo)",
          desc: "Transition into security operations center (SOC) handling incident triage and vulnerability scanning.",
        },
        conservative: {
          title: "Conservative: IT Network Security Support Bridge",
          desc: "Enter through IT network administration or hardware support to build foundational infrastructure defense credentials.",
        },
      },
      guide: {
        languagesAndTools: [
          "<strong>Operating Systems:</strong> Kali Linux, Parrot OS, Windows Server / Active Directory.",
          "<strong>Security Tools:</strong> Burp Suite Pro/Community, Wireshark, Nmap, Metasploit, Nessus, Ghidra, John the Ripper.",
          "<strong>Scripting & Automation:</strong> Python (Scapy, requests, socket), Bash, PowerShell for security automation.",
          "<strong>Certifications:</strong> CompTIA Security+, eJPT, CEH, BTL1, OSCP (advanced).",
        ],
        resumeRules: [
          "<strong>Lab Rankings & CVEs:</strong> Highlight TryHackMe top 5% or Hack The Box profile badges prominently.",
          "<strong>Write-ups & Disclosures:</strong> Link to detailed vulnerability write-ups or responsible disclosure confirmations.",
          "<strong>Certifications Section:</strong> List CompTIA Security+ or vendor credentials with verification IDs.",
        ],
        interviewQuestions: [
          {
            q: "Q1: Explain the difference between Symmetric and Asymmetric encryption, and how TLS uses both.",
            a: "Symmetric uses one shared key for encryption/decryption (fast: AES). Asymmetric uses public/private key pairs (slow: RSA/ECC). TLS uses asymmetric encryption for key exchange and authentication, then switches to symmetric AES for bulk session data.",
          },
          {
            q: "Q2: How do you properly prevent SQL Injection and Cross-Site Scripting (XSS)?",
            a: "SQL Injection: Use parameterized queries / prepared statements (never string concatenation) and ORMs. XSS: Context-aware output encoding, sanitize HTML with DOMPurify, set Content-Security-Policy (CSP) headers, and use HTTP-only cookies.",
          },
          {
            q: "Q3: Walk through the NIST / PICERL Incident Response lifecycle.",
            a: "Preparation ➔ Identification (detection & triage) ➔ Containment (isolation of infected host) ➔ Eradication (root cause removal) ➔ Recovery (restoration to production) ➔ Lessons Learned (post-mortem).",
          },
        ],
      },
    }
  }

  // 5. FULL STACK / WEB DEVELOPMENT (when user explicitly requests developer / coding)
  if (/(full stack|full-stack|frontend|backend|web dev|javascript|react|node|typescript|mern|software|coding|programming|developer)/i.test(q)) {
    return {
      jobKeywords: "Full Stack Developer",
      guideHeading: "Full-Stack & Web Engineering Playbook",
      courses: [
        {
          title: "Full Stack Open",
          provider: "Univ. of Helsinki",
          url: "https://fullstackopen.com/en/",
          badge: "100% Free",
        },
        {
          title: "Full Stack JavaScript",
          provider: "The Odin Project",
          url: "https://www.theodinproject.com/",
          badge: "Open Source",
        },
        {
          title: "Full Stack Certifications",
          provider: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          badge: "Interactive",
        },
        {
          title: "CS50 Web Programming",
          provider: "Harvard CS50",
          url: "https://cs50.harvard.edu/web/",
          badge: "Architecture & Scale",
        },
      ],
      phase1: {
        title: "Phase 1: Frontend Foundations & Languages",
        desc: "HTML5 (Semantics, SEO), CSS3/Tailwind, JavaScript ES6+ (Closures, Event Loop, Async/Await), TypeScript, React, Next.js",
      },
      coursesTrack: {
        title: "Curated Market Courses & Portals",
        desc: "FullStackOpen (Helsinki), The Odin Project, freeCodeCamp, CS50 Web. Portals: LinkedIn, Naukri, Internshala, Wellfound.",
      },
      phase2: {
        title: "Phase 2: Backend Architecture & Databases",
        desc: "Node.js (Async I/O), Express.js REST APIs, MongoDB (Mongoose Schemas & Indexing), JWT Auth, Postman testing",
      },
      marketAnalysis: {
        title: "Phase 3: Market Analysis (LinkedIn & Naukri)",
        desc: "82% demand React+Node+MongoDB. Top recruiter filters: REST APIs, Docker, Git, live URLs, LeetCode Easy/Med.",
      },
      phase4: {
        title: "Phase 4: 3 Deployed Capstone Projects",
        desc: "Build 3 production apps: E-Commerce (Stripe), Real-Time Chat (WebSockets), LifeFlow AI app. Deploy on Vercel & Render.",
      },
      phase5: {
        title: "Phase 5: ATS Resume & Interview Cracking",
        desc: "1-page ATS template, quantified STAR bullets. Master: Event Loop, Closures, React hooks, DB indexing, JWT security.",
      },
      outcomes: {
        optimistic: {
          title: "Optimistic: Fast-Track Offer (6 Months)",
          desc: "Full-Stack Developer role secured with competitive junior/mid-level offer & 3 live capstone projects.",
        },
        realistic: {
          title: "Realistic: Steady Placement (6-8 Months)",
          desc: "Target developer role secured with solid practical foundations and validated interview performance.",
        },
        conservative: {
          title: "Conservative: Paid Internship & Bridge",
          desc: "Paid web dev internship via Internshala/LinkedIn or contract bridge to gain verified production experience.",
        },
      },
      guide: {
        languagesAndTools: [
          "<strong>Core Languages:</strong> HTML5 (Semantics, Accessibility), CSS3 &amp; Tailwind CSS, JavaScript ES6+ (Closures, Event Loop, Async/Await), TypeScript (Strict types, Interfaces).",
          "<strong>Frontend:</strong> React.js (Hooks: useState, useEffect, useCallback, useMemo), Next.js (App Router, Server Components).",
          "<strong>Backend &amp; DB:</strong> Node.js (Async I/O), Express.js (REST APIs, Middleware, Error Handling), MongoDB (Mongoose Schemas, Document modeling, Indexing, Aggregation).",
          "<strong>Auth &amp; Tools:</strong> JWT (JSON Web Tokens), bcrypt, Git/GitHub, Docker, Postman, Vercel, Render.",
        ],
        resumeRules: [
          "<strong>1-Page ATS Format:</strong> Clean single-column layout without tables or graphics that confuse ATS scanners.",
          "<strong>STAR Project Bullets:</strong> Start with strong action verbs &amp; quantify results (e.g. <em>&quot;Engineered REST API in Node.js &amp; MongoDB handling 1,000+ daily requests with &lt;60ms latency&quot;</em>).",
          "<strong>Live Proof of Work:</strong> Include clickable links to live running websites on Vercel/Render and public GitHub repos.",
          "<strong>Tech Stack Section:</strong> Neatly list Languages (JS, TS, HTML, CSS), Frameworks (React, Next.js, Node, Express), Databases (MongoDB, PostgreSQL), Tools (Git, Docker, Postman).",
        ],
        interviewQuestions: [
          {
            q: "Q1: How does the JavaScript Event Loop work?",
            a: "JS has a single call stack. Sync code executes first. Async tasks go to queues: Microtasks (Promises, queueMicrotask) run immediately before Macrotasks (setTimeout, setInterval, I/O).",
          },
          {
            q: "Q2: What is a Closure and where is it used?",
            a: "A closure is a function bundled with its lexical environment. Used for private variables, memoization, event listeners, and React custom hooks.",
          },
          {
            q: "Q3: React Virtual DOM & Reconciliation?",
            a: "React creates an in-memory Virtual DOM tree. On state changes, it diffs the new tree against the old tree (Fiber Reconciliation) to apply the minimal necessary DOM mutations.",
          },
          {
            q: "Q4: MongoDB Indexing & Query Performance?",
            a: "Indexes (B-tree) prevent full collection scans (COLLSCAN ➔ IXSCAN). Created via schema.index({ email: 1 }). Compound indexes follow Equality, Sort, Range (ESR).",
          },
          {
            q: "Q5: JWT Security & Safe Storage?",
            a: "Store tokens in HTTP-only, Secure, SameSite=Strict cookies to prevent XSS attacks (instead of vulnerable localStorage). Always verify JWT signature on protected routes.",
          },
        ],
      },
    }
  }

  // 6. GENERAL / CUSTOM GOAL (Completely tailored to whatever the user entered)
  const cleanTitle = title.length > 55 ? title.slice(0, 52) + "..." : title || "Goal Roadmap"
  const cleanGoal = goal ? (goal.length > 75 ? goal.slice(0, 72) + "..." : goal) : "Define core constraints and target milestones"

  return {
    jobKeywords: title ? title.slice(0, 30) : "Career Opportunities",
    guideHeading: `${cleanTitle.slice(0, 32)} Strategy Playbook`,
    courses: [
      {
        title: `University Specializations for ${cleanTitle.slice(0, 24)}`,
        provider: "Coursera",
        url: `https://www.coursera.org/search?query=${encodeURIComponent(cleanTitle)}`,
        badge: "Accredited",
      },
      {
        title: `Professional Masterclasses for ${cleanTitle.slice(0, 24)}`,
        provider: "edX",
        url: `https://www.edx.org/search?q=${encodeURIComponent(cleanTitle)}`,
        badge: "University",
      },
      {
        title: "MIT OCW Foundational Open Courses",
        provider: "MIT OpenCourseWare",
        url: "https://ocw.mit.edu/",
        badge: "100% Free",
      },
      {
        title: `Industry Skill Certification for ${cleanTitle.slice(0, 24)}`,
        provider: "LinkedIn Learning",
        url: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(cleanTitle)}`,
        badge: "Industry Certified",
      },
    ],
    phase1: {
      title: `Phase 1: Foundations & Core Tools for ${cleanTitle}`,
      desc: `Master the foundational methodologies, core prerequisite tools, and study routines required to execute "${cleanGoal}"`,
    },
    coursesTrack: {
      title: "Curated Knowledge Paths & Portals",
      desc: "Top university specializations on Coursera, edX, MIT OpenCourseWare, and LinkedIn Learning. Active network sourcing.",
    },
    phase2: {
      title: "Phase 2: Applied Systems & Milestone Execution",
      desc: `Apply principles to real-world problems, build 2-3 structured deliverables, and validate output quality for "${cleanTitle}"`,
    },
    marketAnalysis: {
      title: "Phase 3: Industry Demand & Opportunity Analysis",
      desc: `Analyze market trends, hiring patterns, and competitor benchmarks on LinkedIn & professional networks for "${cleanTitle}"`,
    },
    phase4: {
      title: "Phase 4: Concrete Deliverables & Measurable Proof",
      desc: "Assemble tangible proof of work, verified case studies, or validated prototypes demonstrating domain excellence",
    },
    phase5: {
      title: "Phase 5: ATS Profile, Portfolio & Evaluation Prep",
      desc: "1-page ATS resume/portfolio highlighting quantified impact, master domain screening questions, and pitch with confidence",
    },
    outcomes: {
      optimistic: {
        title: `Optimistic: Goal Realized Ahead of Target Horizon`,
        desc: `Primary success metric achieved with maximum leverage, high clarity score, and outstanding upside.`,
      },
      realistic: {
        title: `Realistic: Steady Balanced Completion`,
        desc: `Target outcome achieved within target timeframe with methodical pacing and managed schedule constraints.`,
      },
      conservative: {
        title: `Conservative: Risk-Managed Contingency & Bridge`,
        desc: `Core progress preserved with structured contingency runway, alternative engagements, or low-risk bridges.`,
      },
    },
    guide: {
      languagesAndTools: [
        `<strong>Core Domain Competencies:</strong> Foundational frameworks, essential tools, and daily practice routines for ${cleanTitle}.`,
        `<strong>Applied Deliverables:</strong> Real-world case studies and quantifiable problem-solving evidence.`,
        `<strong>Professional Positioning:</strong> Verifiable credentials, public portfolio links, and peer reviews.`,
      ],
      resumeRules: [
        "<strong>1-Page ATS Single-Column Layout:</strong> Standard headings without complex nested tables or graphics.",
        "<strong>Action & Metric Driven:</strong> Use the STAR method: Action Verb + Project Scope + Quantifiable Metric Outcome.",
        "<strong>Live Proof of Work:</strong> Include verifiable links to live projects, portfolio documents, or public presentations.",
      ],
      interviewQuestions: [
        {
          q: `Q1: How do your qualifications directly align with achieving ${cleanTitle}?`,
          a: "Structure your answer using the past-present-future framework: foundational mastery achieved, recent concrete deliverables shipped, and immediate value you will deliver.",
        },
        {
          q: "Q2: Describe a complex problem you resolved and your systematic approach.",
          a: "State the problem context clearly, outline your diagnosis methodology, the trade-offs evaluated, and the measurable outcome achieved.",
        },
      ],
    },
  }
}

export function buildIntelligentRoadmap(title: string, goal?: string, category?: string): { nodes: Node<FlowData>[]; edges: Edge[] } {
  const domainData = getDomainRoadmapData(title, goal, category)

  const cleanTitle = title.length > 55 ? title.slice(0, 52) + "..." : title || "Goal Roadmap"
  const cleanGoal = goal ? (goal.length > 75 ? goal.slice(0, 72) + "..." : goal) : "Define core constraints and target milestones"

  const nodes: Node<FlowData>[] = [
    {
      id: "start-1",
      type: "start",
      position: { x: 50, y: 310 },
      data: {
        title: cleanTitle,
        description: cleanGoal,
      },
    },
    {
      id: "phase1-node",
      type: "action",
      position: { x: 420, y: 120 },
      data: {
        title: domainData.phase1.title,
        description: domainData.phase1.desc,
      },
    },
    {
      id: "courses-node",
      type: "action",
      position: { x: 420, y: 500 },
      data: {
        title: domainData.coursesTrack.title,
        description: domainData.coursesTrack.desc,
      },
    },
    {
      id: "phase2-node",
      type: "action",
      position: { x: 820, y: 120 },
      data: {
        title: domainData.phase2.title,
        description: domainData.phase2.desc,
      },
    },
    {
      id: "market-node",
      type: "action",
      position: { x: 820, y: 500 },
      data: {
        title: domainData.marketAnalysis.title,
        description: domainData.marketAnalysis.desc,
      },
    },
    {
      id: "phase4-node",
      type: "action",
      position: { x: 1220, y: 120 },
      data: {
        title: domainData.phase4.title,
        description: domainData.phase4.desc,
      },
    },
    {
      id: "phase5-node",
      type: "action",
      position: { x: 1220, y: 500 },
      data: {
        title: domainData.phase5.title,
        description: domainData.phase5.desc,
      },
    },
    {
      id: "outcome-optimistic",
      type: "outcome",
      position: { x: 1640, y: 70 },
      data: {
        title: domainData.outcomes.optimistic.title,
        description: domainData.outcomes.optimistic.desc,
      },
    },
    {
      id: "outcome-realistic",
      type: "outcome",
      position: { x: 1640, y: 310 },
      data: {
        title: domainData.outcomes.realistic.title,
        description: domainData.outcomes.realistic.desc,
      },
    },
    {
      id: "outcome-conservative",
      type: "outcome",
      position: { x: 1640, y: 550 },
      data: {
        title: domainData.outcomes.conservative.title,
        description: domainData.outcomes.conservative.desc,
      },
    },
  ]

  const edges: Edge[] = [
    {
      id: "edge-start-phase1",
      source: "start-1",
      target: "phase1-node",
      animated: true,
      label: "Step 1: Foundations",
      style: { stroke: "#b59a7e", strokeWidth: 1.8 },
    },
    {
      id: "edge-start-courses",
      source: "start-1",
      target: "courses-node",
      label: "Study Track",
      style: { stroke: "#9b8d7d", strokeWidth: 1.5, strokeDasharray: "4,4" },
    },
    {
      id: "edge-courses-market",
      source: "courses-node",
      target: "market-node",
      label: "Market Alignment",
      style: { stroke: "#9b8d7d", strokeWidth: 1.6 },
    },
    {
      id: "edge-phase1-phase2",
      source: "phase1-node",
      target: "phase2-node",
      animated: true,
      label: "Step 2: Applied Core",
      style: { stroke: "#b59a7e", strokeWidth: 1.8 },
    },
    {
      id: "edge-phase2-phase4",
      source: "phase2-node",
      target: "phase4-node",
      animated: true,
      label: "Step 3: Deliverables",
      style: { stroke: "#b59a7e", strokeWidth: 1.8 },
    },
    {
      id: "edge-market-phase5",
      source: "market-node",
      target: "phase5-node",
      label: "Market Readiness",
      style: { stroke: "#9b8d7d", strokeWidth: 1.6 },
    },
    {
      id: "edge-phase4-phase5",
      source: "phase4-node",
      target: "phase5-node",
      label: "Proof of Work",
      style: { stroke: "#7c9176", strokeWidth: 1.6 },
    },
    {
      id: "edge-phase4-opt",
      source: "phase4-node",
      target: "outcome-optimistic",
      label: "Accelerated Offer",
      style: { stroke: "#557e50", strokeWidth: 1.8 },
    },
    {
      id: "edge-phase4-real",
      source: "phase4-node",
      target: "outcome-realistic",
      label: "Target Role",
      style: { stroke: "#8c6833", strokeWidth: 1.8 },
    },
    {
      id: "edge-phase5-real",
      source: "phase5-node",
      target: "outcome-realistic",
      animated: true,
      label: "Evaluation Passed",
      style: { stroke: "#557e50", strokeWidth: 2 },
    },
    {
      id: "edge-phase5-pess",
      source: "phase5-node",
      target: "outcome-conservative",
      label: "Contingency / Bridge",
      style: { stroke: "#9e4e37", strokeWidth: 1.7 },
    },
  ]

  return { nodes, edges }
}

export function SimulationsPage() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ["simulations"], queryFn: getSimulations })
  const simulations: Simulation[] = Array.isArray(query.data) ? query.data : []

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteSimulation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] })
      toast.success("Simulation deleted from MongoDB Compass.")
    },
    onError: () => toast.error("Could not delete simulation."),
  })

  return (
    <PageFrame>
      <div className="page-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">GRAPH-BASED MODELING</span>
            <h1>Your simulations</h1>
            <p>Interactive decision graphs saved directly in your MongoDB database.</p>
          </div>
          <Link className="button button-dark" href="/simulations/new">
            <Plus size={16} /> New simulation
          </Link>
        </div>

        {query.isLoading ? (
          <div className="decision-cards">
            <div className="decision-card-skeleton" />
            <div className="decision-card-skeleton" />
          </div>
        ) : query.error ? (
          <div className="page-error">
            <CircleHelp size={22} />
            <strong>Could not load simulations from MongoDB.</strong>
            <p>Ensure the LifeFlow backend is online and connected to MongoDB.</p>
            <button className="button button-outline" onClick={() => query.refetch()}>
              Try again
            </button>
          </div>
        ) : simulations.length ? (
          <div className="simulation-list">
            {simulations.map((simulation) => (
              <div className="simulation-list-card-wrap" key={simulation.id}>
                <Link className="simulation-list-card" href={`/simulations/${simulation.id}`}>
                  <span className="simulation-list-icon">
                    <GitBranch size={19} />
                  </span>
                  <span>
                    <strong>{simulation.title}</strong>
                    <small>
                      {simulation.category || "General"} · {simulation.nodes?.length || 0} nodes ·{" "}
                      {simulation.edges?.length || 0} connections
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  className="icon-button delete-sim-btn"
                  title="Delete simulation"
                  onClick={(e) => {
                    e.preventDefault()
                    if (window.confirm(`Delete simulation "${simulation.title}" from MongoDB?`)) {
                      removeMutation.mutate(simulation.id)
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="decision-empty">
            <span className="empty-illustration">
              <GitBranch size={24} />
            </span>
            <h2>No simulations yet</h2>
            <p>Build visual decision graphs to simulate all possible pathways and outcomes.</p>
            <Link className="button button-dark" href="/simulations/new">
              <Plus size={16} /> Build your first simulation
            </Link>
          </div>
        )}
      </div>
    </PageFrame>
  )
}

export function SimulationCanvas() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params?.id || "new"
  const isNew = id === "new"

  const passedTitle = searchParams.get("title") || ""
  const passedGoal = searchParams.get("goal") || ""
  const passedCategory = searchParams.get("category") || ""

  const queryClient = useQueryClient()

  const initialRoadmap = useMemo(() => {
    if (passedTitle) {
      return buildIntelligentRoadmap(passedTitle, passedGoal, passedCategory)
    }
    return { nodes: defaultTemplateNodes, edges: defaultTemplateEdges }
  }, [passedTitle, passedGoal, passedCategory])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowData>>(initialRoadmap.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialRoadmap.edges)
  const [title, setTitle] = useState(passedTitle || "Decision Simulation Map")
  const [results, setResults] = useState<SimulationEngineResult | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  const existing = useQuery<Simulation>({
    queryKey: ["simulation", id],
    enabled: !isNew && !!id,
    queryFn: () => getSimulationById(id),
  })

  const handleAutoBuildRoadmap = () => {
    const currentGoal = existing.data?.goal || passedGoal || (nodes.find((n) => n.type === "start")?.data.description as string) || ""
    const currentCategory = existing.data?.category || passedCategory || ""
    const roadmap = buildIntelligentRoadmap(title || passedTitle, currentGoal, currentCategory)
    setNodes(roadmap.nodes)
    setEdges(roadmap.edges)
    setResults(null)
    toast.success("AI generated a structured roadmap tailored to your specific goal!")
  }

  const domainData = useMemo(() => {
    const currentTitle = title || existing.data?.title || passedTitle || "Decision Roadmap"
    const currentGoal = existing.data?.goal || passedGoal || (nodes.find((n) => n.type === "start")?.data.description as string) || ""
    const currentCategory = existing.data?.category || passedCategory || ""
    return getDomainRoadmapData(currentTitle, currentGoal, currentCategory)
  }, [title, existing.data?.title, existing.data?.goal, existing.data?.category, passedTitle, passedGoal, passedCategory, nodes])

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `edge-${crypto.randomUUID().slice(0, 8)}`,
            style: { stroke: "#b59a7e", strokeWidth: 1.6 },
          },
          eds,
        ),
      ),
    [setEdges],
  )

  // Synchronize state when existing simulation is retrieved from MongoDB
  useEffect(() => {
    const data = existing.data
    if (!data) return
    if (typeof data.title === "string") setTitle(data.title)
    if (Array.isArray(data.nodes) && data.nodes.length > 0) {
      setNodes(
        data.nodes.map((n: SimulationNode) => ({
          id: n.nodeId,
          type: n.type,
          position: n.position || { x: 100, y: 100 },
          data: { title: n.title, description: n.description },
        })),
      )
    }
    if (Array.isArray(data.edges) && data.edges.length > 0) {
      setEdges(
        data.edges.map((e: SimulationEdge) => ({
          id: e.edgeId,
          source: e.source,
          target: e.target,
          label: e.label,
          style: { stroke: "#b59a7e", strokeWidth: 1.6 },
        })),
      )
    }
  }, [existing.data, setEdges, setNodes])

  // Save to MongoDB Compass
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim() || "Untitled Simulation",
        category: "General",
        goal: "Evaluate potential pathways",
        status: "active" as const,
        nodes: nodes.map((n) => ({
          nodeId: n.id,
          type: (n.type || "action") as SimulationNode["type"],
          title: n.data.title || "Step",
          description: n.data.description,
          position: n.position,
        })),
        edges: edges.map((e) => ({
          edgeId: e.id,
          source: e.source,
          target: e.target,
          label: typeof e.label === "string" ? e.label : undefined,
        })),
      }

      return isNew ? await createSimulation(payload) : await updateSimulation(id, payload)
    },
    onSuccess: (savedDoc) => {
      toast.success("Simulation saved directly to MongoDB Compass.")
      queryClient.invalidateQueries({ queryKey: ["simulations"] })
      if (isNew && savedDoc?.id) {
        window.location.href = `/simulations/${savedDoc.id}`
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Could not save simulation graph. Verify backend connection.")
    },
  })

  // Run backend graph traversal engine
  const runMutation = useMutation({
    mutationFn: async () => {
      if (isNew) {
        return await runAdHocSimulation({
          nodes: nodes.map((n) => ({
            nodeId: n.id,
            type: (n.type || "action") as SimulationNode["type"],
            title: n.data.title,
            description: n.data.description,
            position: n.position,
          })),
          edges: edges.map((e) => ({
            edgeId: e.id,
            source: e.source,
            target: e.target,
            label: typeof e.label === "string" ? e.label : undefined,
          })),
          maxPaths: 50,
          maxDepth: 20,
        })
      }

      return await runSimulationById(id, { maxPaths: 50, maxDepth: 20 })
    },
    onSuccess: (data) => {
      setResults(data)
      setSelectedPath(null)
      toast.success(`Simulation completed: ${data.totalPaths} possible paths discovered.`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Simulation evaluation failed. Ensure graph contains a start node.")
    },
  })

  const addNode = (type: "decision" | "action" | "outcome") => {
    const label = type === "decision" ? "Decision Point" : type === "action" ? "Action Step" : "Outcome Node"
    setNodes((list) => [
      ...list,
      {
        id: `${type}-${crypto.randomUUID().slice(0, 6)}`,
        type,
        position: { x: 300 + Math.random() * 200, y: 150 + Math.random() * 150 },
        data: { title: label, description: "Double-click to edit text" },
      },
    ])
  }

  const handleNodeDoubleClick = (_: React.MouseEvent, node: Node<FlowData>) => {
    const value = window.prompt("Edit step label:", node.data.title)
    if (value?.trim()) {
      setNodes((list) =>
        list.map((item) =>
          item.id === node.id ? { ...item, data: { ...item.data, title: value.trim() } } : item,
        ),
      )
    }
  }

  const activePath = useMemo(
    () => results?.paths.find((path) => path.pathId === selectedPath),
    [results, selectedPath],
  )

  const highlightPath = (pathId: string) => {
    setSelectedPath(pathId === selectedPath ? null : pathId)
  }

  const activeNodeIds = new Set(activePath?.steps.map((step) => step.nodeId) || [])

  const visibleNodes = nodes.map((node) => ({
    ...node,
    className: selectedPath ? (activeNodeIds.has(node.id) ? "path-highlight" : "path-dim") : "",
  }))

  const visibleEdges = edges.map((edge) => ({
    ...edge,
    animated: selectedPath ? activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target) : edge.animated,
    style: {
      ...edge.style,
      stroke:
        selectedPath && activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target)
          ? "#b48662"
          : edge.style?.stroke,
    },
  }))

  return (
    <PageFrame>
      <div className="canvas-page">
        <header className="canvas-toolbar">
          <Link href="/simulations" className="icon-button" aria-label="Back to simulations">
            <ArrowLeft size={18} />
          </Link>
          <div className="canvas-title-wrap">
            <input
              aria-label="Simulation title"
              className="canvas-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="canvas-saved">
              <span />
              {saveMutation.isSuccess ? "Saved in MongoDB" : "Unsaved changes"}
            </span>
          </div>
          <div className="canvas-actions">
            <button
              className="canvas-action"
              style={{ background: "#fbf6ec", color: "#8c6833", borderColor: "#ecdac0", fontWeight: 600 }}
              onClick={handleAutoBuildRoadmap}
              title="Automatically generate a complete roadmap tailored to this goal"
            >
              <Sparkles size={14} color="#8c6833" />
              Auto-Build Roadmap
            </button>
            <button
              className="canvas-action"
              style={{ background: showGuide ? "#efebe3" : "#fff", fontWeight: 500 }}
              onClick={() => setShowGuide((prev) => !prev)}
              title="View languages checklist, resume format, and crucial interview questions"
            >
              <BookOpen size={14} />
              {showGuide ? "Close Guide" : "Study & Interview Guide"}
            </button>
            <button
              className="canvas-action"
              onClick={() => {
                if (window.confirm("Reset canvas to clean template?")) {
                  setNodes(defaultTemplateNodes)
                  setEdges(defaultTemplateEdges)
                  setResults(null)
                }
              }}
            >
              Reset
            </button>
            <button
              className="canvas-action"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Save size={15} />
              {saveMutation.isPending ? "Saving..." : "Save to MongoDB"}
            </button>
            <button
              className="button button-dark"
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
            >
              <Play size={14} fill="currentColor" />
              {runMutation.isPending ? "Evaluating paths..." : "Run Simulation Engine"}
            </button>
          </div>
        </header>

        <div className="canvas-workspace">
          <div className="canvas-palette">
            <span className="palette-label">GRAPH BUILDER</span>
            <button className="palette-node palette-decision" onClick={() => addNode("decision")}>
              <span>
                <Target size={15} />
              </span>
              Decision Node
              <Plus size={13} />
            </button>
            <button className="palette-node palette-action" onClick={() => addNode("action")}>
              <span>
                <ListPlus size={15} />
              </span>
              Action Step
              <Plus size={13} />
            </button>
            <button className="palette-node palette-outcome" onClick={() => addNode("outcome")}>
              <span>
                <Sparkles size={15} />
              </span>
              Outcome Node
              <Plus size={13} />
            </button>

            <div className="palette-tip">
              <CircleHelp size={15} />
              <p>
                Drag handles to connect nodes. Double-click any node to rename it. Click &apos;Run Simulation
                Engine&apos; to compute all terminal paths.
              </p>
            </div>
          </div>

          <div className="flow-area">
            <div className="flow-top-note">
              <span className="flow-live-dot" /> MONGODB GRAPH CANVAS <span>·</span> Interactive ReactFlow Visualizer
            </div>
            <ReactFlow
              nodes={visibleNodes}
              edges={visibleEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDoubleClick={handleNodeDoubleClick}
              fitView
              fitViewOptions={{ padding: 0.18 }}
              minZoom={0.3}
              maxZoom={1.4}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#ded9d1" gap={22} size={1} variant={BackgroundVariant.Dots} />
              <Controls showInteractive={false} position="bottom-right" />
            </ReactFlow>
            <div className="canvas-legend">
              <span>
                <i className="legend-dot start-dot" /> Starting point
              </span>
              <span>
                <i className="legend-dot decision-dot" /> Decision
              </span>
              <span>
                <i className="legend-dot action-dot" /> Action step
              </span>
              <span>
                <i className="legend-dot outcome-dot" /> Outcome
              </span>
            </div>
          </div>
        </div>

        {showGuide && (
          <aside className="results-drawer" style={{ width: "min(490px, calc(100vw - 30px))", zIndex: 12 }}>
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">ROADMAP &amp; INTERVIEW PLAYBOOK</span>
                <h2 style={{ fontSize: 16 }}>{domainData.guideHeading}</h2>
              </div>
              <button className="icon-button" onClick={() => setShowGuide(false)} aria-label="Close guide">
                <X size={17} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              {/* SECTION: BEST COURSES IN THE MARKET */}
              <div style={{ background: "#f8f6f2", border: "1px solid #eae5db", borderRadius: 10, padding: 14 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#322e28" }}>
                  📚 Top Curated Market Courses &amp; Resource Links
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {domainData.courses.map((course, idx) => (
                    <a
                      key={idx}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "#fff",
                        border: "1px solid #e2ddd3",
                        textDecoration: "none",
                        color: "#322e28",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: 11 }}>{course.title}</strong>
                        <ExternalLink size={10} color="#8c6e3b" />
                      </div>
                      <span style={{ fontSize: 9, color: "#777065" }}>
                        {course.provider} • {course.badge}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* SECTION: LINKEDIN & NAUKRI PORTALS */}
              {domainData.jobKeywords && domainData.jobKeywords.trim().length > 0 && (
                <div style={{ background: "#f8f6f2", border: "1px solid #eae5db", borderRadius: 10, padding: 14 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#322e28" }}>
                    💼 Sourcing Opportunities for &quot;{domainData.jobKeywords}&quot;
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <a
                      href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(domainData.jobKeywords)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-link-btn portal-btn-linkedin"
                      style={{ fontSize: 10, padding: "5px 10px" }}
                    >
                      LinkedIn: {domainData.jobKeywords.slice(0, 20)} <ExternalLink size={10} />
                    </a>
                    <a
                      href={`https://www.naukri.com/${encodeURIComponent(domainData.jobKeywords).replace(/%20/g, "-")}-jobs`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-link-btn portal-btn-naukri"
                      style={{ fontSize: 10, padding: "5px 10px" }}
                    >
                      Naukri Roles <ExternalLink size={10} />
                    </a>
                    <a
                      href={`https://internshala.com/internships/${encodeURIComponent(domainData.jobKeywords).replace(/%20/g, "-")}-internship`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-link-btn portal-btn-internshala"
                      style={{ fontSize: 10, padding: "5px 10px" }}
                    >
                      Internshala <ExternalLink size={10} />
                    </a>
                    <a
                      href="https://wellfound.com/jobs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-link-btn portal-btn-wellfound"
                      style={{ fontSize: 10, padding: "5px 10px" }}
                    >
                      Wellfound Startups <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              )}

              {/* SECTION 1: LANGUAGES & TECH / FRAMEWORKS */}
              <div style={{ background: "#f8f6f2", border: "1px solid #eae5db", borderRadius: 10, padding: 14 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#322e28" }}>
                  {domainData.jobKeywords ? "💻 1. Exact Languages, Tools & Methodologies to Learn" : "🔍 1. Key Frameworks, Tools & Protocols"}
                </h3>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.6, color: "#5c564c" }}>
                  {domainData.guide.languagesAndTools.map((item, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </div>

              {/* SECTION 2: HOW TO MAKE RESUME / EXECUTION PRINCIPLES */}
              <div style={{ background: "#f8f6f2", border: "1px solid #eae5db", borderRadius: 10, padding: 14 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#322e28" }}>
                  {domainData.jobKeywords ? "📄 2. High-Impact ATS Resume & Proof of Work Blueprint" : "📋 2. Execution Principles & Success Blueprint"}
                </h3>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.6, color: "#5c564c" }}>
                  {domainData.guide.resumeRules.map((rule, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: rule }} />
                  ))}
                </ul>
              </div>

              {/* SECTION 3: HOW TO CRACK INTERVIEW / CRITICAL QUESTIONS */}
              <div style={{ background: "#f8f6f2", border: "1px solid #eae5db", borderRadius: 10, padding: 14 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#322e28" }}>
                  {domainData.jobKeywords ? "🎯 3. Top Crucial Technical & Screening Interview Questions" : "🎯 3. Critical Questions & Alignment Protocols"}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 11, color: "#5c564c" }}>
                  {domainData.guide.interviewQuestions.map((qa, idx) => (
                    <div key={idx}>
                      <strong style={{ color: "#2f2b25" }}>{qa.q}</strong>
                      <p style={{ margin: "2px 0 0", lineHeight: 1.45 }}>{qa.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {results && (
          <aside className="results-drawer">
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">BACKEND ENGINE OUTPUT</span>
                <h2>
                  {results.totalPaths} Discovered {results.totalPaths === 1 ? "Path" : "Paths"}
                </h2>
              </div>
              <button className="icon-button" onClick={() => setResults(null)} aria-label="Close results">
                <X size={17} />
              </button>
            </div>
            <p className="drawer-copy">Click a path below to highlight the route on the visual canvas:</p>
            {results.paths.map((path, index) => (
              <button
                className={`result-path ${selectedPath === path.pathId ? "result-selected" : ""}`}
                onClick={() => highlightPath(path.pathId)}
                key={path.pathId}
              >
                <span className="path-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="path-content">
                  <strong>{path.outcome?.title || `Terminal Path ${index + 1}`}</strong>
                  <small>
                    <Clock3 size={12} /> {path.totalSteps} steps in graph
                  </small>
                  <span className="path-mini-steps">
                    {path.steps.map((step, stepIndex) => (
                      <span key={step.nodeId}>
                        {step.title}
                        {stepIndex < path.steps.length - 1 && <i> → </i>}
                      </span>
                    ))}
                  </span>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
          </aside>
        )}
      </div>
    </PageFrame>
  )
}
