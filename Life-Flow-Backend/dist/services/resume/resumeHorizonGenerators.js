"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInterviewMastery = exports.generateRemainingSkillsAndProjects = exports.generateFoundationsGuide = void 0;
// ==================== 1. FOUNDATIONS GUIDE GENERATOR (+3 MONTHS) ====================
const generateFoundationsGuide = (targetCareer, currentResume, milestones = []) => {
    const lower = targetCareer.toLowerCase();
    // 1. AWS Cloud Solutions Architect / DevOps / SRE
    if (lower.includes("cloud") || lower.includes("devops") || lower.includes("sre") || lower.includes("aws")) {
        return {
            coreConcepts: [
                "Linux Kernel Internals, File Hierarchy Standard, Permissions & Systemd Daemons",
                "TCP/IP Suite, DNS Resolution Workflow, CIDR Subnetting & OSI 7-Layer Model",
                "AWS Well-Architected Framework: Security, Reliability & Operational Excellence",
                "AWS Core Compute & Networking (VPC Subnets, Route Tables, Internet Gateways, NAT, Security Groups vs NACLs)",
                "IAM Architecture: Role Assumption, Least-Privilege Policies, Multi-Factor Auth & Boundary Policies",
                "Object vs Block Storage Paradigms: S3 Lifecycle Rules, Bucket Policies, EBS Volume Types & Snapshots",
                "Bash Scripting & POSIX Automation: Process Management, Pipes, AWK/SED & Cron Schedulers",
            ],
            toolsAndLanguages: [
                "Linux (Ubuntu 22.04 LTS / Amazon Linux 2023)",
                "Bash & POSIX Shell",
                "AWS CLI v2 & CloudShell",
                "Git & GitHub Version Control",
                "SSH (Key Exchange, Agent Forwarding, Configs)",
                "Docker Essentials & Image Layering",
                "VPC & Networking Calculators",
            ],
            weeklyFocusPlan: [
                {
                    week: "Weeks 1–2",
                    focus: "Linux System Administration & Shell Automation",
                    outcome: "Provision a hardened Linux server and author an automated backup & system health alert script using Bash and cron.",
                },
                {
                    week: "Weeks 3–4",
                    focus: "Networking Fundamentals, CIDR & Routing Tables",
                    outcome: "Design and verify a custom non-overlapping IP address schema for a multi-tier enterprise network topology.",
                },
                {
                    week: "Weeks 5–6",
                    focus: "AWS Core VPC Architecture & Bastion Host Isolation",
                    outcome: "Deploy a multi-tier AWS VPC with private isolated database subnets, public load balancers, and zero direct SSH exposure.",
                },
                {
                    week: "Weeks 7–8",
                    focus: "IAM Least-Privilege Security & S3 Storage Hardening",
                    outcome: "Enforce strict IAM permission boundaries, configure S3 bucket policies with TLS enforcement, and enable AWS KMS encryption.",
                },
                {
                    week: "Weeks 9–10",
                    focus: "Container Foundations & Dockerfile Multi-Stage Builds",
                    outcome: "Package web workloads into minimal container images (<50MB) running as non-root users with vulnerability scans.",
                },
                {
                    week: "Weeks 11–12",
                    focus: "High-Availability Compute Architecture & Foundation Mini-Capstone",
                    outcome: "Deploy an auto-scaling EC2 web fleet across multiple Availability Zones behind an Application Load Balancer with health checks.",
                },
            ],
            milestones: [
                {
                    title: "Linux Server Administration & Bash Health Daemon",
                    description: "Configure secure Linux environments with strict user permissions, custom systemd daemons, and automated bash log monitoring.",
                    whyImportant: "Over 90% of cloud workloads run on Linux; mastering CLI administration and automation is non-negotiable for cloud engineers.",
                    learningLinks: [
                        { title: "Linux Foundation: Introduction to Linux (LFS101x)", url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux", type: "course" },
                        { title: "Red Hat Enterprise Linux System Administration Guide", url: "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/", type: "documentation" },
                    ],
                },
                {
                    title: "AWS Multi-Tier VPC & Secure Compute Architecture",
                    description: "Architect a resilient virtual private cloud network with public/private subnets, internet gateways, NAT gateways, and least-privilege security groups.",
                    whyImportant: "Isolated network boundaries are the foundational bedrock of all enterprise cloud migrations and certifications.",
                    learningLinks: [
                        { title: "AWS VPC Official Architecture Whitepaper", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html", type: "documentation" },
                        { title: "AWS Skill Builder: Cloud Practitioner Essentials", url: "https://explore.skillbuilder.aws/", type: "course" },
                    ],
                },
            ],
        };
    }
    // 2. Cybersecurity SOC Analyst / Security Engineer
    if (lower.includes("cyber") || lower.includes("security") || lower.includes("soc")) {
        return {
            coreConcepts: [
                "Network Traffic Analysis & Packet Inspection (TCP 3-Way Handshake, ARP Spoofing, DNS Tunnelling)",
                "Host-Based Forensics & OS Security Auditing (Windows Event IDs: 4624, 4625, 4688; Linux Syslog & /var/log/audit)",
                "MITRE ATT&CK Framework: Tactics, Techniques & Common Adversary Procedures (TTPs)",
                "OWASP Top 10 Web Application Vulnerabilities (SQLi, XSS, CSRF, SSRF, IDOR)",
                "Incident Response Lifecycle (NIST SP 800-61 Rev 2: Preparation, Detection, Containment, Eradication, Recovery)",
                "Public Key Infrastructure (PKI), TLS 1.3 Handshake & Symmetric vs Asymmetric Ciphers",
                "Endpoint Detection & Response (EDR) Architecture and Threat Hunting Methodologies",
            ],
            toolsAndLanguages: [
                "Wireshark (Packet Capture & Protocol Dissection)",
                "Nmap (Network Port & Vulnerability Scanning)",
                "Burp Suite Community (Web Proxy & Request Manipulation)",
                "Linux (Kali Linux / Ubuntu Security Tools)",
                "Splunk / ELK Stack (Log Ingestion & Correlation)",
                "PowerShell & Bash Scripting for Incident Triage",
                "Snort / Suricata (Intrusion Detection Rules)",
            ],
            weeklyFocusPlan: [
                {
                    week: "Weeks 1–2",
                    focus: "TCP/IP Packet Dissection & Wireshark Deep Dive",
                    outcome: "Analyze PCAP packet captures to identify malicious cleartext credentials, port scans, and SYN flood attacks.",
                },
                {
                    week: "Weeks 3–4",
                    focus: "Windows & Linux Host Event Log Forensics",
                    outcome: "Audit Sysmon event logs and reconstruct the timeline of an unauthorized process creation and persistence hook.",
                },
                {
                    week: "Weeks 5–6",
                    focus: "OWASP Top 10 Hands-on Exploitation & Mitigation",
                    outcome: "Identify and patch SQL injection and Cross-Site Scripting (XSS) vulnerabilities in controlled target web applications.",
                },
                {
                    week: "Weeks 7–8",
                    focus: "Network Reconnaissance, Port Auditing & Vulnerability Mapping",
                    outcome: "Execute targeted Nmap scripts and compile an executive-ready vulnerability discovery and risk-scoring report.",
                },
                {
                    week: "Weeks 9–10",
                    focus: "SIEM Log Ingestion & Threat Hunting Correlation (Splunk)",
                    outcome: "Write custom SPL search queries and build a dashboard alerting on brute-force logins and lateral movement attempts.",
                },
                {
                    week: "Weeks 11–12",
                    focus: "SOC Triage Playbook & Foundation Capstone",
                    outcome: "Author a comprehensive incident containment playbook and conduct a tabletop remediation simulation for a ransomware scenario.",
                },
            ],
            milestones: [
                {
                    title: "Network Packet Analysis & Intrusion Detection with Wireshark",
                    description: "Inspect PCAP captures of malicious beaconing, identify anomalous TCP retransmissions, and extract exfiltrated artifacts.",
                    whyImportant: "Packet analysis is the primary microscope of a security analyst; anomalies cannot hide at the wire level.",
                    learningLinks: [
                        { title: "Wireshark User Guide & Protocol Documentation", url: "https://www.wireshark.org/docs/", type: "documentation" },
                        { title: "SANS Cyber Aces: Security Foundations", url: "https://www.cyberaces.org/", type: "course" },
                    ],
                },
                {
                    title: "Enterprise SIEM Querying & SOC Alert Triage with Splunk",
                    description: "Ingest authentication and firewall logs, author SPL correlation rules, and triage alert queues against false positives.",
                    whyImportant: "Modern Security Operations Centers live in SIEM dashboards; rapid correlation differentiates juniors from seniors.",
                    learningLinks: [
                        { title: "Splunk Fundamentals 1 (Official Free Training)", url: "https://www.splunk.com/en_us/training/free-courses/splunk-fundamentals-1.html", type: "course" },
                        { title: "MITRE ATT&CK Matrix for Enterprise", url: "https://attack.mitre.org/", type: "documentation" },
                    ],
                },
            ],
        };
    }
    // 3. Data Science / Machine Learning / AI Engineer
    if (lower.includes("data") || lower.includes("ai") || lower.includes("machine learning") || lower.includes("ml")) {
        return {
            coreConcepts: [
                "Vectorized Computation & Array Memory Strides in NumPy (Broadcasting, Slicing, Matrix Dot Products)",
                "Relational & Analytical SQL (Window Functions: ROW_NUMBER, RANK, LAG/LEAD; Common Table Expressions CTEs)",
                "Exploratory Data Analysis (EDA): Distribution Outliers, Missing Value Imputation, Multicollinearity & VIF",
                "Supervised Learning Theory: Loss Functions, Ordinary Least Squares, Cost Gradients & Regularization (L1/L2)",
                "Classification Metrics: Precision, Recall, F1-Score, ROC-AUC Curve & Precision-Recall Trade-offs",
                "Data Preprocessing Pipelines: One-Hot Encoding, Standard Scaling, Cross-Validation Strategies & Data Leakage Prevention",
                "Introduction to Neural Representations: Word Embeddings, Vector Cosine Distance & Semantic Search",
            ],
            toolsAndLanguages: [
                "Python 3.11+",
                "NumPy & Pandas",
                "PostgreSQL / DuckDB",
                "Scikit-Learn",
                "Matplotlib & Seaborn",
                "JupyterLab / VS Code Notebooks",
                "Git & DVC (Data Version Control)",
            ],
            weeklyFocusPlan: [
                {
                    week: "Weeks 1–2",
                    focus: "Python Vectorization & Numerical Linear Algebra",
                    outcome: "Implement core regression equations from scratch in pure NumPy without iterative Python loops.",
                },
                {
                    week: "Weeks 3–4",
                    focus: "Analytical SQL & Data Wrangling with Pandas",
                    outcome: "Execute multi-table aggregation pipelines analyzing 100,000+ transaction records using CTEs and window queries.",
                },
                {
                    week: "Weeks 5–6",
                    focus: "Exploratory Data Analysis & Statistical Hypothesis Testing",
                    outcome: "Produce an automated EDA report identifying dataset skewness, correlation matrices, and outlier anomalies.",
                },
                {
                    week: "Weeks 7–8",
                    focus: "Supervised Learning Models & Scikit-Learn Pipelines",
                    outcome: "Build clean machine learning pipelines integrating ColumnTransformer, StandardScaler, and cross-validated estimators.",
                },
                {
                    week: "Weeks 9–10",
                    focus: "Model Diagnostics, Error Analysis & Hyperparameter Tuning",
                    outcome: "Diagnose underfitting vs overfitting using learning curves, tuning models via Optuna or GridSearchCV.",
                },
                {
                    week: "Weeks 11–12",
                    focus: "End-to-End Predictive Model Delivery & Mini-Capstone",
                    outcome: "Deploy a serialized machine learning model as a REST API endpoint via FastAPI with input schema validation.",
                },
            ],
            milestones: [
                {
                    title: "Exploratory Data Science & Feature Engineering Pipeline",
                    description: "Perform end-to-end data cleansing, statistical profiling, and automated feature transformation on complex real-world datasets.",
                    whyImportant: "Garbage in, garbage out: 80% of data science success depends on robust feature engineering and clean data pipelines.",
                    learningLinks: [
                        { title: "Python Data Science Handbook by Jake VanderPlas", url: "https://jakevdp.github.io/PythonDataScienceHandbook/", type: "book" },
                        { title: "Kaggle Micro-Courses: Pandas & Feature Engineering", url: "https://www.kaggle.com/learn", type: "tutorial" },
                    ],
                },
                {
                    title: "Scikit-Learn Machine Learning Pipeline with FastAPI Serving",
                    description: "Train a cross-validated predictive classification model, package it with pickle/joblib, and serve predictions via a lightweight REST API.",
                    whyImportant: "Models provide zero business value in notebooks; production deployment skills are what hiring managers look for.",
                    learningLinks: [
                        { title: "Scikit-Learn User Guide & API Reference", url: "https://scikit-learn.org/stable/user_guide.html", type: "documentation" },
                        { title: "FastAPI Official Tutorial", url: "https://fastapi.tiangolo.com/tutorial/", type: "documentation" },
                    ],
                },
            ],
        };
    }
    // 4. Full-Stack Web Developer / Software Engineer (Default)
    return {
        coreConcepts: [
            "JavaScript Engine Internals (V8 Call Stack, Memory Heap, Event Loop, Microtasks vs Macrotasks)",
            "Asynchronous Concurrency (Promises, async/await, Promise.allSettled, Error Boundaries)",
            "DOM Rendering Tree Lifecycle (Critical Rendering Path, Layout Reflow, Paint & Compositing)",
            "HTTP/1.1 & HTTP/2 Protocols (REST Constraints, Headers, Cookies, CORS, HTTP Status Codes)",
            "Strict TypeScript Type System (Generics, Discriminated Unions, Type Guards, Utility Types)",
            "Relational & Document Database Primitives (ACID Properties, Normalization, B-Tree Indexes, Aggregation Pipelines)",
            "Component Architecture & State Encapsulation (Virtual DOM, Controlled vs Uncontrolled Forms, Custom Hooks)",
        ],
        toolsAndLanguages: [
            "TypeScript (Strict Mode)",
            "JavaScript (ES2023+)",
            "Node.js & Express.js",
            "React.js & Next.js 14",
            "PostgreSQL & MongoDB",
            "Git & GitHub Workflow",
            "Tailwind CSS & shadcn/ui",
        ],
        weeklyFocusPlan: [
            {
                week: "Weeks 1–2",
                focus: "Modern JavaScript Deep Dive & Asynchronous Mastery",
                outcome: "Master scope, closures, prototypal inheritance, and pass 25 advanced asynchronous programming challenges.",
            },
            {
                week: "Weeks 3–4",
                focus: "Strict TypeScript & Type-Safe Architecture",
                outcome: "Convert legacy untyped code into fully typed modules using generics, discriminated unions, and strict compiler settings.",
            },
            {
                week: "Weeks 5–6",
                focus: "Backend RESTful API Design & Express Middleware",
                outcome: "Build a production-grade REST API with centralized error handling, Zod payload validation, and request logging.",
            },
            {
                week: "Weeks 7–8",
                focus: "Database Schema Modeling, Indexing & Query Optimization",
                outcome: "Design normalized SQL/NoSQL schemas with compound indexes, foreign key constraints, and seed migration scripts.",
            },
            {
                week: "Weeks 9–10",
                focus: "React Component Lifecycle, State & Custom Hooks",
                outcome: "Architect reusable accessible UI component systems consuming backend REST APIs with optimistic state updates.",
            },
            {
                week: "Weeks 11–12",
                focus: "JWT Authentication, Cookie Security & Foundation Mini-Capstone",
                outcome: "Deploy a full-stack auth-gated starter application to Vercel/Render with automated CI/CD and secure HTTP-only cookies.",
            },
        ],
        milestones: [
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
                title: "Normalized Database Modeling & Migrations (PostgreSQL / MongoDB)",
                description: "Design and implement relational/document schemas with indexes, transactional operations, and automated seed scripts.",
                whyImportant: "Database schema design choices dictate application performance and scalability as data volume grows.",
                learningLinks: [
                    { title: "Use The Index, Luke! A Guide to Database Performance", url: "https://use-the-index-luke.com/", type: "tutorial" },
                    { title: "Prisma / Mongoose Data Modeling Guides", url: "https://www.prisma.io/docs/concepts/components/prisma-schema/data-model", type: "documentation" },
                ],
            },
        ],
    };
};
exports.generateFoundationsGuide = generateFoundationsGuide;
// ==================== 2. REMAINING SKILLS & PROJECTS GENERATOR (+6 MONTHS) ====================
const generateRemainingSkillsAndProjects = (targetCareer, currentResume, milestones = []) => {
    const lower = targetCareer.toLowerCase();
    // 1. AWS Cloud Solutions Architect / DevOps / SRE
    if (lower.includes("cloud") || lower.includes("devops") || lower.includes("sre") || lower.includes("aws")) {
        return {
            remainingSkills: [
                "Infrastructure as Code (Terraform Modular HCL, Remote State S3/DynamoDB Locking)",
                "Kubernetes Cluster Architecture (Pods, Deployments, Services, Ingress Controllers, Helm Charts)",
                "Continuous Integration & Continuous Deployment (GitHub Actions, ArgoCD GitOps)",
                "Cloud Observability & Telemetry (Prometheus Metric Scraping, Grafana Dashboards, Alertmanager)",
                "Cloud Security Hardening (AWS KMS Key Rotation, Secrets Manager, CIS AWS Benchmark Compliance)",
                "High-Availability Database Architectures (AWS RDS Multi-AZ, Read Replicas, DynamoDB Global Tables)",
                "Cost Optimization & Architectural Disaster Recovery (RTO/RPO calculation, Spot Instances, Compute Savings Plans)",
            ],
            solidProjects: [
                {
                    title: "Multi-Region Cloud GitOps Infrastructure with Terraform, EKS & ArgoCD",
                    tagline: "Fully automated, enterprise-grade Infrastructure as Code provisioning a production Kubernetes cluster with GitOps deployments and zero manual steps.",
                    difficulty: "Production-Ready",
                    technologies: ["Terraform", "AWS EKS", "ArgoCD", "Helm", "GitHub Actions", "Docker", "AWS Route 53"],
                    fullStackDocumentation: {
                        architectureOverview: "Modular Terraform codebase provisions a complete AWS VPC, IAM OIDC providers, managed EKS node groups, and an Application Load Balancer. Applications are deployed via ArgoCD following a declarative GitOps pattern, ensuring that Git remains the single source of truth for the entire infrastructure and workload lifecycle.",
                        frontendSpec: "ArgoCD Web Dashboard & Grafana UI exposed securely over TLS via AWS Route 53 and ACM Certificate Manager, protected by AWS Cognito / GitHub OAuth SSO.",
                        backendSpec: "Stateless microservices packaged as OCI-compliant container images, managed via Kubernetes Deployments with Horizontal Pod Autoscaling (HPA) based on CPU and memory thresholds. Liveness and readiness probes guarantee zero-downtime rolling updates.",
                        databaseSchema: "Terraform provisions an Amazon RDS PostgreSQL Multi-AZ cluster located inside private isolated database subnets, with automated snapshot backups, encryption-at-rest via AWS KMS, and IAM database authentication.",
                        apiEndpoints: [
                            { method: "GET", path: "/healthz", description: "Kubernetes liveness probe validating daemon and memory health" },
                            { method: "GET", path: "/readyz", description: "Kubernetes readiness probe verifying database connectivity" },
                            { method: "POST", path: "/api/v1/deploy/sync", description: "GitOps webhook triggering immediate ArgoCD synchronization" },
                            { method: "GET", path: "/metrics", description: "Prometheus telemetry endpoint exporting system performance counters" },
                        ],
                        deploymentAndDevOps: "Multi-stage Docker builds push signed images to Amazon ECR. GitHub Actions runs terraform validate, tflint, and tfsec security scanners before applying plans to staging and production environments.",
                        stepByStepGuide: [
                            "Step 1: Architect modular Terraform directory structure (vpc, iam, eks, rds modules) with remote S3 backend and DynamoDB table locks.",
                            "Step 2: Deploy multi-AZ VPC with public, private, and isolated database subnets across two Availability Zones.",
                            "Step 3: Provision AWS EKS cluster with managed worker node groups and configure IAM Roles for Service Accounts (IRSA).",
                            "Step 4: Install Helm, AWS Load Balancer Controller, and deploy ArgoCD within the cluster.",
                            "Step 5: Configure GitOps repository with Kustomize overlays for development, staging, and production environments.",
                            "Step 6: Execute automated rolling deployment and simulate node failure to prove automated self-healing and zero downtime.",
                        ],
                        keyResumeBullets: [
                            "Engineered end-to-end Infrastructure as Code with modular Terraform, provisioning AWS VPC, EKS, and Multi-AZ RDS with 100% declarative automation.",
                            "Implemented a declarative GitOps continuous delivery pipeline with ArgoCD and GitHub Actions, cutting deployment cycle times by 65%.",
                            "Achieved zero-downtime rolling updates and automated pod horizontal scaling across multi-AZ worker nodes, sustaining 10,000+ simulated requests per minute.",
                        ],
                    },
                },
                {
                    title: "Enterprise Observability & Automated Incident Alerting Stack",
                    tagline: "Production telemetry monitoring platform providing distributed tracing, real-time metrics, log aggregation, and automated Slack/PagerDuty incident alerting.",
                    difficulty: "Production-Ready",
                    technologies: ["Prometheus", "Grafana", "Loki", "Alertmanager", "OpenTelemetry", "Docker Compose", "AWS CloudWatch"],
                    fullStackDocumentation: {
                        architectureOverview: "Centralized observability pipeline utilizing OpenTelemetry collectors to ingest traces and metrics from distributed services. Prometheus scrapes metrics at 15-second intervals, Grafana provides unified visual monitoring dashboards, and Alertmanager routes prioritized incident notifications with runbook links.",
                        frontendSpec: "Pre-configured responsive Grafana executive dashboards tracking the 4 Golden Signals: Latency (p50, p95, p99), Traffic (RPS), Error Rates (5xx ratios), and Saturation (CPU/Memory headroom).",
                        backendSpec: "Alertmanager daemon running automated deduplication, grouping, and silencing rules, dispatching critical alerts to Slack channels and incident responder webhooks.",
                        databaseSchema: "Time-series database storage with Prometheus TSDB retention policies, WAL (Write-Ahead Logging) on high-speed EBS volumes, and cold storage archival to Amazon S3.",
                        apiEndpoints: [
                            { method: "GET", path: "/api/v1/alerts", description: "Returns currently firing and pending alerts with severity levels" },
                            { method: "POST", path: "/api/v1/alerts/webhook", description: "Alertmanager notification receiver for incident automation" },
                            { method: "GET", path: "/api/v1/dashboards/export", description: "Exports JSON dashboard definitions for version control" },
                        ],
                        deploymentAndDevOps: "Deployed via Prometheus Operator on Kubernetes or Docker Compose for standalone infrastructure. Automated synthetic load testing using Locust/K6 to validate alerting thresholds.",
                        stepByStepGuide: [
                            "Step 1: Install and configure Prometheus Operator with custom ServiceMonitors.",
                            "Step 2: Deploy Grafana with automated datasources provisioning and role-based access control.",
                            "Step 3: Configure PromQL alert expressions for high error rates (>1% 5xx for 3m) and node memory exhaustion (>85%).",
                            "Step 4: Connect Alertmanager to Slack incoming webhooks with formatted alert cards.",
                            "Step 5: Run K6 load test script generating high concurrency traffic and error spikes to trigger alert notifications.",
                            "Step 6: Document incident response runbooks linked directly from each firing notification.",
                        ],
                        keyResumeBullets: [
                            "Architected enterprise observability telemetry stack with Prometheus, Grafana, and Alertmanager, monitoring 50+ service metrics.",
                            "Designed actionable PromQL alerting rules with deduplication and routing, reducing false-positive incident alerts by 40%.",
                            "Created unified Golden Signals dashboards providing engineering teams with instant visibility into p99 latency and system saturation.",
                        ],
                    },
                },
            ],
        };
    }
    // 2. Full-Stack Web Developer / Software Engineer (Default)
    return {
        remainingSkills: [
            "Advanced State Management & Optimistic UI Updates (Zustand, React Query / TanStack)",
            "Real-Time Event Streaming & WebSockets (Socket.io, Server-Sent Events, Redis Pub/Sub)",
            "Distributed Caching & Invalidation Strategies (Redis LRU Cache, Read-Through, Write-Behind)",
            "Asynchronous Background Job Queues (BullMQ / Celery, Dead-Letter Queues, Worker Threads)",
            "Production Security Hardening (OWASP Top 10, CSP Headers, CSRF Tokens, Rate Limiting)",
            "Container Orchestration & Microservices (Docker Compose, Multi-Stage Builds, Nginx Reverse Proxy)",
            "Automated CI/CD Workflows & Cloud Deployment (GitHub Actions, Vercel, AWS ECS / Render)",
        ],
        solidProjects: [
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
            {
                title: "High-Throughput E-Commerce Platform with Event-Driven Orders & Payment Webhooks",
                tagline: "Enterprise e-commerce platform built for high concurrency, featuring atomic inventory reservation, distributed lock management, Stripe webhook handling, and asynchronous email invoicing.",
                difficulty: "Production-Ready",
                technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Redis", "Stripe API", "BullMQ", "Docker"],
                fullStackDocumentation: {
                    architectureOverview: "Event-driven e-commerce engine designed to prevent overselling under high concurrency. Utilizes Redis distributed locks (Redlock) for atomic inventory reservation during checkout. Once payment is confirmed via Stripe webhooks, BullMQ queues handle asynchronous background tasks: invoice generation, order fulfillment, and transactional emails.",
                    frontendSpec: "Modern storefront with product catalog filtering, debounced search, responsive sliding cart drawer, seamless Stripe Elements checkout flow, and live order tracking status.",
                    backendSpec: "Node.js/Express service architecture with clean Separation of Concerns (Controllers, Services, Repositories). Features idempotent webhook handlers with signature verification and Redis rate limiting to mitigate denial of service.",
                    databaseSchema: "PostgreSQL relational schema with foreign key constraints and compound indexes:\n- Products (id, sku, title, priceInCents, inventoryCount, reservedCount)\n- Orders (id, customerId, status: 'pending'|'paid'|'failed', totalCents, idempotencyKey)\n- OrderItems (id, orderId, productId, quantity, priceAtPurchase)\n- PaymentTransactions (id, orderId, stripePaymentIntentId, status, webhookReceivedAt)",
                    apiEndpoints: [
                        { method: "GET", path: "/api/v1/products", description: "Paginated product catalog with category filter and text search" },
                        { method: "POST", path: "/api/v1/cart/checkout", description: "Reserves inventory atomically and creates Stripe Checkout session" },
                        { method: "POST", path: "/api/v1/webhooks/stripe", description: "Verifies Stripe signature and processes order fulfillment asynchronously" },
                        { method: "GET", path: "/api/v1/orders/:id", description: "Fetches verified order status and tracking details" },
                    ],
                    deploymentAndDevOps: "Docker multi-stage builds, PostgreSQL with automated database migrations, Redis container for queue persistence, and GitHub Actions CI running end-to-end checkout simulations.",
                    stepByStepGuide: [
                        "Step 1: Model relational database schema in PostgreSQL with CHECK constraints preventing negative inventory.",
                        "Step 2: Implement Redis distributed locking algorithm guaranteeing atomic stock reservations during checkout spikes.",
                        "Step 3: Integrate Stripe API with robust webhook signature verification and idempotent database transactions.",
                        "Step 4: Set up BullMQ background workers for automated PDF invoice generation and transactional email delivery.",
                        "Step 5: Build accessible React storefront with responsive cart management and optimistic status updates.",
                        "Step 6: Execute K6 concurrency load testing simulating 500 concurrent buyers competing for 20 inventory items without overselling.",
                    ],
                    keyResumeBullets: [
                        "Designed an event-driven order processing engine handling 1,000+ checkout requests/min with zero inventory overselling using Redis distributed locks.",
                        "Implemented secure Stripe webhook integration with idempotent transaction handling, ensuring 100% financial consistency across network retries.",
                        "Orchestrated asynchronous background job processing with BullMQ and Redis, offloading invoice PDF rendering and improving checkout latency by 60%.",
                    ],
                },
            },
        ],
    };
};
exports.generateRemainingSkillsAndProjects = generateRemainingSkillsAndProjects;
// ==================== 3. INTERVIEW MASTERY GENERATOR (+12 MONTHS) ====================
const generateInterviewMastery = (targetCareer, currentResume, milestones = []) => {
    const lower = targetCareer.toLowerCase();
    // 1. AWS Cloud Solutions Architect / DevOps / SRE
    if (lower.includes("cloud") || lower.includes("devops") || lower.includes("sre") || lower.includes("aws")) {
        return {
            targetRoleOverview: `As a career-ready ${targetCareer}, you are expected to design resilient, secure, and cost-effective multi-tier cloud infrastructure, automate deployment pipelines with zero manual interventions, diagnose live production outages, and lead architectural decisions.`,
            technicalQuestions: [
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
                    idealAnswer: "First, I inspect the high-level pod status and event logs using 'kubectl describe pod <pod-name>' to check for OOMKilled (Out of Memory) exit codes (137) or failed liveness/readiness probes. Second, I inspect recent and previous container logs using 'kubectl logs <pod-name> --previous' to capture unhandled application exceptions before termination. Third, if it's an OOMKilled issue, I check Prometheus metrics to see if traffic spiked or memory leaked, and temporarily adjust resource limits or scale replicas. If it's a configuration issue (e.g. failed database connection), I verify Secret/ConfigMap bindings and network reachability using 'kubectl exec' or temporary debug pods. Finally, once stabilized, I record a root-cause analysis (RCA) and implement preventative memory limits and alerts.",
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
                    idealAnswer: "We enforce an immutable remote backend using an Amazon S3 bucket with strict server-side KMS encryption, versioning enabled, and a DynamoDB table for distributed state locking. To prevent drift and uncontrolled manual modifications, all infrastructure changes must flow through a CI/CD pipeline (e.g., GitHub Actions / Atlantis) with automated 'terraform plan' PR comments and mandatory approvals. In production, we schedule periodic drift detection jobs and enforce least-privilege IAM policies that deny direct AWS console modification to managed resources.",
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
            ],
            takeHomeChallenges: [
                {
                    title: "Automated Resilient Cloud Architecture with Terraform & Docker",
                    prompt: "Design and write a complete, working Terraform module that provisions an AWS VPC with public and private subnets across 2 AZs, an Application Load Balancer, and an ECS Fargate or EC2 service running a containerized web application. Include an automated health check route, an S3 bucket with KMS encryption, and a GitHub Actions workflow that executes terraform fmt, validate, and plan.",
                    evaluationCriteria: [
                        "Clean, modular Terraform HCL structure with variables.tf, outputs.tf, and main.tf",
                        "Zero hardcoded credentials or plaintext secrets; proper IAM role usage",
                        "Network security: Application containers deployed in private subnets with NAT gateway routing",
                        "Comprehensive README with architecture diagram, cost estimate, and destruction runbook",
                    ],
                },
                {
                    title: "Kubernetes Incident Troubleshooting & Telemetry Simulation",
                    prompt: "Provided with a broken Kubernetes Helm chart exhibiting CrashLoopBackOff and failing ingress traffic, diagnose the misconfigurations (memory limit too low, incorrect readiness probe port, and missing ingress annotations), resolve them, and author a PromQL alerting rule with a documented post-mortem incident report.",
                    evaluationCriteria: [
                        "Accurate diagnosis of the root cause within the Kubernetes manifests",
                        "Clean fix committed with clear commit messages and Helm lint verification",
                        "Well-crafted PromQL alerting rule with correct duration and threshold syntax",
                        "Structured Root Cause Analysis (RCA) document following the 5-Whys methodology",
                    ],
                },
            ],
            interviewCheatSheet: [
                "Always lead system design answers by clarifying requirements (Functional: RPS, latency; Non-functional: Availability, Consistency, RTO/RPO).",
                "Mention CAP Theorem trade-offs early: explicitly state whether your system prioritizes Consistency (CP) or Availability (AP) during network partitions.",
                "Frame all behavioral answers in the STAR format (Situation, Task, Action, Result) with quantifiable impact metrics (e.g. 'reduced latency by 45%').",
                "When asked about an outage, never blame individuals: emphasize system safeguards, post-mortems, automated blameless testing, and defense-in-depth.",
                "Review key AWS metrics: ALB TargetResponseTime, RDS CPUUtilization and FreeableMemory, EBS VolumeQueueLength.",
                "Remember the Kubernetes resource request vs limit distinction: requests affect scheduling (Kube-scheduler), limits affect throttling (CPU) or eviction (OOMKilled).",
                "Know standard port numbers and protocols: SSH (22), DNS (53), HTTP/HTTPS (80/443), MySQL (3306), PostgreSQL (5432), Redis (6379).",
                "Prepare 3 strategic questions to ask the interviewer about their incident post-mortem culture, technical debt management, and deployment frequency.",
            ],
        };
    }
    // 2. Full-Stack Web Developer / Software Engineer (Default)
    return {
        targetRoleOverview: `As a career-ready ${targetCareer}, you are expected to architect scalable full-stack web applications, make informed database and API trade-offs, lead frontend performance and accessibility optimizations, and ship clean, testable code to production environments.`,
        technicalQuestions: [
            {
                category: "System Design & Scalability",
                question: "Design a high-throughput URL shortening service (like Bitly) handling 100 million new URLs per month and a 10:1 read-to-write ratio. How do you design the storage, key generation, and caching layers?",
                idealAnswer: "With 100M writes/month (~40 writes/sec) and a 10:1 read ratio (~400 reads/sec), traffic is manageable, but total storage over 5 years is significant (6 billion URLs). For key generation, a 7-character Base62 string (a-z, A-Z, 0-9) yields 62^7 (~3.5 trillion) unique combinations. Rather than hashing with MD5/SHA256 and dealing with collisions, I would use a distributed sequence generator (like Twitter Snowflake or pre-allocated Redis key ranges) and encode the integer ID into Base62. For storage, a NoSQL database (like DynamoDB or MongoDB) or a sharded relational database (PostgreSQL with hash partition on the short key) provides sub-5ms lookups. For reads, I implement an in-memory Redis cache with an LRU eviction policy storing the top 20% most requested URLs (Pareto Principle), which satisfies ~80% of read traffic without touching disk.",
                keyTalkingPoints: [
                    "Capacity estimation: 100M writes/month, 10:1 read ratio, 3.5T unique Base62 combinations",
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
        ],
        takeHomeChallenges: [
            {
                title: "Full-Stack Real-Time Analytics Dashboard",
                prompt: "Build and deploy a full-stack web application featuring an interactive analytics dashboard. The backend must ingest synthetic sensor or transaction events at 50 events/second, store them in a database, and broadcast real-time metrics over WebSockets to a React frontend. The frontend must display animated charts (Recharts or Chart.js) updating smoothly without UI freezing, include date range filtering, and support CSV export.",
                evaluationCriteria: [
                    "Clean full-stack TypeScript implementation with clear separation of concerns",
                    "Proper WebSocket connection lifecycle management (reconnect backoff, cleanup on unmount)",
                    "Performant frontend state management preventing unnecessary canvas re-renders under streaming load",
                    "Production deployment with live URL and comprehensive README explaining architectural choices",
                ],
            },
            {
                title: "Idempotent Payment & Order Processing API",
                prompt: "Develop an Express/Node.js RESTful service that implements an idempotent checkout API. Given simulated concurrent checkout attempts with the same Idempotency-Key header, the system must process payment exactly once, handle transient network failures gracefully, and store order records with ACID transaction guarantees in PostgreSQL or MongoDB.",
                evaluationCriteria: [
                    "Correct idempotency key caching and atomic database state transitions",
                    "Robust error handling with standard HTTP status codes and structured error payloads",
                    "Automated integration test suite with high concurrency simulations",
                    "Clear API documentation using OpenAPI/Swagger or clean Postman collections",
                ],
            },
        ],
        interviewCheatSheet: [
            "Start every System Design question by establishing Scope: Functional requirements, Non-functional requirements (DAU, latency, availability, consistency), and Read vs Write traffic ratios.",
            "Use the STAR method for behavioral questions: Situation (context), Task (your responsibility), Action (what YOU specifically coded/architected), Result (quantifiable business impact).",
            "When discussing databases, proactively mention indexing strategies (B-Tree, Hash, GIN) and connection pooling limits (e.g. PgBouncer).",
            "Always explain the 'why' behind framework choices: e.g. Why Zustand over Redux (bundle size, zero boilerplate), why PostgreSQL over MongoDB (relational constraints, ACID transactions).",
            "In live coding, communicate your thought process before typing: state brute force time complexity O(N^2), then propose the O(N) optimized approach with hash map or two pointers.",
            "Know your HTTP status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 422 (Unprocessable Entity), 429 (Too Many Requests), 500 (Internal Error), 502 (Bad Gateway), 504 (Gateway Timeout).",
            "Keep 2-3 prepared examples of a time you handled a difficult production bug, resolved an engineering disagreement, and scaled an existing system under load.",
        ],
    };
};
exports.generateInterviewMastery = generateInterviewMastery;
