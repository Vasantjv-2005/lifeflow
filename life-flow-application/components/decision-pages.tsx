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
  Database,
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
  updateDecision,
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
  const cat = (category || "").toLowerCase()
  const isCareerOrEducation = cat.includes("career") || cat.includes("education")

  // 1. Relationships & Family
  if (/\b(relationship|relationships|partner|marriage|dating|couple|family|spouse|friendship|co-living|relocate together)\b/i.test(q) || cat.includes("relationship")) {
    return {
      domainName: "Relationship Harmony & Shared Living",
      marketSummary: "Evidence-based relationship research (Gottman Institute, NVC) emphasizes shared values, financial transparency, and constructive conflict habits.",
      skills: ["Active Listening", "Nonviolent Communication (NVC)", "Emotional Intelligence", "Financial Transparency", "Healthy Boundary Setting", "Gottman 5:1 Conflict Ratio", "Shared Living Blueprint"],
      courses: [
        {
          provider: "The Gottman Institute",
          badge: "Clinical Standard",
          title: "The Seven Principles for Making Marriage Work",
          desc: "World-renowned research on friendship, mutual admiration, emotional bank accounts, and overcoming gridlock.",
          url: "https://www.gottman.com/",
        },
        {
          provider: "NVC Center",
          badge: "Communication",
          title: "Nonviolent Communication Core Workshop",
          desc: "Marshall Rosenberg's 4-step framework: Observations, Feelings, Needs, and Requests to resolve tension.",
          url: "https://www.cnvc.org/",
        },
        {
          provider: "Crucial Learning",
          badge: "High-Stakes Dialogue",
          title: "Crucial Conversations for Couples",
          desc: "Proven techniques to speak persuasively, listen non-defensively, and resolve sensitive relationship topics.",
          url: "https://cruciallearning.com/",
        },
        {
          provider: "Attachment Project",
          badge: "Self-Discovery",
          title: "Adult Attachment Theory & Dynamics",
          desc: "Understand secure, anxious, and avoidant attachment patterns to foster deep relational safety.",
          url: "https://www.attachmentproject.com/",
        },
      ],
      jobKeywords: "",
    }
  }

  // 2. Health & Wellbeing / Vitality
  if (/\b(health|fitness|wellness|wellbeing|weight|nutrition|workout|mental health|sleep|diet|exercise|therapy|marathon|gym)\b/i.test(q) || cat.includes("health") || cat.includes("wellbeing")) {
    return {
      domainName: "Health, Vitality & Wellness Protocol",
      marketSummary: "Clinical health research confirms that progressive strength training, whole food nutrition, and 7-9 hours of restorative sleep create compound lifelong vitality.",
      skills: ["Progressive Overload", "Zone 2 Cardiovascular Base", "Macronutrient Pacing", "Sleep Architecture (REM/Deep)", "Circadian Light Alignment", "Stress Biomarkers (HRV)", "Sustainable Habit Stacking"],
      courses: [
        {
          provider: "Huberman Lab",
          badge: "Neurobiology",
          title: "Foundational Health & Sleep Toolkits",
          desc: "Science-based protocols for sleep optimization, circadian entrainment, morning sunlight, and physical energy.",
          url: "https://www.hubermanlab.com/",
        },
        {
          provider: "Precision Nutrition",
          badge: "Evidence-Based",
          title: "Metabolic Nutrition & Habit Science",
          desc: "Sustainable nutritional habits, protein adequacy, energy balance, and behavioral lifestyle coaching.",
          url: "https://www.precisionnutrition.com/",
        },
        {
          provider: "Stronger by Science",
          badge: "Exercise Science",
          title: "Resistance Training & Hypertrophy Protocols",
          desc: "Biomechanical principles of progressive overload, recovery management, and injury prevention.",
          url: "https://www.strongerbyscience.com/",
        },
        {
          provider: "Stanford Medicine",
          badge: "Preventive Care",
          title: "Lifestyle Medicine & Cardiovascular Health",
          desc: "Cardiometabolic health, lipid optimization, blood pressure management, and long-term healthspan.",
          url: "https://med.stanford.edu/",
        },
      ],
      jobKeywords: "",
    }
  }

  // 3. Money & Finance / Wealth
  if (/\b(money|finance|financial|investing|investment|savings|debt|budget|wealth|portfolio|stocks|crypto|emergency fund)\b/i.test(q) || cat.includes("finance") || cat.includes("money")) {
    return {
      domainName: "Personal Finance & Wealth Architecture",
      marketSummary: "Long-term financial independence is driven by savings rate, debt elimination, low-cost index compounding, and systematic budgeting.",
      skills: ["Zero-Based Budgeting (50/30/20)", "High-Yield Emergency Fund (3-6 Months)", "Debt Avalanche Strategy", "Broad-Market Index Funds (Bogleheads)", "Tax-Advantaged Accounts", "Automated Dollar-Cost Averaging"],
      courses: [
        {
          provider: "Bogleheads",
          badge: "Vanguard Philosophy",
          title: "Bogleheads Passive Index Investing Track",
          desc: "John Bogle's low-cost, broadly diversified index fund philosophy for compounding long-term wealth.",
          url: "https://www.bogleheads.org/wiki/Getting_started",
        },
        {
          provider: "Khan Academy",
          badge: "100% Free",
          title: "Personal Finance Master Course",
          desc: "Complete comprehensive modules on budgeting, credit scores, debt management, taxes, and investing.",
          url: "https://www.khanacademy.org/college-careers-more/personal-finance",
        },
        {
          provider: "Morningstar",
          badge: "Financial Analysis",
          title: "Investing Classroom & Asset Allocation",
          desc: "Master modern portfolio theory, risk tolerance assessment, and ETF/mutual fund expense ratios.",
          url: "https://www.morningstar.com/",
        },
        {
          provider: "Financial Literacy Hub",
          badge: "Practical Guide",
          title: "The Psychology of Money Frameworks",
          desc: "Behavioral finance strategies to overcome emotional spending, resist market hype, and build generational wealth.",
          url: "https://www.investopedia.com/personal-finance-4427760",
        },
      ],
      jobKeywords: "",
    }
  }

  // 4. Lifestyle & Intentional Living
  if (/\b(lifestyle|habit|habits|travel|work-life|work life|minimalism|routine|hobby|digital nomad)\b/i.test(q) || cat.includes("lifestyle")) {
    return {
      domainName: "Intentional Lifestyle & Daily Energy Design",
      marketSummary: "Designing daily routines around circadian energy peaks and ruthless elimination of low-value distractions compounds personal fulfillment.",
      skills: ["Time Blocking (Deep Work)", "Habit Stacking (Atomic Habits)", "Digital Clutter Elimination", "Work-Life Boundary Enforcement", "Environment Redesign", "Restorative Downtime Scheduling"],
      courses: [
        {
          provider: "James Clear",
          badge: "Atomic Habits",
          title: "The Habits Academy",
          desc: "Scientific frameworks for making good habits easy and bad habits invisible through environment design.",
          url: "https://jamesclear.com/atomic-habits",
        },
        {
          provider: "Cal Newport",
          badge: "Focus & Depth",
          title: "Deep Work & Digital Minimalism",
          desc: "Rules for focused success in a distracted world and reclaiming autonomous control of your attention.",
          url: "https://calnewport.com/books/deep-work/",
        },
        {
          provider: "Coursera / Yale",
          badge: "Happiness Science",
          title: "The Science of Well-Being (Dr. Laurie Santos)",
          desc: "Yale's most popular class: Psychological strategies to rewire your daily happiness, gratitude, and purpose.",
          url: "https://www.coursera.org/learn/the-science-of-well-being",
        },
        {
          provider: "The Minimalists",
          badge: "Intentionality",
          title: "Essentialism & Meaningful Living",
          desc: "Decluttering mental and physical space to focus exclusively on what brings genuine value and joy.",
          url: "https://www.theminimalists.com/",
        },
      ],
      jobKeywords: "",
    }
  }

  // 5. Business & Ventures / Culinary & Bakery / Cafe / Retail / Startup
  if (
    cat.includes("business") ||
    /\b(bakery|bake|baking|bread|sourdough|artisan|pastry|cafe|coffee|restaurant|food|culinary|catering|startup|business|venture|ventures|e-commerce|ecommerce|store|shop|boutique|retail|product manager|saas|agency|marketing|sales|freelance|entrepreneur)\b/i.test(q)
  ) {
    // Culinary / Bakery / Cafe / Food Business specifically
    if (/\b(bakery|bake|baking|bread|sourdough|artisan|pastry|cafe|coffee|restaurant|food|culinary|catering)\b/i.test(q)) {
      return {
        domainName: "Artisan Culinary & Bakery Enterprise",
        marketSummary: "Successful artisan bakeries and cafes rely on authentic recipe standardization, high daily inventory turns, local brand loyalty, and tight prime food/labor cost margins.",
        skills: ["Sourdough Fermentation & Hydration Schedules", "Food Safety Standards & HACCP Protocols", "Commercial Kitchen Equipment & Daily Batch Workflow", "Prime Cost Economics (COGS < 30%, Labor < 30%)", "Wholesale Accounts & B2B Cafe Supply", "Community Branding, Storytelling & Packaging"],
        courses: [
          {
            provider: "King Arthur Baking School",
            badge: "Artisan Standard",
            title: "Artisan Bread & Sourdough Masterclass",
            desc: "Comprehensive baker's percentages, levain fermentation cycles, high-hydration dough shaping, and crust steam management.",
            url: "https://www.kingarthurbaking.com/baking-school",
          },
          {
            provider: "SF Baking Institute",
            badge: "Professional Track",
            title: "Viennoiserie & Artisan Baking Fundamentals",
            desc: "Industrial-grade training in sourdough starters, preferments, thermal profiles, and production schedule management.",
            url: "https://sfbi.com/",
          },
          {
            provider: "Cornell University",
            badge: "Hospitality Management",
            title: "Food & Beverage Management Specialization",
            desc: "Standardizing kitchen food costs, margin calculations, menu pricing engineering, and supplier vendor negotiations.",
            url: "https://online.cornell.edu/food-and-beverage-management",
          },
          {
            provider: "U.S. SBA",
            badge: "Small Business Guide",
            title: "Starting & Financing a Food Business",
            desc: "Licensing, commercial health department permits, equipment leasing, and local retail location scouting.",
            url: "https://www.sba.gov/business-guide/plan-your-business",
          },
        ],
        jobKeywords: "",
      }
    }

    // General Business, Startup & Ventures
    return {
      domainName: "Business, Startup & Venture Strategy",
      marketSummary: "Validated early customer traction and strong unit economics (LTV/CAC) dramatically outperform pure theory.",
      skills: ["Customer Discovery & Problem Validation", "Rapid MVP Prototyping", "Unit Economics & CAC/LTV Ratios", "Go-To-Market (GTM) Distribution Channels", "Cash Flow & Working Capital Runway", "Conversion Rate Optimization (CRO)"],
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
      jobKeywords: "",
    }
  }

  // 6. Higher Education & Competitive Exams
  if (cat.includes("education") || /\b(masters|study abroad|exam|upsc|gre|toefl|ielts|phd|gate|mba|college|university)\b/i.test(q)) {
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
      jobKeywords: isCareerOrEducation ? (title ? title.slice(0, 30) : "Graduate Research Fellow") : "",
    }
  }

  // 7. Career Tech Tracks (Checked with strict word boundaries \b)
  if (/\b(ai|artificial intelligence|machine learning|deep learning|data science|data scientist|data analyst|nlp|llm|computer vision|genai)\b/i.test(q)) {
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
      jobKeywords: isCareerOrEducation ? "AI Machine Learning Engineer" : "",
    }
  }

  if (/\b(devops|cloud|aws|azure|gcp|docker|kubernetes|terraform|sre|platform engineering|sysadmin)\b/i.test(q)) {
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
      jobKeywords: isCareerOrEducation ? "DevOps Cloud Engineer" : "",
    }
  }

  if (/\b(mobile|flutter|react native|ios|swift|android|kotlin|app dev)\b/i.test(q)) {
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
      jobKeywords: isCareerOrEducation ? "Mobile App Developer" : "",
    }
  }

  if (/\b(cyber|cybersecurity|security|hacking|penetration|infosec|soc|ethical hack|network security)\b/i.test(q)) {
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
      jobKeywords: isCareerOrEducation ? "Cybersecurity Analyst" : "",
    }
  }

  if (/\b(full stack|full-stack|frontend|backend|web dev|javascript|react|node|typescript|mern|software|coding|programming|developer)\b/i.test(q)) {
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
      jobKeywords: isCareerOrEducation ? "Full Stack Developer" : "",
    }
  }

  // General / Custom user goal fallback
  const cleanQ = title || goal || "career transition"
  return {
    domainName: `Tailored Strategy: ${cleanQ}`,
    marketSummary: isCareerOrEducation
      ? `Active hiring & opportunity trends for "${cleanQ}" across leading industry portals and professional networks.`
      : `Core foundational methodologies and execution framework for "${cleanQ}".`,
    skills: ["Prerequisite Fundamentals", "Core Domain Methodologies", "Quantifiable Proof of Work", "Action Plan Execution", "Risk Mitigation & Review"],
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
    jobKeywords: isCareerOrEducation ? cleanQ : "",
  }
}

export function AIStudioPage() {
  const router = useRouter()
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>("")
  const [decisionTitle, setDecisionTitle] = useState("")
  const [category, setCategory] = useState("Career")
  const [goal, setGoal] = useState("")
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingDecision, setSavingDecision] = useState(false)
  const [context, setContext] = useState("")

  const domainRes = useMemo(
    () => getDomainResources(decisionTitle, goal, category),
    [decisionTitle, goal, category]
  )
  const isCareerOrEducation = useMemo(() => {
    const c = (category || "").toLowerCase()
    return c.includes("career") || c.includes("education")
  }, [category])

  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ["decisions"], queryFn: getDecisions })
  const decisions: Decision[] = Array.isArray(query.data) ? query.data : []

  const handleSelectExistingDecision = (d: Decision) => {
    setSelectedDecisionId(d.id)
    setDecisionTitle(d.title)
    setCategory(d.category || "Career")
    setGoal(d.goal || "")
    setContext(d.currentSituation || "")
    toast.success(`Loaded "${d.title}" from MongoDB`)
  }

  const handleResetToNewDecision = () => {
    setSelectedDecisionId("")
    setDecisionTitle("")
    setCategory("Career")
    setGoal("")
    setContext("")
    setScenarios([])
    toast.info("Cleared form. Ready to define a new decision.")
  }

  const handleSaveDecisionDirectly = async (asNew: boolean = false) => {
    if (decisionTitle.trim().length < 2) {
      toast.error("Please enter a decision title (at least 2 characters) before saving.")
      return
    }
    setSavingDecision(true)
    try {
      if (selectedDecisionId && !asNew) {
        await updateDecision(selectedDecisionId, {
          title: decisionTitle.trim(),
          category,
          goal: goal.trim(),
          currentSituation: context.trim(),
        })
        toast.success(`Updated "${decisionTitle.trim()}" directly in MongoDB!`)
      } else {
        const created = await createDecision({
          title: decisionTitle.trim(),
          category,
          goal: goal.trim(),
          currentSituation: context.trim(),
          status: "active",
        })
        if (created?.id) {
          setSelectedDecisionId(created.id)
        }
        toast.success(`Saved "${decisionTitle.trim()}" directly to MongoDB!`)
      }
      queryClient.invalidateQueries({ queryKey: ["decisions"] })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Failed to save decision to MongoDB.")
    } finally {
      setSavingDecision(false)
    }
  }

  const run = async () => {
    if (decisionTitle.trim().length < 2 || goal.trim().length < 2) {
      toast.error("Please enter a decision title and goal to explore.")
      return
    }
    setLoading(true)
    try {
      // Auto-save or sync the decision directly to MongoDB so it's always persisted
      try {
        if (selectedDecisionId) {
          await updateDecision(selectedDecisionId, {
            title: decisionTitle.trim(),
            category,
            goal: goal.trim(),
            currentSituation: context.trim(),
          })
        } else {
          const created = await createDecision({
            title: decisionTitle.trim(),
            category,
            goal: goal.trim(),
            currentSituation: context.trim(),
            status: "active",
          })
          if (created?.id) {
            setSelectedDecisionId(created.id)
          }
        }
        queryClient.invalidateQueries({ queryKey: ["decisions"] })
      } catch (saveErr) {
        console.warn("Could not auto-sync decision to MongoDB:", saveErr)
      }

      const data = await generateScenarios({
        decisionTitle: decisionTitle.trim(),
        category,
        goal: goal.trim(),
        additionalContext: context.trim() || undefined,
      })
      setScenarios(data.scenarios || [])
      toast.success("Decision saved to MongoDB & scenarios generated!")
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

            {/* SAVED DECISIONS DROPDOWN */}
            <div className="saved-decisions-picker">
              <div className="picker-header">
                <span className="picker-label">
                  <Database size={13} style={{ color: "#10b981", marginRight: 6 }} />
                  Load from your saved decisions:
                </span>
                <span className="picker-badge">
                  {decisions.length} available
                </span>
              </div>

              <div className="picker-select-wrap">
                <select
                  className="decision-saved-dropdown"
                  value={selectedDecisionId}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "__new__") {
                      handleResetToNewDecision()
                    } else if (val) {
                      const found = decisions.find((d) => d.id === val)
                      if (found) handleSelectExistingDecision(found)
                    } else {
                      setSelectedDecisionId("")
                    }
                  }}
                >
                  <option value="">
                    {decisions.length > 0
                      ? `-- Select a saved decision (${decisions.length} available) --`
                      : "-- No saved decisions in MongoDB yet --"}
                  </option>
                  <option value="__new__">+ Start with a New / Blank Decision</option>
                  {decisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} • [{d.category || "General"}]
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="picker-chevron" />
              </div>

              {selectedDecisionId && (
                <div className="picker-loaded-bar">
                  <span>
                    Active Decision: <strong>{decisionTitle || "Loaded Decision"}</strong>
                  </span>
                  <button
                    type="button"
                    className="picker-clear-btn"
                    onClick={handleResetToNewDecision}
                    title="Clear and create a new decision"
                  >
                    <X size={12} /> Clear / New
                  </button>
                </div>
              )}
            </div>

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

            <button
              type="button"
              className="button button-dark studio-submit"
              onClick={run}
              disabled={loading}
              style={{ width: "100%", marginTop: 10 }}
            >
              <Sparkles size={16} />
              {loading ? "Saving to MongoDB & Generating Scenarios..." : "Generate Scenarios"}
              <ArrowRight size={15} />
            </button>
            <p className="studio-note">
              <ShieldCheck size={13} style={{ color: "#10b981", display: "inline-block", marginRight: 5 }} />
              Decisions, parameters, and generated scenarios are automatically saved directly to your MongoDB database.
            </p>
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

                      {/* STRATEGIC COMPETENCIES & HIRING PORTALS */}
                      <div className="scenario-market-section">
                        <div className="scenario-section-title">
                          <span>
                            {isCareerOrEducation && domainRes.jobKeywords
                              ? "LIVE HIRING DEMAND & OPPORTUNITY PORTALS FOR THIS GOAL"
                              : `CORE STRATEGIC COMPETENCIES & DOMAIN MASTERY: ${domainRes.domainName.toUpperCase()}`}
                          </span>
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
                          {Boolean(isCareerOrEducation && domainRes.jobKeywords && domainRes.jobKeywords.trim().length > 0) && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px dashed #e6decb" }}>
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
                          )}
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
