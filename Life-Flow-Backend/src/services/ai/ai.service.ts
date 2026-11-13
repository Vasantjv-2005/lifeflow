import { z } from "zod";

import { env } from "../../config/env";
import { AppError } from "../../middleware/error.middleware";

/**
 * Input required to generate decision scenarios.
 */
export interface GenerateScenariosInput {
    decisionTitle: string;
    category: string;
    goal: string;
    currentSituation?: string;
    timeAvailable?: number;
    budget?: number;
    additionalContext?: string;
}

/**
 * Runtime validation for AI-generated scenario data.
 *
 * AI output is validated before use.
 */
const generatedScenarioSchema = z.object({
    scenarios: z
        .array(
            z.object({
                name: z.string().trim().min(2).max(150),
                description: z.string().trim().min(1).max(3000),
                type: z.enum([
                    "optimistic",
                    "realistic",
                    "pessimistic",
                    "custom",
                ]),
                riskLevel: z.enum(["low", "medium", "high"]),
                steps: z
                    .array(
                        z.object({
                            stepNumber: z.number().int().min(1),
                            title: z.string().trim().min(1).max(250),
                            description: z.string().trim().min(1).max(3000),
                            timeframe: z.string().trim().max(100).optional(),
                        })
                    )
                    .max(20),
                outcomes: z
                    .array(
                        z.object({
                            title: z.string().trim().min(1).max(250),
                            description: z.string().trim().min(1).max(3000),
                            probability: z.number().min(0).max(100).optional(),
                            impact: z.enum(["low", "medium", "high"]),
                        })
                    )
                    .max(10),
            })
        )
        .min(1)
        .max(3),
});

/**
 * Public type representing validated AI-generated scenarios.
 */
export type GeneratedScenarios = z.infer<
    typeof generatedScenarioSchema
>;

/**
 * OpenAI-compatible chat-completions response structure.
 */
interface ChatCompletionResponse {
    choices?: Array<{
        message?: {
            content?: string | null;
        };
    }>;
}

/**
 * Reads the AI configuration from environment variables.
 */
const getAIConfig = (): {
    apiUrl: string;
    apiKey: string;
    model: string;
} => {
    const apiUrl = env.AI_API_URL?.trim() || "";
    const apiKey = env.AI_API_KEY?.trim() || "";
    const model = env.AI_MODEL?.trim() || "llama-3.3-70b-versatile";

    return { apiUrl, apiKey, model };
};

/**
 * High-fidelity domain fallback scenario generator.
 *
 * Provides exhaustive, structured, actionable roadmaps detailing:
 * - Every language, library, and framework to learn
 * - Exact steps for ATS resume building and portfolio optimization
 * - How to crack technical & HR interviews, including top critical questions.
 */
export const generateStructuredScenarioFallback = (
    input: GenerateScenariosInput
): GeneratedScenarios => {
    const combinedText = `${input.decisionTitle} ${input.goal} ${input.category} ${input.additionalContext || ""}`.toLowerCase();

    const isAI = /(ai|artificial intelligence|machine learning|deep learning|data science|data scientist|data analyst|nlp|llm|computer vision|genai)/i.test(
        combinedText
    );
    const isCloudDevOps = /(devops|cloud|aws|azure|gcp|docker|kubernetes|terraform|sre|platform engineering|sysadmin)/i.test(
        combinedText
    );
    const isMobile = /(mobile|flutter|react native|ios|swift|android|kotlin|app dev)/i.test(
        combinedText
    );
    const isCyberSec = /(cyber|security|hacking|penetration|infosec|soc|ethical hack|network security)/i.test(
        combinedText
    );
    const isDesign = /(ui|ux|ui\/ux|product design|graphic design|figma|designer)/i.test(
        combinedText
    );
    const isBusiness = /(startup|business|e-commerce|agency|marketing|sales|freelance|entrepreneur|product manager|saas)/i.test(
        combinedText
    );
    const isEducation = /(masters|study abroad|exam|upsc|gre|toefl|ielts|phd|gate|mba|college|university)/i.test(
        combinedText
    );
    const isWebDev = /(full stack|full-stack|frontend|backend|web dev|javascript|react|node|typescript|mern|software|coding|programming|developer)/i.test(
        combinedText
    );

    // 1. ARTIFICIAL INTELLIGENCE, DATA SCIENCE & MACHINE LEARNING
    if (isAI) {
        return {
            scenarios: [
                {
                    name: "AI/ML Mastery & Engineering Placement (Optimistic)",
                    description: `Accelerated pathway for "${input.decisionTitle}": Master Python, Linear Algebra, PyTorch, LLMs/RAG, and deploy production ML microservices to achieve "${input.goal}" within 6 months.`,
                    type: "optimistic",
                    riskLevel: "low",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Python, Math Foundations & Data Science",
                            timeframe: "Months 1-2",
                            description: "Master Python (OOP, NumPy, Pandas, Vectorized computing), Linear Algebra (Matrices, Eigenvalues), Calculus (Gradients, Partial derivatives), Probability & Statistics. Work with SQL and clean real-world datasets on Kaggle.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Machine Learning & Deep Learning with PyTorch",
                            timeframe: "Months 3-4",
                            description: "Supervised & Unsupervised Learning (Scikit-Learn: Regression, Decision Trees, XGBoost). Deep Learning with PyTorch: Neural Networks, Backpropagation, CNNs for Vision, Transformers and Attention mechanisms with Hugging Face.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Production GenAI, RAG & LLM Application Systems",
                            timeframe: "Month 5",
                            description: "Build 3 production AI applications: 1) Advanced RAG Assistant with Vector DB (Pinecone/Chroma, LangChain/LlamaIndex), 2) Fine-tuned Open LLM for domain classification, 3) Real-time FastAPI model inference pipeline with Docker & MLflow.",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: High-Impact AI Portfolio & ATS Tech Resume",
                            timeframe: "Months 5-6",
                            description: "Format 1-page ATS resume highlighting model accuracy metrics, latency benchmarks, and dataset scale ('Engineered RAG pipeline with <120ms retrieval latency over 50k documents'). Public GitHub repos with interactive Hugging Face Spaces demos.",
                        },
                        {
                            stepNumber: 5,
                            title: "Phase 5: Cracking AI/ML Interviews & Crucial Questions",
                            timeframe: "Month 6",
                            description: "Master High-Frequency Questions: 1) Bias-Variance tradeoff & Regularization (L1/L2). 2) Transformer self-attention mathematical formulation. 3) Vector indexing algorithms (HNSW vs IVFFlat). 4) Vanishing gradients & Adam optimizer dynamics. 5) Model drift & evaluation metrics (ROC-AUC, F1, Perplexity).",
                        },
                    ],
                    outcomes: [
                        {
                            title: "AI/ML Engineer Offer or Paid Research Fellowship",
                            description: `Secure target role fulfilling "${input.goal}" with high-impact compensation.`,
                            probability: 84,
                            impact: "high",
                        },
                        {
                            title: "3 Live Production GenAI Capstones on Hugging Face",
                            description: "Public verifiable proof of working machine learning engineering skills.",
                            probability: 92,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Steady Machine Learning Pragmatic Growth (Realistic)",
                    description: `Balanced 6-8 month transition into Data Science & AI: Build reliable model development habits, master tabular and NLP modeling, and secure a data/AI role.`,
                    type: "realistic",
                    riskLevel: "medium",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Python, SQL & Exploratory Data Analysis",
                            timeframe: "Months 1-3",
                            description: "Solidify Python programming, complex SQL joins and aggregations, and data visualization using Matplotlib and Seaborn.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Scikit-Learn & Foundation Models",
                            timeframe: "Months 4-5",
                            description: "Build predictive models, evaluate cross-validation scores, and utilize pre-trained models via Hugging Face pipelines.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Applied Projects & Interview Preparation",
                            timeframe: "Months 6-7",
                            description: "Construct 2 complete end-to-end data pipelines, polish technical resume, and practice data modeling coding screens.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Data Analyst / Associate ML Engineer Placement",
                            description: "Successfully break into the AI/Data domain with strong upward mobility.",
                            probability: 76,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Risk-Managed AI Transition & Project Bridge (Conservative)",
                    description: "Conservative assessment: Mitigate competitive screening by securing data analyst internships or contract data engineering gigs.",
                    type: "pessimistic",
                    riskLevel: "high",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Practical Data Wrangling & Business Analytics",
                            timeframe: "Months 1-3",
                            description: "Focus on immediate high-demand business skills: SQL, Excel/PowerBI, and basic Python automation.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Transition into Junior Analytics / AI Support",
                            timeframe: "Months 4-6",
                            description: "Apply for data analyst and AI annotation/ops roles to build workplace credibility while continuing ML studies.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Data / AI Operations Foothold Established",
                            description: "Gain industry experience with structured runway to transition into full ML engineering.",
                            probability: 58,
                            impact: "medium",
                        },
                    ],
                },
            ],
        };
    }

    // 2. CLOUD, DEVOPS & INFRASTRUCTURE
    if (isCloudDevOps) {
        return {
            scenarios: [
                {
                    name: "Cloud & DevOps Architecture Mastery (Optimistic)",
                    description: `Fast-track DevOps pathway for "${input.decisionTitle}": Master Linux, Docker, Kubernetes, Terraform IaC, AWS/GCP, and CI/CD pipelines to achieve "${input.goal}".`,
                    type: "optimistic",
                    riskLevel: "low",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Linux Kernel, Shell Scripting & Networking",
                            timeframe: "Months 1-2",
                            description: "Master Linux system administration, Bash automation, TCP/IP, DNS, SSL/TLS, and Git branching workflows.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Containerization & Kubernetes Orchestration",
                            timeframe: "Months 2-3",
                            description: "Multi-stage Docker builds, image security scanning, Kubernetes architecture (Pods, Services, Ingress, StatefulSets, Helm Charts).",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Infrastructure as Code (Terraform) & Cloud (AWS)",
                            timeframe: "Months 4-5",
                            description: "Provision VPCs, EKS, IAM, and RDS with Terraform. Build enterprise CI/CD with GitHub Actions & ArgoCD (GitOps).",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: Observability, ATS Resume & Certifications",
                            timeframe: "Month 5-6",
                            description: "Configure Prometheus & Grafana monitoring. 1-page ATS resume with AWS Certified Solutions Architect or CKA credentials.",
                        },
                        {
                            stepNumber: 5,
                            title: "Phase 5: Cracking DevOps Interviews & Key Questions",
                            timeframe: "Month 6",
                            description: "Master High-Frequency Questions: 1) Kubernetes Pod lifecycle & CrashLoopBackOff debugging. 2) Blue-Green vs Canary deployments. 3) Terraform state locks & drift detection. 4) Zero-downtime database migrations. 5) Disaster recovery RTO vs RPO.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "DevOps / Cloud Platform Engineer Offer",
                            description: `High-value placement fulfilling "${input.goal}" with cloud infrastructure ownership.`,
                            probability: 86,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Steady Cloud Engineer Transition (Realistic)",
                    description: "Pragmatic path: Focus on AWS/Azure services, Docker, and GitHub Actions to land a cloud support or junior DevOps role.",
                    type: "realistic",
                    riskLevel: "medium",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Cloud Fundamentals & Scripting",
                            timeframe: "Months 1-3",
                            description: "Learn AWS core services (EC2, S3, IAM) and Python/Bash automation scripting.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Docker Containers & CI/CD Pipelines",
                            timeframe: "Months 4-5",
                            description: "Automate build and deployment pipelines for web applications with Docker and GitHub Actions.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Certification & Job Search Campaign",
                            timeframe: "Months 6-7",
                            description: "Pass AWS Certified Cloud Practitioner / Solutions Architect exam and apply to cloud infrastructure teams.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Junior Cloud / DevOps Engineer Placement",
                            description: "Successful transition into cloud operations within 6-7 months.",
                            probability: 78,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Conservative Infrastructure Support Ramp (Conservative)",
                    description: "Safety-first pathway: Enter through Systems Administration or IT Cloud Support to build enterprise production credibility.",
                    type: "pessimistic",
                    riskLevel: "high",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: System Admin & Helpdesk Transition",
                            timeframe: "Months 1-3",
                            description: "Linux troubleshooting, networking fundamentals, and entry-level cloud administration.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Internal Cloud Project Ownership",
                            timeframe: "Months 4-6",
                            description: "Automate internal server backups and deployment scripts to transition into junior DevOps engineering.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "IT Cloud Support / Junior SysAdmin Role",
                            description: "Practical entry into tech infrastructure with low risk and steady progression.",
                            probability: 60,
                            impact: "medium",
                        },
                    ],
                },
            ],
        };
    }

    // 3. MOBILE APP DEVELOPMENT (FLUTTER / REACT NATIVE / IOS / ANDROID)
    if (isMobile) {
        return {
            scenarios: [
                {
                    name: "Production Mobile Engineer Sprint (Optimistic)",
                    description: `Accelerated mobile development pathway for "${input.decisionTitle}": Master Flutter/Dart or React Native, ship 2 live store apps, and hit "${input.goal}".`,
                    type: "optimistic",
                    riskLevel: "low",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Mobile UI Architecture & State Management",
                            timeframe: "Months 1-2",
                            description: "Master Dart/Flutter or React Native/TypeScript. State management (Bloc/Provider or Redux/Zustand), responsive layouts, and navigation routers.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Native APIs, Local Database & Backend Sync",
                            timeframe: "Months 3-4",
                            description: "Integrate camera, GPS, push notifications, offline SQLite/Hive storage, and REST/GraphQL backend sync with Firebase/Supabase.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: 2 Published Apps on App Store & Play Store",
                            timeframe: "Month 5",
                            description: "Build, sign, and release 2 production mobile applications: 1) Real-time collaborative mobile app, 2) E-commerce/booking platform with in-app payments.",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: Mobile ATS Resume & GitHub Showcase",
                            timeframe: "Months 5-6",
                            description: "1-page ATS resume with direct Play Store / TestFlight download links, frame-rate performance stats, and GitHub code architecture.",
                        },
                        {
                            stepNumber: 5,
                            title: "Phase 5: Cracking Mobile Dev Interviews & Key Questions",
                            timeframe: "Month 6",
                            description: "Master Crucial Questions: 1) Flutter Widget lifecycle / React Native bridge vs new architecture (JSI). 2) Offline sync & conflict resolution. 3) Memory leaks & image caching optimization. 4) Push notification handling in background states.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Mobile App Developer Offer at High-Growth Team",
                            description: `Secure mobile developer position fulfilling "${input.goal}".`,
                            probability: 85,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Steady Cross-Platform Mobile Transition (Realistic)",
                    description: "Solid 6-8 month roadmap to build polished mobile applications and land an entry-level mobile developer job.",
                    type: "realistic",
                    riskLevel: "medium",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Cross-Platform UI Foundations",
                            timeframe: "Months 1-3",
                            description: "Build clean, pixel-perfect user interfaces, handle user input, and master asynchronous API calls.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: App Store Deployment & Testing",
                            timeframe: "Months 4-5",
                            description: "Deploy one tested app on Google Play Store, write automated unit tests, and gather user feedback.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Portfolio Outreach & Applications",
                            timeframe: "Months 6-7",
                            description: "Apply to mobile software positions with video walkthroughs and live app links.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Junior Mobile Developer Role Secured",
                            description: "Transition into professional mobile app development.",
                            probability: 75,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Conservative Mobile Freelance & Internship Runway (Conservative)",
                    description: "Conservative assessment: Build practical experience through client freelance gigs or paid mobile internships.",
                    type: "pessimistic",
                    riskLevel: "high",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Core Mobile Development Practice",
                            timeframe: "Months 1-3",
                            description: "Build clones of popular mobile apps to master UI layouts and API integrations.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Local Client Freelancing & Internships",
                            timeframe: "Months 4-6",
                            description: "Offer mobile development services to local businesses or secure mobile internships on Internshala.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Verified Commercial Mobile Experience",
                            description: "Establish a credible track record to transition into a full-time role.",
                            probability: 55,
                            impact: "medium",
                        },
                    ],
                },
            ],
        };
    }

    // 4. CYBERSECURITY & ETHICAL HACKING
    if (isCyberSec) {
        return {
            scenarios: [
                {
                    name: "Offensive & Defensive Security Mastery (Optimistic)",
                    description: `Accelerated cybersecurity pathway for "${input.decisionTitle}": Master Linux, Networking, Penetration Testing, OWASP Top 10, and achieve "${input.goal}".`,
                    type: "optimistic",
                    riskLevel: "low",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Linux, Networking Protocols & Python Scripting",
                            timeframe: "Months 1-2",
                            description: "Deep dive into OSI model, TCP/IP, packet analysis with Wireshark, Linux kernel security, and Python network automation.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Web App Security, OWASP Top 10 & Burp Suite",
                            timeframe: "Months 3-4",
                            description: "Hands-on vulnerability testing: SQL injection, XSS, CSRF, SSRF, IDOR, authentication bypass using Burp Suite and PortSwigger labs.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Network Penetration & Active Directory Attacks",
                            timeframe: "Month 5",
                            description: "Metasploit, Nmap reconnaissance, privilege escalation (Linux/Windows), Active Directory attacks on TryHackMe / Hack The Box.",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: Security Certifications & ATS Resume",
                            timeframe: "Months 5-6",
                            description: "Prepare for CompTIA Security+, CEH or eJPT. Format 1-page ATS resume with HackTheBox ranking and vulnerability disclosure write-ups.",
                        },
                        {
                            stepNumber: 5,
                            title: "Phase 5: Cracking Security Interviews & Crucial Questions",
                            timeframe: "Month 6",
                            description: "Master High-Frequency Questions: 1) Difference between Symmetric vs Asymmetric encryption and TLS handshake. 2) Mitigating SQLi vs XSS in modern code. 3) Incident response lifecycle (PICERL). 4) Analyzing malicious pcap logs in Wireshark. 5) Buffer overflow mechanics.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Junior Penetration Tester / SOC Analyst Offer",
                            description: `Launch cybersecurity career meeting "${input.goal}".`,
                            probability: 82,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Steady SOC Analyst Progression (Realistic)",
                    description: "Structured path to break into security operations (SOC), log analysis (SIEM), and incident triage.",
                    type: "realistic",
                    riskLevel: "medium",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Security Fundamentals & Networking",
                            timeframe: "Months 1-3",
                            description: "Study CompTIA Security+ concepts, firewall configurations, and endpoint protection.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: SIEM Tools & Incident Response Labs",
                            timeframe: "Months 4-5",
                            description: "Practice log analysis with Splunk, ELK stack, and alert investigation on TryHackMe SOC Level 1.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Certification & Entry SOC Applications",
                            timeframe: "Months 6-7",
                            description: "Obtain Security+ or BTL1 and apply to security operations centers and IT defense teams.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "SOC Analyst Tier 1 Placement",
                            description: "Secure entry-level cybersecurity position with strong growth trajectory.",
                            probability: 75,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Risk-Managed IT Security Support Buffer (Conservative)",
                    description: "Conservative approach: Enter through IT administration / Network security technician to build defense credentials.",
                    type: "pessimistic",
                    riskLevel: "high",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: IT Network & Hardware Support",
                            timeframe: "Months 1-3",
                            description: "Support internal office network security, access control, and patching.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Internal Security Auditing & Transition",
                            timeframe: "Months 4-6",
                            description: "Assist with company vulnerability scans and compliance checklists to move into information security.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "IT Security Technician Foothold",
                            description: "Industry foothold established with steady internal transfer potential.",
                            probability: 60,
                            impact: "medium",
                        },
                    ],
                },
            ],
        };
    }

    // 5. BUSINESS, STARTUP, MARKETING & AGENCY
    if (isBusiness) {
        return {
            scenarios: [
                {
                    name: "Rapid MVP Launch & High-Growth Traction (Optimistic)",
                    description: `Accelerated business execution for "${input.decisionTitle}": Validate target problem, build low-code/code MVP, launch customer acquisition funnels, and hit "${input.goal}".`,
                    type: "optimistic",
                    riskLevel: "low",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Customer Discovery & Problem Validation",
                            timeframe: "Weeks 1-4",
                            description: `Conduct 25+ target customer interviews for "${input.decisionTitle}". Validate willingness to pay, map competitor gaps, and define primary value proposition.`,
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Rapid MVP Build & Beta Testing",
                            timeframe: "Weeks 5-8",
                            description: "Build a lean, functional Minimum Viable Product. Onboard 10 founding beta users, collect qualitative feedback, and iterate core feature loops.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Customer Acquisition Funnels & First Revenue",
                            timeframe: "Weeks 9-14",
                            description: "Launch targeted distribution: Cold outreach, content marketing, LinkedIn/Meta ads, or community partnerships. Convert beta users into paying customers.",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: Unit Economics Optimization & Scaling",
                            timeframe: "Weeks 15-20",
                            description: "Refine pricing, optimize LTV/CAC ratio, automate onboarding, and build scalable referral loops to drive recurring growth.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Profitable Traction / Sustainable Revenue Run-Rate",
                            description: `Achieve primary business milestones fulfilling "${input.goal}".`,
                            probability: 78,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Steady Methodical Market Validation (Realistic)",
                    description: "Pragmatic pathway: Validate demand with pre-sales, keep burn rate low, and iterate based on steady market response.",
                    type: "realistic",
                    riskLevel: "medium",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Lean Market Testing",
                            timeframe: "Months 1-2",
                            description: "Create landing page test with email waitlist or pre-orders to measure real customer demand before heavy investment.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Gradual Product Rollout",
                            timeframe: "Months 3-4",
                            description: "Deliver manual high-touch service or lightweight tool to initial paying customers and collect testimonials.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Repeatable Sales Process",
                            timeframe: "Months 5-6",
                            description: "Establish a predictable channel for generating leads and closing deals consistently.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Validated Business with Consistent Cashflow",
                            description: "Proven business model ready for gradual reinvestment and scaling.",
                            probability: 70,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Risk-Managed Pivot & Capital Preservation (Conservative)",
                    description: "Safety-first approach: Set strict stop-loss limits on capital, pivot quickly if initial demand is weak, and preserve financial runway.",
                    type: "pessimistic",
                    riskLevel: "high",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Low-Cost Experimentation",
                            timeframe: "Months 1-2",
                            description: "Test assumptions using organic social media and personal network with near-zero financial burn.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Strategy Pivot or Consulting Bridge",
                            timeframe: "Months 3-5",
                            description: "If product demand is slow, offer high-margin freelance consulting to fund ongoing iterations without taking debt.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Capital Preserved with Valuable Market Data",
                            description: "Zero catastrophic loss with refined understanding of customer requirements.",
                            probability: 65,
                            impact: "medium",
                        },
                    ],
                },
            ],
        };
    }

    // 6. HIGHER EDUCATION, STUDY ABROAD, EXAMS (GRE, IELTS, MASTERS, UPSC)
    if (isEducation) {
        return {
            scenarios: [
                {
                    name: "Top-Tier Admission & Exam Excellence (Optimistic)",
                    description: `Accelerated preparation and admission strategy for "${input.decisionTitle}": Target 95th+ percentile, draft standout SOPs, and secure acceptance for "${input.goal}".`,
                    type: "optimistic",
                    riskLevel: "low",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Diagnostic Assessment & Structured Study Plan",
                            timeframe: "Months 1-2",
                            description: "Take full diagnostic mock exams. Map weak areas across Quant/Verbal or core subjects, establish 3-hour daily study blocks with official guides.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Advanced Problem Solving & Mock Tests",
                            timeframe: "Months 3-4",
                            description: "Solve 1,000+ targeted practice questions under timed conditions. Review detailed explanations for every error and take 10+ full-length mocks.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Statement of Purpose (SOP) & Professor Outreach",
                            timeframe: "Months 4-5",
                            description: "Draft compelling 1-page SOP highlighting research projects and career alignment. Secure 3 strong Letters of Recommendation (LORs).",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: University Applications & Scholarship Submissions",
                            timeframe: "Months 5-6",
                            description: "Submit balanced applications across Dream, Target, and Safe institutions. Apply early for merit-based scholarships and assistantships.",
                        },
                        {
                            stepNumber: 5,
                            title: "Phase 5: Visa Processing & Departure Preparation",
                            timeframe: "Months 6+",
                            description: "Prepare financial documentation, schedule visa interview with mock drills, and finalize accommodation.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Top-Choice University Admission / High Exam Percentile",
                            description: `Secure dream admission or qualifying score meeting "${input.goal}".`,
                            probability: 88,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Steady Academic Admission Strategy (Realistic)",
                    description: "Balanced approach: Target realistic competitive scores, apply to strong accredited programs, and prepare backup options.",
                    type: "realistic",
                    riskLevel: "medium",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Core Subject Review",
                            timeframe: "Months 1-3",
                            description: "Consistent daily study habit covering all syllabus topics with weekly review tests.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Exam Attempt & Application Preparation",
                            timeframe: "Months 4-5",
                            description: "Take the official exam, draft standard application essays, and gather transcripts.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Application Submission & Interview",
                            timeframe: "Months 6-7",
                            description: "Submit applications to target universities and complete video/in-person admission interviews.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Target University Admission Secured",
                            description: "Admitted into strong accredited program fulfilling academic objectives.",
                            probability: 78,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Risk-Managed Second Round & Alternative Runway (Conservative)",
                    description: "Conservative assessment: Have spring intake or alternative program applications ready in case of score variance.",
                    type: "pessimistic",
                    riskLevel: "high",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Extended Preparation Window",
                            timeframe: "Months 1-4",
                            description: "Pace study sustainably to avoid burnout and retake test if first score is below target cutoff.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Broad Application Spread",
                            timeframe: "Months 5-7",
                            description: "Include institutions with rolling admissions or lower cutoffs to guarantee admission continuity.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Solid Admission Outcome Guaranteed",
                            description: "Academic progress preserved with structured contingency enrollment.",
                            probability: 65,
                            impact: "medium",
                        },
                    ],
                },
            ],
        };
    }

    // 7. WEB / SOFTWARE DEVELOPMENT (when user explicitly enters web/coding/fullstack)
    if (isWebDev) {
        return {
            scenarios: [
                {
                    name: "Accelerated Mastery & Placement (6-Month Sprint)",
                    description: `High-focus pathway for "${input.decisionTitle}": Master all essential frontend and backend languages, construct 3 production capstone apps, build an ATS-optimized tech resume, and drill high-frequency interview questions to land a developer job within 6 months.`,
                    type: "optimistic",
                    riskLevel: "low",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Core Languages & Modern Frontend Mastery",
                            timeframe: "Months 1-2",
                            description:
                                "Languages to Learn: HTML5 (Semantic elements, SEO, Accessibility/ARIA), CSS3 (Flexbox, CSS Grid, Tailwind CSS responsive design), JavaScript ES6+ (Closures, Lexical Scope, Event Loop, Promises, Async/Await, Array Methods), TypeScript (Types, Interfaces, Generics, Strict mode). Framework: React.js & Next.js (Functional components, hooks: useState, useEffect, useMemo, useCallback, App Router). Milestone: Build a responsive portfolio and interactive dynamic web app.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Backend Architecture, Databases & Security",
                            timeframe: "Months 3-4",
                            description:
                                "Backend Stack: Node.js (Asynchronous single-threaded runtime, Streams, EventEmitters), Express.js (RESTful API architecture, Middleware pipelines, Centralized error handling). Databases: MongoDB (Document schema design with Mongoose, One-to-Many modeling, Indexing with createIndex, Aggregation Pipelines). Security & Auth: JWT (JSON Web Tokens), bcrypt password hashing, CORS protection, Postman automated API testing.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: 3 Production Capstone Projects & Cloud Deployment",
                            timeframe: "Month 5",
                            description:
                                "Build 3 deployed full-stack capstone projects: 1) E-Commerce / SaaS platform with Stripe payments and MongoDB sync, 2) Real-time collaborative workspace with WebSockets, 3) LifeFlow AI decision simulation engine with authentication. Deployment: Containerize backend with Docker, deploy frontend to Vercel, deploy backend & MongoDB Atlas with CI/CD GitHub Actions.",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: High-Impact ATS Tech Resume & GitHub Portfolio",
                            timeframe: "Month 5-6",
                            description:
                                "Resume Strategy: Clean 1-page ATS template (single column). Projects Section: Use STAR bullet points with metrics ('Engineered Node.js/MongoDB REST microservice with <60ms latency handling 1,000+ daily requests'). Tech Stack: Explicitly list Languages (JavaScript, TypeScript, HTML, CSS), Frameworks (React, Next.js, Node.js, Express), Databases (MongoDB, PostgreSQL), Tools (Git, Docker, Postman). Polish GitHub with a green commit streak, live demo links, and architectural README diagrams.",
                        },
                        {
                            stepNumber: 5,
                            title: "Phase 5: Cracking Technical Interviews & Crucial Questions",
                            timeframe: "Month 6",
                            description:
                                "Master High-Frequency Questions: 1) JS Event Loop, Call Stack, Microtasks vs Macrotasks. 2) Closures & Lexical Scope. 3) React Reconciliation, Virtual DOM & Hook lifecycle. 4) MongoDB Indexing & Document Schema Design. 5) JWT Authentication security (XSS vs CSRF, HTTP-only cookies). 6) REST vs GraphQL & ACID properties. Practice 40 LeetCode Easy/Medium problems and prepare STAR stories for behavioral rounds.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Full-Stack Developer Job Offer / Paid Internship Secured",
                            description: `Receive job offer or paid internship fulfilling "${input.goal}" within 6 months.`,
                            probability: 88,
                            impact: "high",
                        },
                        {
                            title: "Portfolio of 3 Production-Deployed Web Apps with Live Users",
                            description: "Demonstrable live proof of work showing end-to-end full-stack capabilities to recruiters and engineering managers.",
                            probability: 95,
                            impact: "high",
                        },
                        {
                            title: "Technical Fluency in Live Coding & System Design",
                            description: "Confidently pass technical screenings, take-home coding challenges, and live whiteboard rounds.",
                            probability: 90,
                            impact: "medium",
                        },
                    ],
                },
                {
                    name: "Steady Skill Growth & Transition (6-8 Months)",
                    description: `Balanced approach for "${input.decisionTitle}": Deep dive into JavaScript, TypeScript, React, Node.js, and MongoDB fundamentals while balancing current schedule, producing 2 comprehensive full-stack applications.`,
                    type: "realistic",
                    riskLevel: "medium",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Foundations in JavaScript, TypeScript & React",
                            timeframe: "Months 1-3",
                            description: "Languages to Learn: HTML5, CSS3/Tailwind, Modern JavaScript (ES6+), TypeScript. Build foundational UI components with React.js, learn state management, and master Git version control workflows.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Node.js, Express & MongoDB Database",
                            timeframe: "Months 3-5",
                            description: "Learn Node.js runtime, Express routing, REST APIs, and MongoDB document data modeling with Mongoose. Implement secure user authentication with JWT and connect frontend with backend.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: 2 Production Projects & Cloud Hosting",
                            timeframe: "Months 5-6",
                            description: "Build 2 complete applications with database sync and deploy to Vercel and Render. Write comprehensive READMEs with installation instructions and architecture diagrams.",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: ATS Resume Polish & Interview Preparation",
                            timeframe: "Months 6-7",
                            description: "Craft a targeted developer resume highlighting projects and technologies. Master top interview questions: Event Loop, React hooks, SQL vs NoSQL, and REST principles.",
                        },
                        {
                            stepNumber: 5,
                            title: "Phase 5: Job Applications, Networking & Interviews",
                            timeframe: "Months 7-8",
                            description: "Apply to 10-15 targeted developer roles per week, engage with tech recruiters on LinkedIn, conduct mock technical interviews, and negotiate entry offers.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Full-Stack Developer Role Transition",
                            description: `Successfully transition into software engineering achieving "${input.goal}".`,
                            probability: 74,
                            impact: "high",
                        },
                    ],
                },
                {
                    name: "Conservative Assessment & Skill-Gap Buffer (8+ Months)",
                    description: "Safety-first pathway: Accounts for potential learning curves or market slowdowns with dedicated buffer time, extra mentorship, and paid internship target.",
                    type: "pessimistic",
                    riskLevel: "high",
                    steps: [
                        {
                            stepNumber: 1,
                            title: "Phase 1: Self-Paced Foundations with Extra Practice",
                            timeframe: "Months 1-3",
                            description: "Focus on HTML, CSS, and JavaScript basics. Solve 30+ beginner algorithm challenges on LeetCode to solidify programming logic before moving to React.",
                        },
                        {
                            stepNumber: 2,
                            title: "Phase 2: Simplified Backend & MongoDB Integration",
                            timeframe: "Months 4-6",
                            description: "Build simple Express CRUD APIs and connect with MongoDB. Focus on getting comfortable with error handling and database operations.",
                        },
                        {
                            stepNumber: 3,
                            title: "Phase 3: Single High-Quality Capstone Project",
                            timeframe: "Months 6-7",
                            description: "Rather than rushing 3 projects, focus on one polished full-stack application with thorough testing and clean UI/UX.",
                        },
                        {
                            stepNumber: 4,
                            title: "Phase 4: Extended Application Campaign & Paid Internship",
                            timeframe: "Months 8+",
                            description: "Expand search to paid internships on Internshala or junior frontend roles as stepping stones into full-stack engineering.",
                        },
                    ],
                    outcomes: [
                        {
                            title: "Entry-Level Developer or Paid Internship Offer",
                            description: "Secure an initial foothold in the tech industry via junior position or internship.",
                            probability: 54,
                            impact: "medium",
                        },
                    ],
                },
            ],
        };
    }

    // 8. GENERAL / CUSTOM USER GOAL (Completely tailored to whatever the user entered)
    const goalTitle = input.decisionTitle.trim();
    const primaryGoal = input.goal.trim();

    return {
        scenarios: [
            {
                name: `Accelerated Mastery & Achievement: ${goalTitle}`,
                description: `High-conviction pathway for "${goalTitle}": Rapid skill acquisition, concrete milestone deliverables, proactive positioning, and strategic execution to achieve "${primaryGoal}".`,
                type: "optimistic",
                riskLevel: "low",
                steps: [
                    {
                        stepNumber: 1,
                        title: `Phase 1: Core Fundamentals & Prerequisite Tools for ${goalTitle}`,
                        timeframe: "Months 1-2",
                        description: `Acquire core competencies, master foundational tools and methodologies, and establish daily high-leverage practice routines specifically for "${primaryGoal}".`,
                    },
                    {
                        stepNumber: 2,
                        title: "Phase 2: Applied Systems & Concrete Proof of Work",
                        timeframe: "Months 3-4",
                        description: `Build verifiable proof-of-work, solve real-world problems, and assemble 2-3 tangible case studies or deliverables demonstrating expertise in "${goalTitle}".`,
                    },
                    {
                        stepNumber: 3,
                        title: "Phase 3: ATS Resume / Portfolio & Professional Positioning",
                        timeframe: "Month 5",
                        description: `Package achievements into a 1-page ATS-optimized profile or portfolio highlighting quantified results, verifiable credentials, and live work samples for "${goalTitle}".`,
                    },
                    {
                        stepNumber: 4,
                        title: "Phase 4: High-Impact Interviews, Evaluations & Execution",
                        timeframe: "Month 6",
                        description: `Engage with key decision makers, master technical/domain screening questions, present your deliverables, and negotiate favorable outcomes for "${primaryGoal}".`,
                    },
                ],
                outcomes: [
                    {
                        title: `Target Goal Realized Ahead of Schedule: ${primaryGoal}`,
                        description: `Successfully realize "${primaryGoal}" with validated credentials and maximum leverage.`,
                        probability: 86,
                        impact: "high",
                    },
                    {
                        title: "Recognized Domain Authority & Network Established",
                        description: "Establish strong professional reputation and sustainable forward momentum.",
                        probability: 90,
                        impact: "high",
                    },
                ],
            },
            {
                name: `Steady Pragmatic Execution: ${goalTitle}`,
                description: `Balanced pathway for "${goalTitle}": Methodical step-by-step progress, managing schedule constraints while steadily building toward "${primaryGoal}".`,
                type: "realistic",
                riskLevel: "medium",
                steps: [
                    {
                        stepNumber: 1,
                        title: "Phase 1: Incremental Skill Building & Habit Formation",
                        timeframe: "Months 1-3",
                        description: `Establish consistent study or practice habits, building core competence in "${goalTitle}" alongside existing commitments.`,
                    },
                    {
                        stepNumber: 2,
                        title: "Phase 2: Practical Milestone Execution",
                        timeframe: "Months 4-5",
                        description: "Apply learning to practical projects, gathering feedback from mentors or peers and refining execution quality.",
                    },
                    {
                        stepNumber: 3,
                        title: "Phase 3: Outreach, Positioning & Applications",
                        timeframe: "Months 6-7",
                        description: `Submit targeted applications or proposals, network with industry peers, and complete evaluations to fulfill "${primaryGoal}".`,
                    },
                ],
                outcomes: [
                    {
                        title: `Goal Achieved within Target Horizon: ${primaryGoal}`,
                        description: `Complete the transition successfully with realistic effort and balanced pacing.`,
                        probability: 74,
                        impact: "high",
                    },
                ],
            },
            {
                name: `Risk-Managed Conservative Buffer: ${goalTitle}`,
                description: `Safety-first pathway for "${goalTitle}": Hedging against potential bottlenecks, extended timelines, or resource constraints with dedicated contingency planning.`,
                type: "pessimistic",
                riskLevel: "high",
                steps: [
                    {
                        stepNumber: 1,
                        title: "Phase 1: Extended Groundwork & Risk Mitigation",
                        timeframe: "Months 1-3",
                        description: "Build a financial or scheduling buffer, test assumptions with low-risk experiments, and pace milestones sustainably.",
                    },
                    {
                        stepNumber: 2,
                        title: "Phase 2: Flexible Milestone Execution & Bridge Opportunities",
                        timeframe: "Months 4-6",
                        description: `Pursue bridge opportunities, internships, or contract engagements to gain verified experience while advancing toward "${primaryGoal}".`,
                    },
                ],
                outcomes: [
                    {
                        title: `Foundational Success Preserved with Adjusted Timeline`,
                        description: `Preserve progress toward "${primaryGoal}" without exposing yourself to burnout or unsustainable risk.`,
                        probability: 55,
                        impact: "medium",
                    },
                ],
            },
        ],
    };
};

/**
 * Generates structured decision scenarios using an AI provider.
 *
 * @param input - Decision information supplied by the application.
 * @returns Validated optimistic, realistic, or pessimistic scenarios.
 */
export const generateScenarios = async (
    input: GenerateScenariosInput
): Promise<GeneratedScenarios> => {
    const decisionTitle = input.decisionTitle?.trim();
    const category = input.category?.trim();
    const goal = input.goal?.trim();

    if (!decisionTitle || !category || !goal) {
        throw new AppError(
            "Decision title, category, and goal are required.",
            400
        );
    }

    if (
        (input.timeAvailable !== undefined &&
            (!Number.isFinite(input.timeAvailable) ||
                input.timeAvailable < 0)) ||
        (input.budget !== undefined &&
            (!Number.isFinite(input.budget) || input.budget < 0))
    ) {
        throw new AppError(
            "Time available and budget must be valid non-negative numbers.",
            400
        );
    }

    const { apiUrl, apiKey, model } = getAIConfig();

    // If no API key or URL configured, use the high-fidelity domain fallback immediately
    if (!apiUrl || !apiKey) {
        return generateStructuredScenarioFallback(input);
    }

    const decisionContext = {
        decisionTitle,
        category,
        goal,
        currentSituation: input.currentSituation?.trim(),
        timeAvailable: input.timeAvailable,
        budget: input.budget,
        additionalContext: input.additionalContext?.trim(),
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                temperature: 0.3,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an expert career strategist and intelligent life simulation engine. " +
                            "CRITICAL REQUIREMENT: YOU MUST DYNAMICALLY GENERATE SCENARIOS TAILORED EXACTLY TO WHAT THE USER TYPES IN DECISION TITLE AND GOAL! " +
                            "DO NOT output web development or React/Node/MongoDB advice unless the user explicitly asks for web development or full-stack software engineering. " +
                            "Whatever the user typed (e.g. Artificial Intelligence, Data Science, Cloud DevOps, Cybersecurity, Mobile Apps, Higher Education/GRE/UPSC, Startups, Personal Finance, Civil/Mechanical transitions, or any custom life goal): " +
                            "1. Detail the EXACT domain-specific tools, programming languages, libraries, frameworks, or methodologies required specifically for THAT user goal. " +
                            "2. Include a specific step for High-Impact ATS Resume / Portfolio / Capstone Deliverables tailored directly to that domain. " +
                            "3. Include a specific step for Cracking Domain Interviews, Evaluations, or Pitches with high-frequency critical questions for that field. " +
                            "4. Return 3 distinct scenarios: 'optimistic' (low risk, fast-track mastery), 'realistic' (medium risk, steady pragmatic path), and 'pessimistic' (high risk, risk-managed / conservative contingency). " +
                            "Each step must contain stepNumber (integer starting from 1), title, timeframe, and detailed description. " +
                            "Each outcome must contain title, description, probability (0-100), and impact (low, medium, high).",
                    },
                    {
                        role: "user",
                        content: JSON.stringify(decisionContext),
                    },
                ],
            }),
            signal: AbortSignal.timeout(20_000),
        });

        if (!response.ok) {
            console.warn(`AI provider returned HTTP ${response.status}. Using domain fallback.`);
            return generateStructuredScenarioFallback(input);
        }

        const completion = (await response.json()) as ChatCompletionResponse;
        const content = completion.choices?.[0]?.message?.content;

        if (!content) {
            return generateStructuredScenarioFallback(input);
        }

        let cleanContent = content.trim();
        if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/, "")
                .trim();
        }

        const parsedContent = JSON.parse(cleanContent);
        const validation = generatedScenarioSchema.safeParse(parsedContent);

        if (!validation.success) {
            console.warn("AI output did not match schema. Using domain fallback.");
            return generateStructuredScenarioFallback(input);
        }

        return validation.data;
    } catch (err: unknown) {
        console.warn("AI service call failed or timed out. Falling back to domain generator:", err);
        return generateStructuredScenarioFallback(input);
    }
};
