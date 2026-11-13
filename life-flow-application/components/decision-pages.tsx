"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  ExternalLink,
  GraduationCap,
  Layers,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { PageFrame, PageHeading } from "@/components/lifeflow-dashboard"
import {
  createDecision,
  createSimulation,
  createBatchScenarios,
  generateScenarios,
  getDecisions,
  type Decision,
  type Scenario,
} from "@/lib/api"

const schema = z.object({
  title: z.string().min(2, "Give this decision a descriptive title (at least 2 characters)."),
  category: z.string().min(1, "Please select a category."),
  goal: z.string().min(2, "Describe the outcome or goal you hope to achieve."),
  currentSituation: z.string().optional(),
  timeAvailable: z.string().optional(),
  budget: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const categories = [
  "Career",
  "Relationships",
  "Health & wellbeing",
  "Money & finance",
  "Education",
  "Lifestyle",
  "Business & ventures",
  "Other",
]

export function DecisionsPage() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const query = useQuery({ queryKey: ["decisions"], queryFn: getDecisions })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      category: "Career",
      goal: "",
      currentSituation: "",
      timeAvailable: "",
      budget: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const budgetNum = values.budget ? Number(values.budget.replace(/[^0-9.-]+/g, "")) : undefined
      const timeNum = values.timeAvailable ? Number(values.timeAvailable.replace(/[^0-9.-]+/g, "")) : undefined

      return createDecision({
        title: values.title.trim(),
        category: values.category,
        goal: values.goal.trim(),
        currentSituation: values.currentSituation?.trim() || undefined,
        budget: !isNaN(budgetNum as number) ? budgetNum : undefined,
        timeAvailable: !isNaN(timeNum as number) ? timeNum : undefined,
        status: "active",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] })
      toast.success("Decision saved successfully in MongoDB Compass.")
      setOpen(false)
      form.reset()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Could not save decision. Please check backend connection.")
    },
  })

  const rows: Decision[] = Array.isArray(query.data) ? query.data : []
  const filtered = rows.filter(
    (item) =>
      (filter === "all" || item.status === filter) &&
      `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <PageFrame>
      <div className="page-content">
        <PageHeading
          eyebrow="DECISION REPOSITORY"
          title="Your decisions"
          description="Manage, evaluate, and trace your life decisions stored directly in MongoDB Compass."
          action={
            <button className="button button-dark" onClick={() => setOpen(true)}>
              <Plus size={16} /> New decision
            </button>
          }
        />
        <div className="list-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter decisions by title or category..."
              aria-label="Search decisions"
            />
          </label>
          <div className="filter-group" aria-label="Filter by status">
            {["all", "active", "draft", "completed"].map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`filter-chip ${filter === key ? "filter-selected" : ""}`}
              >
                {key === "all" ? "All decisions" : key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {query.isLoading ? (
          <div className="decision-cards">
            {[0, 1, 2].map((n) => (
              <div className="decision-card-skeleton" key={n} />
            ))}
          </div>
        ) : query.error ? (
          <div className="page-error">
            <CircleHelp size={22} />
            <strong>Unable to load decisions from MongoDB.</strong>
            <p>Ensure the LifeFlow backend server is running on port 5000.</p>
            <button className="button button-outline" onClick={() => query.refetch()}>
              Try again
            </button>
          </div>
        ) : filtered.length ? (
          <div className="decision-cards">
            {filtered.map((item, i) => (
              <article className="list-decision-card" key={item.id}>
                <div className={`decision-mark mark-${i % 4}`}>
                  <Target size={18} />
                </div>
                <div className="list-card-content">
                  <div className="list-card-top">
                    <span className="category-label">{item.category}</span>
                    <span className={`status-pill status-${item.status || "draft"}`}>
                      <span />
                      {item.status || "draft"}
                    </span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.goal}</p>
                  <div className="list-card-bottom">
                    <span>
                      <Clock3 size={13} />
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Active"}
                    </span>
                    <Link href={`/decisions/${item.id}`} className="text-link">
                      View details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="decision-empty">
            <span className="empty-illustration">
              <Target size={24} />
            </span>
            <h2>{search || filter !== "all" ? "No matching decisions" : "No decisions recorded yet"}</h2>
            <p>
              {search || filter !== "all"
                ? "Try a different search query or filter."
                : "Create your first decision. It will be stored safely in your MongoDB database."}
            </p>
            {!search && filter === "all" && (
              <button className="button button-dark" onClick={() => setOpen(true)}>
                <Plus size={16} /> Create your first decision
              </button>
            )}
          </div>
        )}
      </div>

      {open && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <section
            className="decision-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-modal-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">MONGODB DECISION RECORD</span>
                <h2 id="decision-modal-title">Define a new decision</h2>
                <p>All fields are validated and saved directly to your MongoDB database.</p>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
              <label className="form-label">
                Decision Title
                <input {...form.register("title")} placeholder="e.g. Relocate to a new city for work" />
                {form.formState.errors.title && (
                  <span className="form-error">{form.formState.errors.title.message}</span>
                )}
              </label>

              <label className="form-label">
                Area / Category
                <span className="select-wrap">
                  <select {...form.register("category")}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} />
                </span>
              </label>

              <label className="form-label">
                Goal / Desired Outcome
                <textarea
                  {...form.register("goal")}
                  rows={2}
                  placeholder="What does a successful resolution look like?"
                />
                {form.formState.errors.goal && (
                  <span className="form-error">{form.formState.errors.goal.message}</span>
                )}
              </label>

              <details className="optional-fields">
                <summary>Additional Context & Constraints (Optional)</summary>
                <div className="optional-field-grid">
                  <label className="form-label">
                    Current Situation
                    <textarea
                      {...form.register("currentSituation")}
                      rows={2}
                      placeholder="Current status, dilemmas, or background..."
                    />
                  </label>
                  <label className="form-label">
                    Time Available (days or months)
                    <input {...form.register("timeAvailable")} placeholder="e.g. 90" />
                  </label>
                  <label className="form-label">
                    Budget (Numeric value)
                    <input {...form.register("budget")} placeholder="e.g. 5000" />
                  </label>
                </div>
              </details>

              <div className="modal-footer">
                <button type="button" className="button button-outline" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-dark" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving to MongoDB..." : "Save to Database"}
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </PageFrame>
  )
}

interface DomainResource {
  domainName: string
  marketSummary: string
  skills: string[]
  courses: Array<{
    provider: string
    badge: string
    title: string
    desc: string
    url: string
  }>
  jobKeywords: string
}

function getDomainResources(title: string, goal: string, category: string): DomainResource {
  const q = `${title} ${goal} ${category}`.toLowerCase()

  if (/(ai|artificial intelligence|machine learning|deep learning|data science|data scientist|data analyst|nlp|llm|computer vision|genai)/i.test(q)) {
    return {
      domainName: "Artificial Intelligence & Data Science",
      marketSummary: "High global hiring demand for AI/ML Engineers, Data Scientists, and production LLM application builders.",
      skills: ["Python", "SQL", "Pandas", "Scikit-Learn", "PyTorch", "Hugging Face", "LangChain", "Vector DBs", "FastAPI", "Docker"],
      courses: [
        {
          provider: "DeepLearning.AI",
          badge: "Andrew Ng Specialization",
          title: "Machine Learning Specialization",
          desc: "World-renowned foundational program covering supervised learning, neural networks, and decision trees.",
          url: "https://www.coursera.org/specializations/machine-learning-introduction",
        },
        {
          provider: "fast.ai",
          badge: "Open Source",
          title: "Practical Deep Learning for Coders",
          desc: "Hands-on PyTorch course covering CNNs, transfer learning, NLP transformers, and deployment.",
          url: "https://course.fast.ai/",
        },
        {
          provider: "Kaggle Learn",
          badge: "Micro-Courses",
          title: "Kaggle Applied Data Science",
          desc: "Interactive exercises for Python, Pandas data wrangling, feature engineering, and model validation.",
          url: "https://www.kaggle.com/learn",
        },
        {
          provider: "Stanford Online",
          badge: "Free Audit",
          title: "CS229 Machine Learning",
          desc: "Rigorous theoretical and mathematical foundation in statistical learning, gradient descent, and optimization.",
          url: "https://cs229.stanford.edu/",
        },
      ],
      jobKeywords: "AI Machine Learning Engineer",
    }
  }

  if (/(devops|cloud|aws|azure|gcp|docker|kubernetes|terraform|sre|platform engineering|sysadmin)/i.test(q)) {
    return {
      domainName: "Cloud Infrastructure & DevOps",
      marketSummary: "78% of enterprise cloud postings require Docker, Kubernetes, Terraform, and AWS/Azure certification.",
      skills: ["Linux & Bash", "Docker", "Kubernetes", "Terraform", "AWS / Azure", "CI/CD Actions", "Prometheus", "GitOps", "Python"],
      courses: [
        {
          provider: "Linux Foundation",
          badge: "Official Track",
          title: "Introduction to Linux (LFS101x)",
          desc: "Core Linux operating system fundamentals, shell commands, file hierarchies, and systems administration.",
          url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
        },
        {
          provider: "freeCodeCamp",
          badge: "Hands-On",
          title: "Docker & Kubernetes Full Course",
          desc: "Complete containerization guide: Dockerfile optimization, multi-container compose, and K8s pods & services.",
          url: "https://www.freecodecamp.org/news/kubernetes-course/",
        },
        {
          provider: "AWS Skill Builder",
          badge: "Official AWS",
          title: "AWS Cloud Practitioner & Architect",
          desc: "Official curriculum for AWS core infrastructure: EC2, S3, IAM, VPCs, RDS, and scalable cloud architecture.",
          url: "https://explore.skillbuilder.aws/",
        },
        {
          provider: "HashiCorp",
          badge: "IaC Standard",
          title: "Terraform Associate Certification Track",
          desc: "Declare and manage cloud infrastructure as code safely across multiple cloud providers.",
          url: "https://developer.hashicorp.com/terraform/tutorials",
        },
      ],
      jobKeywords: "DevOps Cloud Engineer",
    }
  }

  if (/(mobile|flutter|react native|ios|swift|android|kotlin|app dev)/i.test(q)) {
    return {
      domainName: "Mobile App Development",
      marketSummary: "High demand for mobile engineers capable of shipping store-ready apps with smooth offline UX.",
      skills: ["Flutter & Dart", "React Native", "Swift / SwiftUI", "Kotlin", "REST & GraphQL", "Firebase", "State Management", "Store CI/CD"],
      courses: [
        {
          provider: "Flutter.dev",
          badge: "Google Official",
          title: "Flutter & Dart Complete Guide",
          desc: "Build fast cross-platform applications for iOS and Android with single codebase and reactive UI.",
          url: "https://docs.flutter.dev/get-started/codelab",
        },
        {
          provider: "React Native",
          badge: "Open Source",
          title: "React Native Core Architecture",
          desc: "Learn to build cross-platform native iOS & Android applications using React and modern JavaScript.",
          url: "https://reactnative.dev/docs/getting-started",
        },
        {
          provider: "Apple Developer",
          badge: "Apple Official",
          title: "Develop in Swift Tutorials",
          desc: "Master Xcode, Swift syntax, SwiftUI declarative views, and native iOS system capabilities.",
          url: "https://developer.apple.com/tutorials/develop-in-swift",
        },
        {
          provider: "Google Developers",
          badge: "Android Official",
          title: "Android Basics in Kotlin",
          desc: "Official path to design Android user interfaces, handle background tasks, and deploy to Google Play.",
          url: "https://developer.android.com/courses/android-basics-kotlin/course",
        },
      ],
      jobKeywords: "Mobile App Developer",
    }
  }

  if (/(cyber|security|hacking|penetration|infosec|soc|ethical hack|network security)/i.test(q)) {
    return {
      domainName: "Cybersecurity & Information Defense",
      marketSummary: "Critical global shortage of certified penetration testers, SOC analysts, and vulnerability researchers.",
      skills: ["Linux", "Networking (TCP/IP)", "Python Scripting", "Wireshark", "Burp Suite", "OWASP Top 10", "Metasploit", "Security+"],
      courses: [
        {
          provider: "TryHackMe",
          badge: "Interactive Labs",
          title: "Pre-Security & Complete Beginner Path",
          desc: "Hands-on browser-based labs for Linux, networking fundamentals, web vulnerabilities, and security operations.",
          url: "https://tryhackme.com/",
        },
        {
          provider: "PortSwigger",
          badge: "Gold Standard",
          title: "Web Security Academy",
          desc: "World-class free practical labs covering SQL injection, XSS, CSRF, SSRF, and authentication flaws.",
          url: "https://portswigger.net/web-security",
        },
        {
          provider: "Professor Messer",
          badge: "Free Certification",
          title: "CompTIA Security+ (SY0-701) Series",
          desc: "Complete comprehensive video training course mapping 100% of the industry-standard Security+ certification.",
          url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/",
        },
        {
          provider: "Hack The Box",
          badge: "Pro Lab",
          title: "HTB Academy Penetration Testing",
          desc: "Deep-dive offensive security training from reconnaissance and weaponization to post-exploitation.",
          url: "https://academy.hackthebox.com/",
        },
      ],
      jobKeywords: "Cybersecurity Analyst",
    }
  }

  if (/(startup|business|e-commerce|agency|marketing|sales|freelance|entrepreneur|product manager|saas)/i.test(q)) {
    return {
      domainName: "Business, Startup & Product Strategy",
      marketSummary: "Validated early customer traction and strong unit economics (LTV/CAC) dramatically outperform pure theory.",
      skills: ["Customer Discovery", "MVP Prototyping", "Unit Economics", "GTM Strategy", "Financial Modeling", "Mixpanel / Analytics", "Pitch Deck"],
      courses: [
        {
          provider: "Y Combinator",
          badge: "100% Free",
          title: "Startup School",
          desc: "YC's free curriculum on finding ideas, building MVPs, talking to users, pricing, and pitching investors.",
          url: "https://www.startupschool.org/",
        },
        {
          provider: "Stripe Atlas",
          badge: "Founder Guides",
          title: "Guides to Running an Internet Business",
          desc: "Comprehensive playbook on incorporation, unit economics, SaaS pricing benchmarks, and global billing.",
          url: "https://stripe.com/atlas/guides",
        },
        {
          provider: "Harvard Business",
          badge: "Executive",
          title: "Entrepreneurship Essentials",
          desc: "Learn to identify high-potential business opportunities, test business models, and secure early funding.",
          url: "https://online.hbs.edu/courses/entrepreneurship-essentials/",
        },
        {
          provider: "Wharton Online",
          badge: "Specialization",
          title: "Business & Financial Foundations",
          desc: "Foundational mastery in marketing, accounting, operations, and quantitative finance for founders.",
          url: "https://www.coursera.org/specializations/wharton-business-foundations",
        },
      ],
      jobKeywords: title ? title.slice(0, 30) : "Product Manager Startup",
    }
  }

  if (/(masters|study abroad|exam|upsc|gre|toefl|ielts|phd|gate|mba|college|university)/i.test(q)) {
    return {
      domainName: "Higher Education & Competitive Exam Prep",
      marketSummary: "Admissions committees and examiners reward diagnostic preparation, high mock frequency, and strong SOP narratives.",
      skills: ["Syllabus Mastery", "Quant Problem Solving", "Analytical Writing", "SOP & LORs", "Full-Length Mocks", "Visa Interview"],
      courses: [
        {
          provider: "ETS Official",
          badge: "Official ETS",
          title: "GRE General Test Official Prep",
          desc: "Official practice tests, scoring rubrics, and authentic sample questions directly from the test makers.",
          url: "https://www.ets.org/gre/test-takers/general-test/prepare.html",
        },
        {
          provider: "British Council",
          badge: "IELTS Official",
          title: "IELTS Academic Preparation",
          desc: "Comprehensive practice for Listening, Reading, Writing, and Speaking with certified test examiner feedback.",
          url: "https://takeielts.britishcouncil.org/take-ielts/prepare",
        },
        {
          provider: "DAAD / Uni-Assist",
          badge: "Study in Europe",
          title: "Higher Education & Admission Guidelines",
          desc: "Official procedures for academic credential evaluation (APS/Uni-Assist), scholarships, and student visas.",
          url: "https://www.daad.de/en/",
        },
        {
          provider: "Coursera",
          badge: "Writing Skills",
          title: "Writing High-Impact Statements of Purpose",
          desc: "Structured frameworks for drafting persuasive graduate admissions essays and academic research proposals.",
          url: "https://www.coursera.org/learn/writing-for-business",
        },
      ],
      jobKeywords: "Graduate Research Fellow",
    }
  }

  if (/(full stack|full-stack|frontend|backend|web dev|javascript|react|node|typescript|mern|software|coding|programming|developer)/i.test(q)) {
    return {
      domainName: "Full-Stack Software Engineering",
      marketSummary: "82% of entry developer postings require React + Node.js or TypeScript with live deployed projects.",
      skills: ["HTML5 & CSS3", "JavaScript ES6+", "TypeScript", "React.js", "Next.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "Docker", "Git"],
      courses: [
        {
          provider: "Univ. of Helsinki",
          badge: "100% Free",
          title: "Full Stack Open",
          desc: "Gold standard deep-dive: Modern React, Redux, Node.js, MongoDB, TypeScript, GraphQL & CI/CD.",
          url: "https://fullstackopen.com/en/",
        },
        {
          provider: "The Odin Project",
          badge: "Open Source",
          title: "Full Stack JavaScript",
          desc: "Hands-on project-driven roadmap: HTML5/CSS3, JavaScript ES6+, Node.js, MongoDB & Git.",
          url: "https://www.theodinproject.com/",
        },
        {
          provider: "freeCodeCamp",
          badge: "Certifications",
          title: "Full Stack Certifications",
          desc: "Interactive challenges for algorithms, backend APIs, microservices, and React frontend.",
          url: "https://www.freecodecamp.org/",
        },
        {
          provider: "Harvard CS50",
          badge: "Free Audit",
          title: "CS50 Web Programming",
          desc: "Rigorous foundation in web architecture, SQL/NoSQL, scalability, APIs, and CI/CD pipelines.",
          url: "https://cs50.harvard.edu/web/",
        },
      ],
      jobKeywords: "Full Stack Developer",
    }
  }

  // General / Custom user goal fallback
  const cleanQ = title || goal || "career transition"
  return {
    domainName: `Tailored Strategy: ${cleanQ}`,
    marketSummary: `Active hiring & opportunity trends for "${cleanQ}" across leading industry portals and professional networks.`,
    skills: ["Prerequisite Fundamentals", "Core Domain Methodologies", "Quantifiable Proof of Work", "1-Page ATS Resume", "Interview & Evaluation Readiness"],
    courses: [
      {
        provider: "Coursera",
        badge: "Specialization",
        title: `Curated University Specializations for ${cleanQ.slice(0, 28)}`,
        desc: `Top-rated academic courses and professional certificates directly mapped to "${cleanQ}".`,
        url: `https://www.coursera.org/search?query=${encodeURIComponent(cleanQ)}`,
      },
      {
        provider: "edX",
        badge: "Harvard & MIT",
        title: `edX Professional Masterclasses for ${cleanQ.slice(0, 28)}`,
        desc: "Accredited coursework from top global institutions to build recognized credentials.",
        url: `https://www.edx.org/search?q=${encodeURIComponent(cleanQ)}`,
      },
      {
        provider: "MIT OpenCourseWare",
        badge: "100% Free",
        title: "MIT OCW Foundational Catalog",
        desc: "Complete syllabus, lecture notes, and assignments from MIT's world-class academic curriculum.",
        url: "https://ocw.mit.edu/",
      },
      {
        provider: "LinkedIn Learning",
        badge: "Industry Certified",
        title: `Professional Skills Track for ${cleanQ.slice(0, 28)}`,
        desc: "Practical hands-on courses taught by industry veterans with verifiable LinkedIn completion certificates.",
        url: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(cleanQ)}`,
      },
    ],
    jobKeywords: cleanQ,
  }
}

export function AIStudioPage() {
  const router = useRouter()
  const [decisionTitle, setDecisionTitle] = useState("")
  const [category, setCategory] = useState("Career")
  const [goal, setGoal] = useState("")
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [context, setContext] = useState("")

  const domainRes = useMemo(
    () => getDomainResources(decisionTitle, goal, category),
    [decisionTitle, goal, category]
  )

  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ["decisions"], queryFn: getDecisions })
  const decisions: Decision[] = Array.isArray(query.data) ? query.data : []

  const handleSelectExistingDecision = (d: Decision) => {
    setDecisionTitle(d.title)
    setCategory(d.category || "Career")
    setGoal(d.goal || "")
    setContext(d.currentSituation || "")
  }

  const run = async () => {
    if (decisionTitle.trim().length < 2 || goal.trim().length < 2) {
      toast.error("Please enter a decision title and goal to explore.")
      return
    }
    setLoading(true)
    try {
      const data = await generateScenarios({
        decisionTitle: decisionTitle.trim(),
        category,
        goal: goal.trim(),
        additionalContext: context.trim() || undefined,
      })
      setScenarios(data.scenarios || [])
      toast.success("AI generated 3 distinct scenarios successfully.")
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(status === 429 ? "Rate limit reached. Please wait a moment." : msg || "Could not generate scenarios.")
    } finally {
      setLoading(false)
    }
  }

  const saveScenarios = async () => {
    if (!scenarios.length) return
    setSaving(true)
    try {
      // Pick steps from optimistic or realistic scenario
      const baseSteps = (scenarios[0]?.steps?.length ? scenarios[0].steps : scenarios[1]?.steps) || []

      const startNode = {
        nodeId: "start-node",
        type: "start" as const,
        title: decisionTitle.trim(),
        description: goal.trim() || "Initial choice & constraints",
        position: { x: 60, y: 300 },
      }

      const actionPositions = [
        { x: 420, y: 120 },
        { x: 820, y: 120 },
        { x: 820, y: 480 },
        { x: 1220, y: 120 },
        { x: 1220, y: 480 },
      ]

      const actionNodes = baseSteps.slice(0, 5).map((st, idx) => ({
        nodeId: `step-${idx + 1}`,
        type: "action" as const,
        title: st.title || `Phase ${idx + 1}`,
        description: `${st.timeframe ? `[${st.timeframe}] ` : ""}${st.description}`.slice(0, 350),
        position: actionPositions[idx] || { x: 420 + idx * 350, y: 120 },
      }))

      const outcomeNodes = scenarios.map((sc, sIdx) => ({
        nodeId: `out-${sc.type || sIdx}`,
        type: "outcome" as const,
        title: `${sc.type.charAt(0).toUpperCase() + sc.type.slice(1)}: ${sc.name}`,
        description: (sc.description || "").slice(0, 320),
        position: { x: 1640, y: 60 + sIdx * 240 },
      }))

      const nodes = [startNode, ...actionNodes, ...outcomeNodes]

      const edges = []
      if (actionNodes.length >= 1) {
        edges.push({
          edgeId: "edge-start-step1",
          source: "start-node",
          target: "step-1",
          label: baseSteps[0]?.timeframe || "Step 1",
        })
      }
      if (actionNodes.length >= 3) {
        edges.push({
          edgeId: "edge-start-step3",
          source: "start-node",
          target: "step-3",
          label: "Track Intel",
        })
      }
      if (actionNodes.length >= 2) {
        edges.push({
          edgeId: "edge-step1-step2",
          source: "step-1",
          target: "step-2",
          label: baseSteps[1]?.timeframe || "Step 2",
        })
      }
      if (actionNodes.length >= 4) {
        edges.push({
          edgeId: "edge-step2-step4",
          source: "step-2",
          target: "step-4",
          label: "Advanced Systems",
        })
      }
      if (actionNodes.length >= 5) {
        edges.push({
          edgeId: "edge-step3-step5",
          source: "step-3",
          target: "step-5",
          label: "Evaluations",
        })
        edges.push({
          edgeId: "edge-step4-step5",
          source: "step-4",
          target: "step-5",
          label: "Proof of Work",
        })
      }

      const lastActionTop = actionNodes.find((n) => n.nodeId === "step-4") || actionNodes[actionNodes.length - 1] || startNode
      const lastActionBottom = actionNodes.find((n) => n.nodeId === "step-5") || actionNodes[actionNodes.length - 1] || startNode

      if (outcomeNodes[0]) {
        edges.push({
          edgeId: "edge-to-opt",
          source: lastActionTop.nodeId,
          target: outcomeNodes[0].nodeId,
          label: "Best Case",
        })
      }
      if (outcomeNodes[1]) {
        edges.push({
          edgeId: "edge-to-real",
          source: (lastActionBottom || lastActionTop).nodeId,
          target: outcomeNodes[1].nodeId,
          label: "Most Likely",
        })
      }
      if (outcomeNodes[2]) {
        edges.push({
          edgeId: "edge-to-pess",
          source: lastActionBottom.nodeId,
          target: outcomeNodes[2].nodeId,
          label: "Conservative",
        })
      }

      const createdSim = await createSimulation({
        title: decisionTitle.trim(),
        description: `AI-generated roadmap & simulation for ${decisionTitle.trim()}`,
        category,
        goal: goal.trim(),
        status: "active",
        nodes,
        edges,
      })

      if (createdSim?.id) {
        await createBatchScenarios(createdSim.id, scenarios)
        queryClient.invalidateQueries({ queryKey: ["simulations"] })
        queryClient.invalidateQueries({ queryKey: ["scenarios"] })
        toast.success("Structured 9-node roadmap saved in MongoDB! Opening canvas...")
        setTimeout(() => {
          router.push(`/simulations/${createdSim.id}`)
        }, 700)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Could not save scenarios to database. Check connection.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageFrame>
      <div className="page-content">
        <PageHeading
          eyebrow="AI-POWERED EXPLORATION"
          title={
            <>
              Decision <span>Scenario</span> Studio
            </>
          }
          description="Explore optimistic, realistic, and pessimistic futures. All generated scenarios can be saved directly to MongoDB."
        />

        <section className="studio-layout">
          <article className="studio-form surface">
            <div className="studio-intro">
              <span className="studio-spark">
                <Sparkles size={18} />
              </span>
              <div>
                <h2>Define Scenario Context</h2>
                <p>Provide the decision parameters below, or load one from your MongoDB records.</p>
              </div>
            </div>

            {decisions.length > 0 && (
              <div className="quick-select-wrap">
                <span className="quick-select-label">Load from your saved decisions:</span>
                <div className="quick-select-chips">
                  {decisions.slice(0, 3).map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      className="quick-chip"
                      onClick={() => handleSelectExistingDecision(d)}
                    >
                      {d.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="form-label">
              Decision Under Consideration
              <input
                value={decisionTitle}
                onChange={(e) => setDecisionTitle(e.target.value)}
                placeholder="e.g. Should I accept the senior role or stay at current company?"
              />
            </label>

            <label className="form-label">
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Primary Goal / Success Metric
              <textarea
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What outcome represents the best long-term result?"
              />
            </label>

            <label className="form-label">
              Additional Context, Constraints, or Budget <span className="optional-caption">Optional</span>
              <textarea
                rows={2}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Financial buffer of 6 months, family considerations..."
              />
            </label>

            <button className="button button-dark studio-submit" onClick={run} disabled={loading}>
              <Sparkles size={16} />
              {loading ? "Generating Scenarios with AI..." : "Generate Scenarios"}
              <ArrowRight size={15} />
            </button>
            <p className="studio-note">Scenarios are generated via AI and can be saved to your MongoDB database.</p>
          </article>

          <div className="scenario-column">
            {scenarios.length ? (
              <>
                <div className="scenario-heading">
                  <div>
                    <span className="eyebrow">VALIDATED SCENARIO MODELS</span>
                    <h2>Generated Scenarios</h2>
                  </div>
                  <button className="button button-outline" onClick={saveScenarios} disabled={saving}>
                    <Check size={15} /> {saving ? "Saving to MongoDB..." : "Save All to Database"}
                  </button>
                </div>
                <div className="scenario-results">
                  {scenarios.map((scenario, index) => (
                    <article className={`scenario-box scenario-box-${scenario.type}`} key={`${scenario.type}-${index}`}>
                      <div className="scenario-box-header">
                        <div className="scenario-box-title-group">
                          <span className={`scenario-badge badge-${scenario.type}`}>
                            {scenario.type.toUpperCase()}
                          </span>
                          <h3>{scenario.name}</h3>
                        </div>
                        <span className={`risk-pill risk-pill-${scenario.riskLevel}`}>
                          {scenario.riskLevel} Risk
                        </span>
                      </div>

                      <p className="scenario-box-summary">{scenario.description}</p>

                      {scenario.steps?.length ? (
                        <div className="scenario-steps-container">
                          <div className="scenario-section-title">
                            <span>PHASED ROADMAP & ACTION STEPS</span>
                          </div>
                          <div className="scenario-steps-timeline">
                            {scenario.steps.map((step) => (
                              <div className="scenario-timeline-item" key={step.stepNumber}>
                                <div className="timeline-marker">
                                  <span className="step-badge">{String(step.stepNumber).padStart(2, "0")}</span>
                                  <span className="timeline-line" />
                                </div>
                                <div className="timeline-content">
                                  <div className="timeline-header">
                                    <h4 className="step-title">{step.title}</h4>
                                    {step.timeframe && (
                                      <span className="step-timeframe-tag">{step.timeframe}</span>
                                    )}
                                  </div>
                                  <p className="step-text">{step.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {scenario.outcomes?.length ? (
                        <div className="scenario-outcomes-container">
                          <div className="scenario-section-title">
                            <span>KEY PROJECTED OUTCOMES</span>
                          </div>
                          <div className="outcomes-grid">
                            {scenario.outcomes.map((outcome, oIdx) => (
                              <div className="outcome-card" key={`${outcome.title}-${oIdx}`}>
                                <div className="outcome-header">
                                  <span className="outcome-title">{outcome.title}</span>
                                  {typeof outcome.probability === "number" && (
                                    <span className="probability-tag">{outcome.probability}% Probability</span>
                                  )}
                                </div>
                                {outcome.description && (
                                  <p className="outcome-desc">{outcome.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* DYNAMIC CURATED BEST COURSES & RESOURCE LINKS FOR THIS GOAL */}
                      <div className="scenario-market-section">
                        <div className="scenario-section-title">
                          <span>TOP RECOMMENDED COURSES &amp; RESOURCE LINKS: {domainRes.domainName.toUpperCase()}</span>
                        </div>
                        <div className="course-cards-grid">
                          {domainRes.courses.map((course: { provider: string; badge: string; title: string; desc: string; url: string }, cIdx: number) => (
                            <a
                              key={`${course.title}-${cIdx}`}
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="course-card"
                            >
                              <div className="course-card-top">
                                <span className="course-provider-badge">{course.provider}</span>
                                <span className="course-free-badge">{course.badge}</span>
                              </div>
                              <h4 className="course-title">{course.title}</h4>
                              <p className="course-desc">{course.desc}</p>
                              <span className="course-link-btn">
                                Open Curriculum <ExternalLink size={12} />
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* DYNAMIC LINKEDIN & NAUKRI JOB MARKET DEMAND & INTERNSHIPS */}
                      <div className="scenario-market-section">
                        <div className="scenario-section-title">
                          <span>LIVE HIRING DEMAND &amp; OPPORTUNITY PORTALS FOR THIS GOAL</span>
                        </div>
                        <div className="market-intel-banner">
                          <div className="market-intel-header">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <TrendingUp size={16} color="#8c6e3b" />
                              <strong style={{ fontSize: 12, color: "#312d26" }}>{domainRes.domainName}</strong>
                            </div>
                            <span style={{ fontSize: 10, color: "#777065" }}>{domainRes.marketSummary}</span>
                          </div>
                          <div className="skills-pill-group">
                            {domainRes.skills.map((skill: string) => (
                              <span className="skill-pill" key={skill}>
                                {skill}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: "#6e675c" }}>
                              Live Search Queries for &quot;{domainRes.jobKeywords}&quot;:
                            </span>
                            <div className="portal-links-wrap">
                              <a
                                href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(domainRes.jobKeywords)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="portal-link-btn portal-btn-linkedin"
                              >
                                LinkedIn Jobs <ExternalLink size={11} />
                              </a>
                              <a
                                href={`https://www.naukri.com/${encodeURIComponent(domainRes.jobKeywords).replace(/%20/g, "-")}-jobs`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="portal-link-btn portal-btn-naukri"
                              >
                                Naukri Roles <ExternalLink size={11} />
                              </a>
                              <a
                                href={`https://internshala.com/internships/${encodeURIComponent(domainRes.jobKeywords).replace(/%20/g, "-")}-internship`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="portal-link-btn portal-btn-internshala"
                              >
                                Internshala <ExternalLink size={11} />
                              </a>
                              <a
                                href="https://wellfound.com/jobs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="portal-link-btn portal-btn-wellfound"
                              >
                                Wellfound <ExternalLink size={11} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SCENARIO SPECIFIC STRATEGY */}
                      {scenario.type === "optimistic" && (
                        <div style={{ marginTop: 12, padding: "11px 15px", borderRadius: 8, background: "#edf5ea", border: "1px solid #d4e7d0", fontSize: 11, color: "#436c3e", display: "flex", alignItems: "center", gap: 8 }}>
                          <Sparkles size={16} />
                          <span><strong>Fast-Track Sprint Strategy:</strong> Aggressive focus on shipping 2-3 tangible, verifiable deliverables and building daily proof of work for {decisionTitle || goal || "this goal"}.</span>
                        </div>
                      )}
                      {scenario.type === "realistic" && (
                        <div style={{ marginTop: 12, padding: "11px 15px", borderRadius: 8, background: "#fbf6ec", border: "1px solid #f0e2ca", fontSize: 11, color: "#8c6e3b", display: "flex", alignItems: "center", gap: 8 }}>
                          <Clock3 size={16} />
                          <span><strong>Realistic Pacing:</strong> Dedicate 15-20 hours weekly. Master foundational methodologies thoroughly before broad applications or outreach.</span>
                        </div>
                      )}
                      {scenario.type === "pessimistic" && (
                        <div style={{ marginTop: 12, padding: "11px 15px", borderRadius: 8, background: "#fdf1ed", border: "1px solid #f6d6cd", fontSize: 11, color: "#9e4e37", display: "flex", alignItems: "center", gap: 8 }}>
                          <ShieldCheck size={16} />
                          <span><strong>Risk-Managed Contingency:</strong> If target milestones face market delays, secure bridge opportunities or internships to gain verified experience.</span>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="scenario-placeholder">
                <div className="scenario-art">
                  <span className="art-sun" />
                  <span className="art-hill hill-one" />
                  <span className="art-hill hill-two" />
                  <span className="art-path" />
                </div>
                <div className="placeholder-copy">
                  <span className="eyebrow">AWAITING INPUT</span>
                  <h2>
                    Explore possible
                    <br />
                    pathways forward.
                  </h2>
                  <p>
                    Enter your decision details on the left and click &apos;Generate Scenarios&apos; to model potential
                    outcomes.
                  </p>
                </div>
                <div className="placeholder-tags">
                  <span>Optimistic Model</span>
                  <span>Realistic Projection</span>
                  <span>Conservative Assessment</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageFrame>
  )
}
