"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCareerScenarios = exports.isCareerDecision = void 0;
const jobResearch_service_1 = require("../jobResearch.service");
/**
 * Checks whether an incoming decision is career-related.
 */
const isCareerDecision = (category, title, goal) => {
    const text = `${category || ""} ${title || ""} ${goal || ""}`.toLowerCase();
    const cat = (category || "").toLowerCase();
    if (cat.includes("career") || cat.includes("job") || cat.includes("profession")) {
        return true;
    }
    const careerKeywords = [
        "developer",
        "engineer",
        "analyst",
        "scientist",
        "designer",
        "architect",
        "programmer",
        "cybersecurity",
        "infosec",
        "full stack",
        "frontend",
        "backend",
        "data science",
        "devops",
        "product manager",
        "ui/ux",
        "intern",
        "internship",
        "hired",
        "job",
    ];
    return careerKeywords.some((kw) => text.includes(kw));
};
exports.isCareerDecision = isCareerDecision;
/**
 * Generates the 3 distinct, specialized scenarios for career decisions:
 * 1. Optimistic: Complete Structured Learning Roadmap
 * 2. Realistic: Comprehensive Interview Preparation Syllabus
 * 3. Pessimistic: Practical Projects, Internships & Recovery Plan
 */
const generateCareerScenarios = (input) => {
    const combined = `${input.decisionTitle} ${input.goal} ${input.additionalContext || ""}`.toLowerCase();
    const dailyCommitment = input.timeAvailable ? `${input.timeAvailable} hours per day` : "1.5 to 2 hours per day";
    const budgetNote = input.budget !== undefined ? `$${input.budget} total budget` : "Free and open-source materials preferred";
    // Detect exact domain
    const isCyber = combined.includes("cyber") || combined.includes("security") || combined.includes("soc") || combined.includes("infosec") || combined.includes("ethical hack");
    const isJava = combined.includes("java") || (combined.includes("full") && combined.includes("stack")) || combined.includes("spring");
    const isData = combined.includes("data") || combined.includes("machine learning") || combined.includes("ml") || combined.includes("artificial intelligence");
    const isDesign = combined.includes("ui") || combined.includes("ux") || combined.includes("figma") || combined.includes("design");
    // ==========================================
    // 1. OPTIMISTIC SCENARIO: LEARNING ROADMAP
    // ==========================================
    let learningRoadmap;
    if (isCyber) {
        learningRoadmap = {
            targetRole: "Cybersecurity Analyst / SOC Tier 1",
            estimatedLearningTime: "6 to 8 Months",
            dailyCommitment,
            overview: "A step-by-step technical learning roadmap taking you from computer networking fundamentals to security monitoring and incident response.",
            stages: [
                {
                    stageNumber: 1,
                    title: "Beginner Fundamentals & Networking Foundations",
                    timeframe: "Months 1-2",
                    skillsToMaster: ["Computer Networking", "TCP/IP & OSI Model", "DNS, DHCP, HTTP/S", "Common Ports & Protocols", "Subnetting Basics"],
                    coreConcepts: [
                        "How packets travel across the internet (IP addressing, routing, switching).",
                        "The 7 layers of OSI and 4 layers of TCP/IP.",
                        "Difference between TCP (reliable, connection-oriented) and UDP (fast, stateless).",
                        "How DNS resolves domain names into IP addresses and how TLS encrypts web traffic.",
                    ],
                    technologiesAndTools: ["Wireshark", "Cisco Packet Tracer", "Ping, Traceroute, Nslookup, Dig", "Command Line"],
                    practicalExercises: [
                        "Capture your own web browser traffic in Wireshark and inspect DNS queries and TLS handshakes.",
                        "Build a small virtual LAN network topology in Cisco Packet Tracer with 2 subnets and a router.",
                        "Trace network route hops to google.com using traceroute and analyze latency.",
                    ],
                    handsOnLabs: [
                        "TryHackMe 'Pre-Security' Learning Path (free rooms)",
                        "OverTheWire 'Bandit' wargame levels 0 to 10",
                    ],
                    recommendedResources: [
                        { title: "Professor Messer's Network+ Video Course", provider: "YouTube (Free)", isFree: true, url: "https://www.professormesser.com/" },
                        { title: "Wireshark Official Documentation & Sample Captures", provider: "Wireshark.org", isFree: true, url: "https://wiki.wireshark.org/SampleCaptures" },
                        { title: "Computer Networking: A Top-Down Approach (Overview)", provider: "MIT OpenCourseWare", isFree: true, url: "https://ocw.mit.edu/" },
                    ],
                    milestone: "Ability to explain any standard network packet capture and successfully navigate IP addressing and basic routing.",
                },
                {
                    stageNumber: 2,
                    title: "Operating Systems & Python for Security",
                    timeframe: "Months 3-4",
                    skillsToMaster: ["Linux Shell Navigation", "File Permissions & Ownership", "Windows Event Logs", "Python Automation Scripting"],
                    coreConcepts: [
                        "Linux file systems, processes, cron jobs, systemd services, and file permissions (chmod/chown).",
                        "Windows Registry, Active Directory basics, and Windows Security Event IDs.",
                        "Writing Python scripts to automate log parsing and search for suspicious IP addresses.",
                    ],
                    technologiesAndTools: ["Ubuntu Linux / Kali Linux", "Bash", "Python 3", "PowerShell", "RegEx"],
                    practicalExercises: [
                        "Set up an Ubuntu Linux virtual machine in VirtualBox and configure a non-root administrative user.",
                        "Write a 40-line Python script that reads an Apache or Nginx access log file and counts 404/403 status codes by IP.",
                        "Inspect Windows Security Event Log using PowerShell to identify failed logon attempts (Event ID 4625).",
                    ],
                    handsOnLabs: [
                        "TryHackMe 'Linux Fundamentals' & 'Windows Fundamentals' modules",
                        "OverTheWire 'Bandit' levels 11 to 25 (Linux automation)",
                    ],
                    recommendedResources: [
                        { title: "Linux Journey (Interactive Command Tutorial)", provider: "LinuxJourney.com", isFree: true, url: "https://linuxjourney.com/" },
                        { title: "Automate the Boring Stuff with Python", provider: "Al Sweigart (Free Online)", isFree: true, url: "https://automatetheboringstuff.com/" },
                    ],
                    milestone: "Comfortable managing Linux systems via terminal and writing Python scripts to filter and extract security log data.",
                },
                {
                    stageNumber: 3,
                    title: "Security Fundamentals & Vulnerability Management",
                    timeframe: "Months 5-6",
                    skillsToMaster: ["CIA Triad", "Authentication & Authorization", "Symmetric vs Asymmetric Encryption", "Vulnerability Scanning", "OWASP Top 10"],
                    coreConcepts: [
                        "Confidentiality, Integrity, and Availability (CIA) and how to evaluate risks.",
                        "How hashing (SHA-256) differs from encryption (AES, RSA) and salting.",
                        "Common web application attacks: SQL Injection, Cross-Site Scripting (XSS), and Broken Access Control.",
                        "Vulnerability scanning workflows: asset discovery, scanning, prioritization, and remediation reporting.",
                    ],
                    technologiesAndTools: ["Nmap", "Nessus Essentials (Free for home)", "Burp Suite Community", "OpenVAS"],
                    practicalExercises: [
                        "Perform an authorized scan of your local virtual machines using Nmap to identify open ports and services.",
                        "Configure Nessus Essentials on your home lab to perform an uncredentialed vulnerability scan of a test VM.",
                        "Practice attacking and defending OWASP Juice Shop on localhost using Burp Suite.",
                    ],
                    handsOnLabs: [
                        "TryHackMe 'Web Fundamentals' & 'OWASP Top 10' rooms",
                        "OWASP Juice Shop local Docker container",
                    ],
                    recommendedResources: [
                        { title: "OWASP Top 10 Official Documentation", provider: "OWASP.org", isFree: true, url: "https://owasp.org/www-project-top-ten/" },
                        { title: "Nmap Network Scanning (Official Free Guide by Fyodor)", provider: "Nmap.org", isFree: true, url: "https://nmap.org/book/" },
                    ],
                    milestone: "Deep understanding of how vulnerabilities arise, how attackers exploit them, and how defenders identify and patch them.",
                },
                {
                    stageNumber: 4,
                    title: "SOC Operations, SIEM Tools & Incident Response",
                    timeframe: "Months 7-8",
                    skillsToMaster: ["SIEM Log Analysis", "Threat Detection", "Security Alert Triage", "MITRE ATT&CK Mapping", "Incident Response Lifecycle"],
                    coreConcepts: [
                        "How SIEM tools collect, correlate, and normalize security telemetry from endpoints, firewalls, and servers.",
                        "Triage methodology: distinguishing genuine security incidents from false positives.",
                        "The 6 phases of incident response (NIST SP 800-61): Preparation, Detection & Analysis, Containment, Eradication, Recovery, and Lessons Learned.",
                        "Mapping adversary tactics, techniques, and procedures (TTPs) using the MITRE ATT&CK framework.",
                    ],
                    technologiesAndTools: ["Splunk (Free tier)", "Wazuh SIEM", "Suricata IDS", "Wireshark", "TheHive"],
                    practicalExercises: [
                        "Deploy Wazuh or Splunk on your local machine and ingest Windows Event Logs and Syslog feeds.",
                        "Simulate a brute-force SSH login attack in your lab and write a SIEM detection rule to trigger an alert.",
                        "Write a professional incident response triage report detailing an alert investigation from detection to containment.",
                    ],
                    handsOnLabs: [
                        "TryHackMe 'SOC Level 1' Path",
                        "LetsDefend.io Blue Team Analyst training (free track)",
                        "CyberDefenders.org practice challenges",
                    ],
                    recommendedResources: [
                        { title: "NIST Computer Security Incident Handling Guide (SP 800-61)", provider: "NIST.gov", isFree: true, url: "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final" },
                        { title: "Splunk Fundamentals 1 Free Training", provider: "Splunk", isFree: true, url: "https://www.splunk.com/en_us/training/free-courses/splunk-fundamentals-1.html" },
                    ],
                    milestone: "Confident analyzing live security telemetry, configuring SIEM alerts, and executing systematic incident triage.",
                },
            ],
        };
    }
    else if (isJava) {
        learningRoadmap = {
            targetRole: "Full-Stack Java Developer",
            estimatedLearningTime: "6 to 8 Months",
            dailyCommitment,
            overview: "A comprehensive developer roadmap covering Core Java, Object-Oriented Design, Spring Boot microservices, relational databases, and modern frontend React integration.",
            stages: [
                {
                    stageNumber: 1,
                    title: "Core Java, OOP & Data Structures",
                    timeframe: "Months 1-2",
                    skillsToMaster: ["Java 17+ Syntax", "OOP Principles (Encapsulation, Inheritance, Polymorphism, Abstraction)", "Collections Framework (List, Set, Map)", "Generics & Exception Handling", "Basic Algorithms"],
                    coreConcepts: [
                        "Java memory model: Heap vs Stack, Garbage Collection basics.",
                        "Writing clean object-oriented classes and interfaces.",
                        "Time and Space complexity (Big-O notation) for Lists, HashMaps, and TreeSets.",
                    ],
                    technologiesAndTools: ["Java JDK 17/21", "IntelliJ IDEA Community", "Git & GitHub", "JUnit 5"],
                    practicalExercises: [
                        "Build a console-based Banking or Library Management system with full validation and custom exceptions.",
                        "Solve 40 essential LeetCode Easy/Medium problems using Java Collections.",
                        "Write unit tests with JUnit 5 asserting edge cases and boundary conditions.",
                    ],
                    handsOnLabs: ["Java Programming I & II (University of Helsinki MOOC - Free)", "HackerRank Java Practice Badge"],
                    recommendedResources: [
                        { title: "Helsinki MOOC Java Course", provider: "University of Helsinki", isFree: true, url: "https://java-programming.mooc.fi/" },
                        { title: "Java Brains Core Java & Collections", provider: "YouTube (Free)", isFree: true, url: "https://www.youtube.com/c/JavaBrainsChannel" },
                    ],
                    milestone: "Fluent Java fluency with clean code, object-oriented design, and comprehensive JUnit tests.",
                },
                {
                    stageNumber: 2,
                    title: "Relational Databases, SQL & Spring Data JPA",
                    timeframe: "Months 3-4",
                    skillsToMaster: ["PostgreSQL / MySQL", "Complex SQL Queries & Joins", "Spring Boot Basics", "Spring Data JPA & Hibernate", "Entity Relationships"],
                    coreConcepts: [
                        "Relational database design, normalization (1NF, 2NF, 3NF), and indexing.",
                        "Inversion of Control (IoC) and Dependency Injection (DI) in Spring.",
                        "Object-Relational Mapping (ORM) with Hibernate: One-to-Many, Many-to-Many, and lazy vs eager fetching.",
                    ],
                    technologiesAndTools: ["PostgreSQL", "Spring Boot 3", "Spring Data JPA", "Flyway / Liquibase", "Postman"],
                    practicalExercises: [
                        "Design and normalize an e-commerce database schema with Users, Products, Orders, and Payments.",
                        "Write SQL queries testing INNER, LEFT, and FULL joins, aggregations, and subqueries.",
                        "Create a Spring Boot CRUD application with Repository, Service, and Controller layers.",
                    ],
                    handsOnLabs: ["SQLBolt interactive SQL tutorial", "Spring Guides - Building a RESTful Web Service"],
                    recommendedResources: [
                        { title: "Spring Initializr & Official Spring Guides", provider: "Spring.io", isFree: true, url: "https://spring.io/guides" },
                        { title: "SQL Tutorial", provider: "SQLBolt", isFree: true, url: "https://sqlbolt.com/" },
                    ],
                    milestone: "Ability to architect robust database schemas and connect them to Spring Boot using clean repository patterns.",
                },
                {
                    stageNumber: 3,
                    title: "RESTful Microservices & Spring Security",
                    timeframe: "Months 5-6",
                    skillsToMaster: ["REST API Best Practices", "Spring Security 6 & JWT Auth", "Validation with Jakarta Validation", "Docker Containerization", "API Documentation"],
                    coreConcepts: [
                        "REST conventions: HTTP verbs (GET, POST, PUT, DELETE, PATCH), idempotency, and status codes (200, 201, 400, 401, 404, 500).",
                        "Stateless authentication using JSON Web Tokens (JWT) and BCrypt password hashing.",
                        "Containerizing backend services with multi-stage Dockerfiles.",
                    ],
                    technologiesAndTools: ["Spring Security", "JWT", "Swagger / OpenAPI", "Docker", "Postman"],
                    practicalExercises: [
                        "Implement role-based authorization (USER, ADMIN) with Spring Security filters.",
                        "Containerize your backend application with Docker and test running it in an isolated container.",
                        "Write thorough integration tests with MockMvc and Testcontainers.",
                    ],
                    handsOnLabs: ["Baeldung Spring Security & JWT guides", "Docker for Java Developers tutorial"],
                    recommendedResources: [
                        { title: "Baeldung Spring Boot & Security Guides", provider: "Baeldung.com", isFree: true, url: "https://www.baeldung.com/" },
                        { title: "Docker Curriculum", provider: "DockerCurriculum.com", isFree: true, url: "https://docker-curriculum.com/" },
                    ],
                    milestone: "Production-ready REST APIs secured with JWT and packaged with Docker.",
                },
                {
                    stageNumber: 4,
                    title: "Modern Frontend (React & TypeScript) & Deployment",
                    timeframe: "Months 7-8",
                    skillsToMaster: ["React Hooks & Components", "TypeScript Fundamentals", "Axios API Integration", "State Management", "CI/CD & Cloud Deployment"],
                    coreConcepts: [
                        "Single-Page Application (SPA) architecture and client-side routing.",
                        "Connecting React UI components to Spring Boot endpoints with error handling.",
                        "Deploying full-stack applications with GitHub Actions to Render, Railway, or AWS.",
                    ],
                    technologiesAndTools: ["React", "TypeScript", "Tailwind CSS / CSS Modules", "GitHub Actions", "Vercel & Render"],
                    practicalExercises: [
                        "Build an end-to-end full-stack Task Management or Marketplace application with React frontend and Spring Boot backend.",
                        "Implement complete JWT auth flow in React with token storage and protected routes.",
                        "Deploy the full application with a public live URL and verifiable GitHub README.",
                    ],
                    handsOnLabs: ["Full Stack Open (University of Helsinki)", "React Official Tutorial"],
                    recommendedResources: [
                        { title: "Full Stack Open Course", provider: "University of Helsinki", isFree: true, url: "https://fullstackopen.com/en/" },
                        { title: "React Official Docs", provider: "React.dev", isFree: true, url: "https://react.dev/" },
                    ],
                    milestone: "A deployed, full-stack Java and React portfolio project with clean code, authentication, and live database.",
                },
            ],
        };
    }
    else if (isData) {
        learningRoadmap = {
            targetRole: "Data Scientist / Machine Learning Associate",
            estimatedLearningTime: "6 to 8 Months",
            dailyCommitment,
            overview: "A structured analytical learning roadmap covering Python data tools, relational SQL, statistical modeling, machine learning algorithms, and practical Kaggle project deployment.",
            stages: [
                {
                    stageNumber: 1,
                    title: "Python for Data Analysis & SQL Mastery",
                    timeframe: "Months 1-2",
                    skillsToMaster: ["Python Data Structures", "NumPy Vectorization", "Pandas DataFrames", "Data Cleaning & Imputation", "Advanced SQL Queries"],
                    coreConcepts: [
                        "Data manipulation: filtering, grouping, merging, and reshaping data with Pandas.",
                        "Handling missing values, outliers, and type conversions.",
                        "Writing multi-table SQL queries with Window functions (ROW_NUMBER, RANK) and CTEs.",
                    ],
                    technologiesAndTools: ["Python 3", "Jupyter Notebook / VS Code", "Pandas", "NumPy", "PostgreSQL"],
                    practicalExercises: [
                        "Download a messy real-world CSV dataset from Kaggle and perform complete exploratory data analysis (EDA).",
                        "Solve 30 SQL interview questions on LeetCode / StrataScratch focusing on aggregations and window functions.",
                    ],
                    handsOnLabs: ["Kaggle Micro-Courses (Python, Pandas, SQL)", "StrataScratch free SQL practice"],
                    recommendedResources: [
                        { title: "Python for Data Analysis (3rd Edition)", provider: "Wes McKinney (Free Online)", isFree: true, url: "https://wesmckinney.com/book/" },
                        { title: "Kaggle Learn Free Interactive Courses", provider: "Kaggle", isFree: true, url: "https://www.kaggle.com/learn" },
                    ],
                    milestone: "Fast, confident data wrangling in Pandas and high competence in advanced SQL joins and aggregations.",
                },
                {
                    stageNumber: 2,
                    title: "Statistics, Probability & Data Storytelling",
                    timeframe: "Months 3-4",
                    skillsToMaster: ["Descriptive Statistics", "Probability Distributions", "Hypothesis Testing (t-tests, A/B Testing)", "Data Visualization (Matplotlib, Seaborn)"],
                    coreConcepts: [
                        "Mean, median, variance, standard deviation, and interquartile range (IQR).",
                        "Normal, Binomial, and Poisson distributions; Central Limit Theorem.",
                        "Formulating null and alternative hypotheses, p-values, and confidence intervals.",
                    ],
                    technologiesAndTools: ["SciPy", "Matplotlib", "Seaborn", "Statsmodels", "Plotly"],
                    practicalExercises: [
                        "Run a simulated A/B testing analysis on marketing conversion rates with statistical significance tests.",
                        "Build an interactive dashboard using Seaborn and Plotly communicating trends clearly to non-technical stakeholders.",
                    ],
                    handsOnLabs: ["Khan Academy Statistics & Probability Path", "Kaggle Data Visualization tutorial"],
                    recommendedResources: [
                        { title: "StatQuest with Josh Starmer", provider: "YouTube (Free)", isFree: true, url: "https://www.youtube.com/c/joshstarmer" },
                        { title: "Khan Academy Statistics Course", provider: "Khan Academy", isFree: true, url: "https://www.khanacademy.org/math/statistics-probability" },
                    ],
                    milestone: "Ability to explain statistical significance, test hypotheses, and present compelling graphical insights.",
                },
                {
                    stageNumber: 3,
                    title: "Applied Machine Learning with Scikit-Learn",
                    timeframe: "Months 5-6",
                    skillsToMaster: ["Supervised Learning (Regression & Classification)", "Decision Trees & Random Forests", "Cross-Validation & Hyperparameter Tuning", "Model Evaluation Metrics (ROC-AUC, F1-Score)"],
                    coreConcepts: [
                        "Linear regression, Logistic regression, Support Vector Machines, and ensemble methods (Random Forest, Gradient Boosting).",
                        "Bias-Variance trade-off and preventing overfitting with regularization (L1/L2).",
                        "Precision, Recall, F1-score, Confusion Matrix, and ROC-AUC curves.",
                    ],
                    technologiesAndTools: ["Scikit-Learn", "XGBoost", "LightGBM", "Joblib"],
                    practicalExercises: [
                        "Build a customer churn prediction classification model and tune hyperparameters with GridSearchCV.",
                        "Compare Linear Regression against Random Forest Regressor on housing price data.",
                    ],
                    handsOnLabs: ["Kaggle 'Intro to Machine Learning' & 'Intermediate Machine Learning'", "Scikit-Learn Official User Guide Tutorials"],
                    recommendedResources: [
                        { title: "Scikit-Learn Official Tutorials", provider: "Scikit-Learn.org", isFree: true, url: "https://scikit-learn.org/stable/tutorial/index.html" },
                        { title: "Fast.ai Practical Deep Learning for Coders", provider: "Fast.ai", isFree: true, url: "https://course.fast.ai/" },
                    ],
                    milestone: "Independent creation and validation of end-to-end machine learning pipelines with rigorous cross-validation.",
                },
                {
                    stageNumber: 4,
                    title: "Model Deployment & Portfolio Showcase",
                    timeframe: "Months 7-8",
                    skillsToMaster: ["Model Serialization (Pickle/Joblib)", "FastAPI / Flask Inference Endpoints", "Streamlit Interactive Apps", "Docker & Cloud Deployment"],
                    coreConcepts: [
                        "Wrapping machine learning models inside lightweight REST APIs.",
                        "Building interactive web demos with Streamlit so recruiters can test your models live.",
                        "Deploying apps on Streamlit Cloud or Render with clean GitHub documentation.",
                    ],
                    technologiesAndTools: ["FastAPI", "Streamlit", "Docker", "GitHub", "Streamlit Cloud"],
                    practicalExercises: [
                        "Build a live Streamlit web application where users enter parameters and receive instant ML predictions.",
                        "Write a polished GitHub README with architecture diagrams, data dictionary, and metric comparisons.",
                    ],
                    handsOnLabs: ["Streamlit 'Get Started' tutorials", "FastAPI official interactive docs tutorial"],
                    recommendedResources: [
                        { title: "Streamlit Documentation & Component Gallery", provider: "Streamlit.io", isFree: true, url: "https://docs.streamlit.io/" },
                        { title: "FastAPI Official Tutorial", provider: "Tiangolo", isFree: true, url: "https://fastapi.tiangolo.com/tutorial/" },
                    ],
                    milestone: "Two deployed, interactive machine learning web applications linked prominently in your resume and GitHub.",
                },
            ],
        };
    }
    else if (isDesign) {
        learningRoadmap = {
            targetRole: "UI/UX Product Designer",
            estimatedLearningTime: "5 to 7 Months",
            dailyCommitment,
            overview: "A design thinking and digital product roadmap covering user research, information architecture, Figma design systems, interactive prototyping, and portfolio case studies.",
            stages: [
                {
                    stageNumber: 1,
                    title: "Design Fundamentals, Typography & Visual Hierarchy",
                    timeframe: "Months 1-2",
                    skillsToMaster: ["Visual Design Principles", "Color Theory & Contrast (WCAG)", "Typography Scales", "Grid Systems & Spacing Rules", "Figma Basics"],
                    coreConcepts: [
                        "Visual hierarchy: using size, weight, and color to guide the user's eye naturally.",
                        "The 8pt grid system for consistent margins, padding, and layout alignment.",
                        "Web accessibility contrast ratios to ensure products are usable by everyone.",
                    ],
                    technologiesAndTools: ["Figma", "Contrast Checker Tools", "Google Fonts", "Coolors.co"],
                    practicalExercises: [
                        "Recreate 3 popular mobile app screens (e.g. Spotify, Airbnb) pixel-for-pixel in Figma to understand spacing.",
                        "Build a personal design style guide with typographic scale, primary/secondary colors, and button states.",
                    ],
                    handsOnLabs: ["Figma 101 Official Tutorials", "Daily UI Challenge (first 15 challenges)"],
                    recommendedResources: [
                        { title: "Refactoring UI (Visual Design Guide)", provider: "Adam Wathan & Steve Schoger", isFree: false },
                        { title: "Figma for Beginners Series", provider: "YouTube (Figma Official)", isFree: true, url: "https://www.youtube.com/c/Figmadesign" },
                    ],
                    milestone: "Confident visual design execution with accurate spacing, clean typography, and mastery of Figma frames and shapes.",
                },
                {
                    stageNumber: 2,
                    title: "User Experience (UX) Research & Wireframing",
                    timeframe: "Months 3-4",
                    skillsToMaster: ["User Interviews", "User Personas & Journey Maps", "Information Architecture", "Low-Fidelity Wireframing", "Problem Statements"],
                    coreConcepts: [
                        "Conducting qualitative user interviews without asking leading questions.",
                        "Synthesizing user findings into empathy maps, personas, and user flows.",
                        "Creating low-fidelity wireframes that prioritize layout and usability over visual decoration.",
                    ],
                    technologiesAndTools: ["FigJam", "Miro", "Notion", "Pen & Paper Sketching"],
                    practicalExercises: [
                        "Conduct interviews with 3 people about a daily struggle (e.g. booking fitness classes) and document findings.",
                        "Draw a complete 10-screen user flow diagram for the onboarding process of a mobile application.",
                    ],
                    handsOnLabs: ["Google UX Design Professional Certificate overview (Coursera free audit)", "Laws of UX interactive guide"],
                    recommendedResources: [
                        { title: "Laws of UX (Design Principles with Psychology)", provider: "Lawsofux.com", isFree: true, url: "https://lawsofux.com/" },
                        { title: "Nielsen Norman Group Articles", provider: "NNgroup.com", isFree: true, url: "https://www.nngroup.com/articles/" },
                    ],
                    milestone: "Deep understanding of user problems before touching high-fidelity visuals, backed by structured research notes.",
                },
                {
                    stageNumber: 3,
                    title: "Advanced Figma: Auto-Layout & Design Systems",
                    timeframe: "Months 4-5",
                    skillsToMaster: ["Figma Auto-Layout 5.0", "Component Variants & Properties", "Design Tokens", "Interactive Prototyping", "Micro-Interactions"],
                    coreConcepts: [
                        "Building truly responsive Figma components that stretch and adapt across desktop and mobile screens.",
                        "Component architecture: nested instances, boolean toggles, and text property overrides.",
                        "Smart Animate transitions for realistic micro-interactions (dropdowns, modals, toggles).",
                    ],
                    technologiesAndTools: ["Figma Components", "Auto-Layout", "Design Tokens", "Smart Animate"],
                    practicalExercises: [
                        "Build an atomic design system component library in Figma (Buttons, Inputs, Cards, Badges, Modals).",
                        "Create a clickable interactive prototype with working navigation and animated transitions.",
                    ],
                    handsOnLabs: ["Figma Community Design System teardowns", "Figma Auto-Layout interactive playground file"],
                    recommendedResources: [
                        { title: "Figma Auto-Layout Mastery File", provider: "Figma Community", isFree: true, url: "https://www.figma.com/community" },
                    ],
                    milestone: "Production-ready Figma proficiency matching professional tech industry workflows.",
                },
                {
                    stageNumber: 4,
                    title: "Usability Testing & Case Study Portfolio",
                    timeframe: "Months 6-7",
                    skillsToMaster: ["Usability Testing Sessions", "Design Iteration based on Feedback", "Case Study Storytelling", "Design Handoff to Developers", "Portfolio Website"],
                    coreConcepts: [
                        "Running unmoderated or moderated usability tests with realistic tasks.",
                        "Structuring a compelling case study: Problem -> Research -> Wireframes -> Iteration -> Final UI -> Results.",
                        "Annotating designs and token values for seamless developer handoff.",
                    ],
                    technologiesAndTools: ["Maze / Useberry", "Figma Dev Mode", "Framer / Webflow / Notion Portfolio"],
                    practicalExercises: [
                        "Run usability testing on your interactive prototype with 4 users and write an iteration report.",
                        "Publish 2 complete, detailed case studies on your portfolio website or Behance/Medium.",
                    ],
                    handsOnLabs: ["Cofolios & Bestfolios case study analysis", "Maze usability testing tutorial"],
                    recommendedResources: [
                        { title: "Case Study Club - Curated Product Design Case Studies", provider: "CaseStudyClub.com", isFree: true, url: "https://www.casestudy.club/" },
                    ],
                    milestone: "A live portfolio containing two rigorous, beautiful case studies demonstrating end-to-end design thinking.",
                },
            ],
        };
    }
    else {
        // General technical career fallback
        learningRoadmap = {
            targetRole: input.decisionTitle,
            estimatedLearningTime: "6 to 8 Months",
            dailyCommitment,
            overview: `A complete, progressive learning roadmap to master the foundational, intermediate, and professional competencies required for ${input.decisionTitle}.`,
            stages: [
                {
                    stageNumber: 1,
                    title: "Core Foundations & Tooling",
                    timeframe: "Months 1-2",
                    skillsToMaster: ["Fundamental Concepts", "Essential Vocabulary & Standards", "Environment Setup & CLI", "Version Control (Git)"],
                    coreConcepts: [
                        "Core theory and standard workflows in this field.",
                        "Setting up your development or professional workspace.",
                        "Building disciplined daily practice routines.",
                    ],
                    technologiesAndTools: ["Industry Standard Software", "Git & GitHub", "Command Line"],
                    practicalExercises: [
                        "Complete initial hands-on beginner exercises and build small proof-of-concept projects.",
                        "Publish all work into a public GitHub or documentation repository.",
                    ],
                    handsOnLabs: ["Free online introductory labs and tutorials"],
                    recommendedResources: [
                        { title: "Official Documentation & Free Community Guides", provider: "Official Docs", isFree: true },
                    ],
                    milestone: "Solid foundational understanding and smooth workflow using standard industry tools.",
                },
                {
                    stageNumber: 2,
                    title: "Applied Concepts & Practical Implementations",
                    timeframe: "Months 3-4",
                    skillsToMaster: ["Intermediate Methodologies", "Standard Frameworks", "Problem Decomposition", "Testing & Verification"],
                    coreConcepts: [
                        "How different parts of the system interact with each other.",
                        "Writing clean, modular, and maintainable solutions.",
                    ],
                    technologiesAndTools: ["Specialized Frameworks & Libraries", "Testing Suites"],
                    practicalExercises: [
                        "Build an intermediate-level functional project addressing a real-world scenario.",
                    ],
                    handsOnLabs: ["Interactive coding or configuration platforms"],
                    recommendedResources: [
                        { title: "Comprehensive Video & Documentation Tracks", provider: "Open Educational Resources", isFree: true },
                    ],
                    milestone: "Ability to independently build intermediate projects without copy-pasting code.",
                },
                {
                    stageNumber: 3,
                    title: "Advanced Specialization & Production Standards",
                    timeframe: "Months 5-6",
                    skillsToMaster: ["Optimization & Performance", "Security & Reliability", "Architecture & Clean Code", "Collaboration Best Practices"],
                    coreConcepts: [
                        "Production constraints, error handling, and performance tuning.",
                        "Industry best practices for code reviews and documentation.",
                    ],
                    technologiesAndTools: ["Advanced Tooling", "Monitoring & Debugging Utilities"],
                    practicalExercises: [
                        "Refactor an existing project to adhere to high performance and security benchmarks.",
                    ],
                    handsOnLabs: ["Advanced guided workshops and open-source contributions"],
                    recommendedResources: [
                        { title: "In-depth Technical Case Studies & Books", provider: "Industry Leaders", isFree: true },
                    ],
                    milestone: "Production-ready technical skills ready for professional team environments.",
                },
            ],
        };
    }
    // ==========================================
    // 2. REALISTIC SCENARIO: INTERVIEW MASTERY
    // ==========================================
    let interviewPreparation;
    if (isCyber) {
        interviewPreparation = {
            targetRole: "Cybersecurity Analyst / SOC Tier 1",
            overview: "A comprehensive technical and practical interview syllabus covering the exact subjects, subtopics, sample questions, and checklists evaluated in entry-level cybersecurity hiring.",
            frequentlyTestedConcepts: [
                "The 3-way TCP handshake (SYN, SYN-ACK, ACK) and how connection teardown works.",
                "How DNS resolution functions from client cache to recursive resolver, root, TLD, and authoritative nameserver.",
                "Difference between symmetric encryption (fast, bulk data) and asymmetric encryption (key exchange, digital signatures).",
                "Investigating a phishing email header (SPF, DKIM, DMARC validation).",
                "Handling a simulated ransomware alert: immediate network isolation, memory capture, log preservation.",
            ],
            subjects: [
                {
                    subjectName: "Computer Networking & Network Defense",
                    importantTopics: ["OSI vs TCP/IP Model", "TCP vs UDP", "DNS & DHCP Operations", "HTTP vs HTTPS & TLS", "Common Ports & Protocols", "Firewalls & VPNs", "Subnetting"],
                    detailedSubtopics: [
                        "Port mapping: 20/21 (FTP), 22 (SSH), 23 (Telnet), 25 (SMTP), 53 (DNS), 80 (HTTP), 443 (HTTPS), 3389 (RDP), 445 (SMB).",
                        "Stateful vs Stateless firewalls and where Next-Gen Firewalls (NGFW) fit.",
                        "IP packet headers: Source/Dest IP, TTL, Flags (SYN, ACK, FIN, RST).",
                    ],
                    whatToUnderstand: "You must be able to trace a packet from your keyboard to a web server and explain what every security device on that path does with the packet.",
                    practicalExercises: [
                        "Practice explaining the OSI layers out loud in under 2 minutes using real-world analogies.",
                        "Inspect a Wireshark capture file and identify the IP address generating excessive SYN requests (SYN flood attack).",
                    ],
                    interviewQuestions: [
                        { question: "Can you explain what happens under the hood when you type 'https://google.com' into your browser?", answerHint: "Cover DNS resolution, TCP 3-way handshake on port 443, TLS cryptographic negotiation, HTTP GET request, and server HTTP 200 response.", type: "technical" },
                        { question: "What is the difference between TCP and UDP? When would you use one over the other?", answerHint: "TCP guarantees delivery and order using sequence numbers and ACKs. UDP is lightweight and connectionless, used for real-time video/DNS/voice where speed beats retransmission.", type: "technical" },
                        { question: "A user reports they cannot connect to an internal server by name, but can by IP address. What is the issue?", answerHint: "This is a classic DNS resolution failure. Check client DNS settings, hosts file, or DNS server connectivity.", type: "scenario" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: [
                        "I can list standard ports (20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 3389) from memory.",
                        "I can explain the difference between a router, switch, and firewall.",
                        "I can describe how VPN tunnels protect communications across untrusted networks.",
                    ],
                },
                {
                    subjectName: "Linux & Operating Systems Security",
                    importantTopics: ["Linux File Permissions (rwx)", "Process Management (ps, top, kill)", "System Logs (/var/log)", "User & Group Admin", "Windows Event IDs"],
                    detailedSubtopics: [
                        "Numeric permissions: chmod 755 vs 644 vs 400 and SUID/SGID bits.",
                        "Key log files: /var/log/auth.log (or secure), /var/log/syslog, /var/log/nginx/access.log.",
                        "Critical Windows Event IDs: 4624 (Successful Login), 4625 (Failed Login), 4720 (User Created), 7045 (New Service Installed).",
                    ],
                    whatToUnderstand: "How operating systems record user actions and how attackers hide their malicious processes and modify files.",
                    practicalExercises: [
                        "Use grep, awk, and sort to find the top 5 IP addresses with failed SSH attempts in an auth.log file.",
                        "Explain how to check running processes and cron jobs on Linux for suspicious activity.",
                    ],
                    interviewQuestions: [
                        { question: "How would you investigate a suspected unauthorized user login on a Linux server?", answerHint: "Check /var/log/auth.log or /var/log/secure, run 'last' and 'who' commands, review active processes (ps aux), and check ~/.bash_history and ~/.ssh/authorized_keys.", type: "technical" },
                        { question: "What does 'chmod 755 filename' mean?", answerHint: "Owner has read, write, execute (7 = 4+2+1). Group has read and execute (5 = 4+1). Others have read and execute (5 = 4+1).", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: [
                        "I know how to read and filter logs using grep, tail, and awk.",
                        "I can identify common Windows Security Event IDs for failed logins and privilege escalation.",
                    ],
                },
                {
                    subjectName: "Security Principles, Cryptography & Attacks",
                    importantTopics: ["CIA Triad", "Symmetric vs Asymmetric Encryption", "Hashing vs Encoding vs Encryption", "OWASP Top 10", "Phishing & Social Engineering", "Malware Types"],
                    detailedSubtopics: [
                        "Why Base64 is encoding (reversible without a key) and not encryption.",
                        "How public-key cryptography works in SSL/TLS certificates and SSH keys.",
                        "SQL Injection mechanisms: 'OR 1=1 --' and prepared statements as the defense.",
                        "Cross-Site Scripting (XSS): Stored, Reflected, and DOM-based.",
                    ],
                    whatToUnderstand: "The fundamental goals of security (CIA) and the mechanisms used to prevent unauthorized data tampering and viewing.",
                    practicalExercises: [
                        "Explain the difference between a vulnerability, a threat, and a risk to an executive in plain English.",
                        "Inspect sample raw HTTP request headers for SQL injection or XSS payloads.",
                    ],
                    interviewQuestions: [
                        { question: "Explain the difference between Hashing, Encoding, and Encryption.", answerHint: "Encoding changes data format for transmission (no key, reversible). Encryption transforms plaintext to ciphertext using a secret key (reversible only with key). Hashing is a one-way mathematical function producing a fixed-size digest (irreversible).", type: "technical" },
                        { question: "What is Cross-Site Scripting (XSS) and how do developers protect against it?", answerHint: "XSS occurs when untrusted input is executed as JavaScript in a victim's browser. Protection requires proper context-aware output encoding and Content Security Policy (CSP).", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: [
                        "I can clearly distinguish hashing from encryption with examples.",
                        "I can explain at least 3 OWASP Top 10 vulnerabilities and their fixes.",
                    ],
                },
                {
                    subjectName: "SOC Operations, SIEM & Incident Triage",
                    importantTopics: ["SIEM Fundamentals", "False Positives vs True Positives", "Incident Response Stages (NIST)", "MITRE ATT&CK Matrix", "Phishing Investigation"],
                    detailedSubtopics: [
                        "How SIEM correlation rules detect patterns (e.g. 10 failed logins followed by 1 successful login from foreign IP).",
                        "Containment strategies: host isolation, revoking active sessions, blocking malicious IP on firewall.",
                        "Chain of custody and preserving volatile memory.",
                    ],
                    whatToUnderstand: "How a Security Operations Center functions on a daily basis and how alerts are triaged from initial detection to resolution.",
                    practicalExercises: [
                        "Walk through a scenario where a workstation triggers a suspicious PowerShell download alert.",
                    ],
                    interviewQuestions: [
                        { question: "You receive an alert that a finance employee's workstation made multiple outbound connections to an unknown external IP at 2:00 AM. What are your immediate first 3 steps?", answerHint: "1) Verify alert details and external IP reputation (VirusTotal/AbuseIPDB); 2) Isolate the workstation from the network to prevent lateral movement; 3) Check running processes and contact the user/supervisor while preserving logs.", type: "scenario" },
                        { question: "What is a false positive, and how does a SOC analyst handle high volumes of false alerts?", answerHint: "A false positive is a benign activity incorrectly flagged as malicious. Analysts document evidence, verify legitimate business need, and work with SIEM engineers to tune the detection rule threshold.", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Advanced",
                    checklist: [
                        "I know the 6 phases of NIST incident response.",
                        "I can explain how to handle a live ransomware outbreak.",
                    ],
                },
            ],
            hrInterviewQuestions: [
                { question: "Why do you want to work in Cybersecurity, and how do you stay updated with emerging threats?", guidance: "Mention your genuine interest in defense, specific labs you solved (TryHackMe), and RSS/news feeds you follow (BleepingComputer, KrebsOnSecurity, The Hacker News)." },
                { question: "Tell me about a time you ran into a difficult technical problem and how you solved it.", guidance: "Use the STAR method (Situation, Task, Action, Result). Highlight structured debugging and persistence rather than giving up." },
            ],
            resumeChecklist: [
                "Include a dedicated 'Home Lab & Practical Projects' section listing your VirtualBox, Wireshark, and SIEM setup.",
                "Mention TryHackMe or HackTheBox profile ranks and free badges.",
                "Focus on hands-on tools: Wireshark, Nmap, Splunk/Wazuh, Linux Bash, Python.",
                "Ensure clean ATS formatting without complex tables, multi-column layouts, or graphics.",
            ],
            mockInterviewPractice: "Spend 30 minutes every Wednesday and Saturday answering technical questions aloud in front of a mirror or recording your voice. Practice explaining technical terms without using unnecessary jargon.",
        };
    }
    else if (isJava) {
        interviewPreparation = {
            targetRole: "Full-Stack Java Developer",
            overview: "A comprehensive developer interview syllabus covering Core Java, OOP principles, Collections, Spring Boot microservices, SQL databases, and frontend integration.",
            frequentlyTestedConcepts: [
                "Java memory management: Garbage Collector, Stack vs Heap, and pass-by-value semantics.",
                "Differences between HashMap, ConcurrentHashMap, and TreeMap; how HashMap handles collisions.",
                "Spring Dependency Injection, Bean lifecycles, and @Component vs @Service vs @Repository.",
                "Database indexing: B-Trees, clustered vs non-clustered indexes, and query optimization.",
                "RESTful design: handling idempotent operations, status codes, and exception translation.",
            ],
            subjects: [
                {
                    subjectName: "Core Java & Object-Oriented Programming",
                    importantTopics: ["OOP 4 Pillars", "Abstract Class vs Interface (Java 8+ defaults)", "String Pool & Immutability", "Exception Hierarchy", "Generics"],
                    detailedSubtopics: [
                        "Why Strings are immutable in Java (security, caching, synchronization).",
                        "Checked vs Unchecked exceptions (IOException vs RuntimeException).",
                        "equals() and hashCode() contract and why breaking it corrupts HashMaps.",
                    ],
                    whatToUnderstand: "You must demonstrate clean object-oriented architecture and understand how Java manages memory and classes behind the scenes.",
                    practicalExercises: [
                        "Implement custom equals() and hashCode() for an Employee class and verify with JUnit.",
                    ],
                    interviewQuestions: [
                        { question: "What is the difference between an abstract class and an interface in Java 8 and beyond?", answerHint: "An abstract class can hold instance state and constructors; a class can only inherit one abstract class. Interfaces define behavior, support multiple implementation, and can have default/static methods but no instance fields.", type: "technical" },
                        { question: "Why is String immutable in Java?", answerHint: "Security (parameters like passwords/URLs cannot be modified after checks), thread-safety without synchronization, and caching in the String Constant Pool.", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Advanced",
                    checklist: [
                        "I can explain OOP with practical real-world code examples.",
                        "I understand how the Garbage Collector marks and sweeps memory.",
                    ],
                },
                {
                    subjectName: "Java Collections & Concurrency Basics",
                    importantTopics: ["List vs Set vs Map", "HashMap Internal Working", "ArrayList vs LinkedList", "Thread Lifecycle", "Synchronized & volatile"],
                    detailedSubtopics: [
                        "HashMap hashing: hash code, bucket array index, collision resolution using linked lists and red-black trees (Java 8+).",
                        "Fail-fast vs fail-safe iterators.",
                    ],
                    whatToUnderstand: "How Java organizes data structures in memory and when to choose the right collection for performance.",
                    practicalExercises: [
                        "Write a program that groups words by frequency using HashMap and sorts by values.",
                    ],
                    interviewQuestions: [
                        { question: "How does HashMap work internally in Java 8?", answerHint: "It uses an array of Nodes with hashing. Keys are mapped to buckets via hashCode(). In case of collisions, elements form a linked list. In Java 8+, if a bucket exceeds 8 elements and array length >= 64, it converts to a red-black tree (O(log n)).", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: [
                        "I can explain HashMap collisions and the equals/hashCode contract.",
                    ],
                },
                {
                    subjectName: "Spring Boot & Microservices Architecture",
                    importantTopics: ["Spring IoC & Dependency Injection", "Spring Boot Auto-Configuration", "Spring Data JPA & Hibernate", "Spring Security & JWT", "Exception Handling (@ControllerAdvice)"],
                    detailedSubtopics: [
                        "Bean scopes: Singleton, Prototype, Request, Session.",
                        "JPA relationships: @OneToMany, @ManyToOne, fetch types (Lazy vs Eager), and avoiding the N+1 query problem.",
                        "Centralized error handling using @RestControllerAdvice and custom error responses.",
                    ],
                    whatToUnderstand: "How modern enterprise applications structure REST APIs, manage database connections, and secure endpoints.",
                    practicalExercises: [
                        "Build a mini REST API with Global Exception Handling and validation annotations.",
                    ],
                    interviewQuestions: [
                        { question: "What is the N+1 problem in Hibernate/JPA and how do you solve it?", answerHint: "The N+1 problem occurs when fetching an entity triggers 1 query for the parent and N separate queries for each child. It is solved using JOIN FETCH, Entity Graphs, or Batch fetching.", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: [
                        "I can design a RESTful API following proper HTTP status code conventions.",
                    ],
                },
                {
                    subjectName: "Databases, SQL & Data Structures",
                    importantTopics: ["SQL Joins", "Indexing & Query Plans", "Transactions & ACID Properties", "Arrays, Strings, Linked Lists, Trees", "Big-O Notation"],
                    detailedSubtopics: [
                        "ACID: Atomicity, Consistency, Isolation, Durability.",
                        "Optimizing slow queries using EXPLAIN ANALYZE and proper indexing.",
                    ],
                    whatToUnderstand: "How data is queried efficiently and how common algorithmic problems are solved.",
                    practicalExercises: [
                        "Solve 20 medium LeetCode algorithmic problems in Java.",
                    ],
                    interviewQuestions: [
                        { question: "What is a database index and what are the trade-offs of adding too many indexes?", answerHint: "An index speeds up SELECT read queries by creating an auxiliary search structure (like a B-Tree). The trade-off is that every INSERT, UPDATE, and DELETE becomes slower because the index must also be updated.", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: [
                        "I can write complex SQL joins and explain indexing trade-offs.",
                    ],
                },
            ],
            hrInterviewQuestions: [
                { question: "How do you handle disagreement with a senior engineer or code reviewer?", guidance: "Emphasize listening, focusing on data/benchmarks rather than ego, and prioritizing code maintainability and team standards." },
            ],
            resumeChecklist: [
                "Highlight 2 major full-stack projects with live deployment links and GitHub repositories.",
                "Detail technologies used: Java 17, Spring Boot, PostgreSQL, Docker, React, JUnit.",
                "Include verifiable metrics (e.g. 'reduced query latency by 35% through indexing').",
            ],
            mockInterviewPractice: "Practice 1 live coding challenge per day using LeetCode or HackerRank without using IDE autocompletion.",
        };
    }
    else {
        // General technical career interview syllabus
        interviewPreparation = {
            targetRole: input.decisionTitle,
            overview: `A complete interview preparation syllabus detailing technical subjects, expected knowledge standards, and practice questions for ${input.decisionTitle}.`,
            frequentlyTestedConcepts: [
                "Fundamental architecture and core principles of the field.",
                "Standard problem-solving and troubleshooting workflows.",
                "Code quality, performance trade-offs, and maintainability.",
            ],
            subjects: [
                {
                    subjectName: "Core Domain Fundamentals",
                    importantTopics: ["Key Concepts", "Industry Standards", "Primary Tools & Syntax"],
                    detailedSubtopics: ["Foundational terminology", "Common workflows", "Essential tools"],
                    whatToUnderstand: "Comprehensive grasp of the basic building blocks required to execute entry-level work.",
                    practicalExercises: ["Complete core exercises testing basic theory."],
                    interviewQuestions: [
                        { question: `What are the core responsibilities and foundational principles in ${input.decisionTitle}?`, answerHint: "Provide a structured explanation using concrete examples.", type: "technical" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: ["I can define and explain core domain concepts clearly."],
                },
                {
                    subjectName: "Applied Problem Solving & Practical Scenarios",
                    importantTopics: ["Real-world Scenarios", "Troubleshooting Workflows", "Performance Optimization"],
                    detailedSubtopics: ["Diagnosing unexpected errors", "Best practice guidelines"],
                    whatToUnderstand: "How to approach unfamiliar problems calmly and systematically.",
                    practicalExercises: ["Analyze and resolve a sample case study."],
                    interviewQuestions: [
                        { question: "Walk me through how you troubleshoot a failure in a live system.", answerHint: "Structure your answer: 1) Identify symptoms; 2) Isolate variables; 3) Form hypothesis; 4) Test fix; 5) Document post-mortem.", type: "scenario" },
                    ],
                    expectedKnowledgeLevel: "Intermediate",
                    checklist: ["I have a consistent, structured troubleshooting method."],
                },
            ],
            hrInterviewQuestions: [
                { question: "What motivates you in this field, and where do you see yourself in 2 years?", guidance: "Focus on continuous skill development and contributing to real business impact." },
            ],
            resumeChecklist: [
                "List practical projects with verifiable outcomes.",
                "Clearly emphasize hands-on tools and practical methodologies.",
            ],
            mockInterviewPractice: "Conduct weekly mock interviews with peers or record your responses to assess clarity and confidence.",
        };
    }
    // ==========================================
    // 3. PESSIMISTIC SCENARIO: PROJECTS, INTERNSHIPS & BACKUP
    // ==========================================
    const jobListings = (0, jobResearch_service_1.getJobResearchForRole)(input.decisionTitle, undefined, input.skills || input.additionalContext);
    const marketAnalysis = (0, jobResearch_service_1.getMarketAnalysis)(input.decisionTitle, input.skills || input.additionalContext);
    let projects;
    let alternativeRoutes;
    if (isCyber) {
        projects = [
            {
                name: "Virtual Security Home Lab & Traffic Inspection",
                level: "Beginner",
                problemSolved: "Demonstrates practical networking defense by creating an isolated virtual environment to inspect real network traffic and packet anomalies.",
                technologies: ["VirtualBox", "Ubuntu Linux", "Windows 10/11 VM", "Wireshark", "Nmap"],
                skillsDemonstrated: ["Virtualization", "Subnetting", "Packet Capture & Analysis", "Port Scanning"],
                implementationSteps: [
                    "Install VirtualBox and configure an internal NAT network with an Ubuntu Linux and Windows 10 virtual machine.",
                    "Use Nmap from the Linux VM to perform TCP SYN, UDP, and service version detection scans against the Windows VM.",
                    "Capture the scan traffic in Wireshark; document the flags (SYN, RST, ACK) in a PDF report.",
                ],
                expectedOutput: "A functional virtual lab with a documented network diagram and annotated Wireshark packet capture analysis.",
                githubRecommendations: "Include network topology diagram, screenshots of Wireshark filter syntax, and a clean Markdown README detailing the scan findings.",
            },
            {
                name: "Centralized SIEM & Threat Detection with Wazuh",
                level: "Intermediate",
                problemSolved: "Simulates an enterprise security operations environment where endpoint events are collected, correlated, and alerted in real time.",
                technologies: ["Wazuh SIEM", "Elasticsearch / OpenSearch", "Windows Event Forwarding", "Linux Syslog", "Bash"],
                skillsDemonstrated: ["Log Ingestion", "Detection Engineering", "Rule Tuning", "Alert Triage"],
                implementationSteps: [
                    "Deploy Wazuh Manager on an Ubuntu server and install Wazuh Agents on client VMs.",
                    "Simulate 10 failed SSH logins followed by a successful login; verify the Wazuh alert fires.",
                    "Write a custom XML rule in Wazuh to alert whenever a new user account is added to the administrators group.",
                ],
                expectedOutput: "A live SIEM dashboard processing real endpoint logs with custom alerting rules and dashboard widgets.",
                githubRecommendations: "Publish custom Wazuh XML rules, sample alert logs, and a step-by-step installation guide in your GitHub repo.",
            },
            {
                name: "Automated Incident Triage & IOC Extractor in Python",
                level: "Advanced",
                problemSolved: "Automates repetitive SOC analyst work by extracting Indicators of Compromise (IOCs) from suspicious text or email headers and querying threat intelligence APIs.",
                technologies: ["Python 3", "VirusTotal API", "AbuseIPDB API", "Regex", "Flask / CLI"],
                skillsDemonstrated: ["Security Automation", "Threat Intelligence Integration", "Scripting", "API Usage"],
                implementationSteps: [
                    "Write a Python script that parses raw email headers or text files and extracts all IPv4 addresses, domains, and SHA-256 hashes using regular expressions.",
                    "Query the VirusTotal and AbuseIPDB free public APIs to check reputation scores for each extracted IOC.",
                    "Generate a clean HTML or Markdown summary report categorizing IOCs as Clean, Suspicious, or Malicious.",
                ],
                expectedOutput: "A fast, automated CLI tool that reduces alert triage time from 20 minutes to 15 seconds.",
                githubRecommendations: "Include a demo GIF in the README, instructions for setting API keys safely via environment variables, and unit tests.",
            },
        ];
        alternativeRoutes = [
            {
                role: "IT Support Specialist / Helpdesk Technician",
                description: "Hands-on experience managing user permissions, Active Directory, network troubleshooting, and hardware configurations.",
                howItHelpsProgression: "Builds deep practical operating system and networking credibility that makes transitioning to SOC Analyst natural after 6-12 months.",
            },
            {
                role: "Junior Network Administrator / Network Support",
                description: "Monitoring routers, switches, firewalls, and VPN connections across corporate infrastructure.",
                howItHelpsProgression: "Network engineers possess the exact packet-level fluency that top cybersecurity teams actively recruit for security monitoring.",
            },
            {
                role: "Vulnerability Management Trainee / Auditor",
                description: "Running scheduled Nessus or OpenVAS vulnerability scans and assisting system owners with patching.",
                howItHelpsProgression: "Direct entry into cybersecurity without requiring 24/7 SOC shift hours, focusing on risk reduction and compliance.",
            },
            {
                role: "Junior System Administrator (Linux / Windows)",
                description: "Managing servers, backups, security patching, and group policies.",
                howItHelpsProgression: "Understanding how systems break and are configured gives you superior offensive and defensive security intuition.",
            },
        ];
    }
    else if (isJava) {
        projects = [
            {
                name: "RESTful Task Management API with JWT Authentication",
                level: "Beginner",
                problemSolved: "Provides a secure, multi-user backend REST API for managing tasks, categories, and due dates.",
                technologies: ["Java 17", "Spring Boot", "Spring Security", "JWT", "H2 / PostgreSQL", "JUnit 5"],
                skillsDemonstrated: ["REST API Design", "Authentication & Authorization", "Validation", "Unit Testing"],
                implementationSteps: [
                    "Initialize Spring Boot with Spring Web, Spring Security, Spring Data JPA, and Validation.",
                    "Build User registration and login endpoints generating signed JWT tokens with BCrypt password hashing.",
                    "Implement Task CRUD endpoints with user-level isolation so users can only access their own tasks.",
                ],
                expectedOutput: "A fully tested REST API documented with Swagger UI and verified with 15+ JUnit tests.",
                githubRecommendations: "Include Swagger documentation link, sample curl commands, and clear setup instructions with an embedded H2 database.",
            },
            {
                name: "Full-Stack E-Commerce Platform with Microservice Elements",
                level: "Intermediate",
                problemSolved: "End-to-end full-stack web application connecting product catalog, user cart, order placement, and persistent database storage.",
                technologies: ["Spring Boot 3", "React", "TypeScript", "PostgreSQL", "Docker", "Tailwind CSS"],
                skillsDemonstrated: ["Full-Stack Integration", "Database Normalization", "Containerization", "State Management"],
                implementationSteps: [
                    "Design relational schema for Users, Products, Categories, Orders, and OrderItems in PostgreSQL.",
                    "Build Spring Boot backend services with pagination, sorting, and transactional order checkout.",
                    "Create a responsive React & TypeScript frontend allowing users to browse products, filter by price, and manage cart state.",
                    "Containerize both frontend and backend using Docker Compose.",
                ],
                expectedOutput: "A deployed full-stack e-commerce application with a live URL and Docker Compose local one-click start.",
                githubRecommendations: "Add high-resolution screenshots, a system architecture diagram, and instructions on running 'docker compose up'.",
            },
            {
                name: "Real-Time Event Processing & Notification Service",
                level: "Advanced",
                problemSolved: "Demonstrates enterprise-grade asynchronous communication using message brokers and real-time WebSocket notifications.",
                technologies: ["Spring Boot", "Apache Kafka or RabbitMQ", "WebSockets", "Redis Caching", "Docker"],
                skillsDemonstrated: ["Event-Driven Architecture", "Message Queuing", "Caching Strategy", "Real-Time Streaming"],
                implementationSteps: [
                    "Configure a Kafka topic or RabbitMQ exchange for processing asynchronous user events (e.g. payment confirmations).",
                    "Implement a producer service that publishes events and a consumer service that processes them and updates status in Redis.",
                    "Push instant status updates to connected browser clients via WebSockets without page refreshes.",
                ],
                expectedOutput: "A high-throughput distributed event processing pipeline handling concurrent tasks reliably.",
                githubRecommendations: "Include an architectural sequence diagram, latency benchmarks, and clean configuration files.",
            },
        ];
        alternativeRoutes = [
            {
                role: "Junior QA / Test Automation Engineer (Java)",
                description: "Writing automated end-to-end and API integration tests using Selenium, RestAssured, and Java.",
                howItHelpsProgression: "You write real Java code daily, master testing best practices, and frequently transition into core developer roles within the same engineering team.",
            },
            {
                role: "Junior Frontend Developer (React / JavaScript)",
                description: "Building responsive web interfaces and consuming REST APIs.",
                howItHelpsProgression: "Strengthens client-side engineering skills, turning you into a true full-stack developer when paired with your backend knowledge.",
            },
            {
                role: "Application Support Engineer / Production Operations",
                description: "Troubleshooting live Java application server issues, inspecting JVM logs, and querying production databases.",
                howItHelpsProgression: "Exceptional real-world debugging experience that gives you unmatched appreciation for robust error handling and logging.",
            },
        ];
    }
    else if (isData) {
        projects = [
            {
                name: "Exploratory Data Analysis & Business Intelligence Dashboard",
                level: "Beginner",
                problemSolved: "Cleans, transforms, and visualizes a messy real-world business dataset to uncover actionable trends.",
                technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter"],
                skillsDemonstrated: ["Data Cleaning", "Imputation", "Outlier Detection", "Exploratory Analysis"],
                implementationSteps: [
                    "Download raw retail or customer dataset from Kaggle; handle null values and type mismatches.",
                    "Generate statistical summaries and distribution plots; calculate correlation matrices.",
                    "Synthesize 5 key executive insights into an annotated Jupyter notebook with charts.",
                ],
                expectedOutput: "A clean, reproducible Jupyter notebook with markdown commentary and publication-grade charts.",
                githubRecommendations: "Include a summary executive slide deck and data dictionary in the GitHub repository.",
            },
            {
                name: "Customer Churn Prediction Classification Pipeline",
                level: "Intermediate",
                problemSolved: "Builds a predictive machine learning pipeline that flags customers likely to cancel services before they churn.",
                technologies: ["Python", "Scikit-Learn", "XGBoost", "PostgreSQL", "Joblib"],
                skillsDemonstrated: ["Feature Engineering", "Model Selection", "Hyperparameter Tuning", "Metric Evaluation"],
                implementationSteps: [
                    "Perform feature encoding (OneHotEncoding, StandardScaler) and balance target classes with SMOTE.",
                    "Train baseline Logistic Regression, Random Forest, and XGBoost models; optimize with GridSearchCV.",
                    "Evaluate using ROC-AUC, Precision-Recall curves, and Confusion Matrix.",
                ],
                expectedOutput: "A trained, cross-validated classification model achieving >0.85 ROC-AUC on holdout test data.",
                githubRecommendations: "Add model comparison tables, feature importance graphs, and serialized model files.",
            },
            {
                name: "End-to-End Deployed ML Web Application with Streamlit",
                level: "Advanced",
                problemSolved: "Deploys a live interactive web application allowing non-technical recruiters and users to input data and receive instant ML predictions.",
                technologies: ["FastAPI", "Streamlit", "Docker", "Streamlit Cloud", "GitHub"],
                skillsDemonstrated: ["Model Deployment", "Web App Development", "API Design", "Cloud Hosting"],
                implementationSteps: [
                    "Build a clean Streamlit interface with sliders and inputs for user parameters.",
                    "Connect the UI to the trained model for instant real-time inference.",
                    "Deploy on Streamlit Cloud with public URL and automated GitHub CI.",
                ],
                expectedOutput: "A live public web application testing machine learning inference on user inputs.",
                githubRecommendations: "Include live demo URL at the top of the README with a demo walkthrough GIF.",
            },
        ];
        alternativeRoutes = [
            {
                role: "Junior Data Analyst / Business Analyst",
                description: "Writing SQL queries, building dashboard reports in PowerBI/Tableau, and presenting metrics to teams.",
                howItHelpsProgression: "Develops deep business context and advanced SQL querying fluency, creating an ideal springboard into Data Science.",
            },
            {
                role: "Data Operations / Database Specialist",
                description: "Managing data extraction, transformation, pipeline validation, and data quality checks.",
                howItHelpsProgression: "Provides hands-on data engineering fundamentals that set you apart from theorists.",
            },
        ];
    }
    else if (isDesign) {
        projects = [
            {
                name: "Responsive Design System & Component Library in Figma",
                level: "Beginner",
                problemSolved: "Creates a standardized design system ensuring visual consistency across web and mobile screens.",
                technologies: ["Figma", "Auto-Layout", "Design Tokens", "WCAG Contrast Guidelines"],
                skillsDemonstrated: ["Component Architecture", "Variant Properties", "Visual Hierarchy", "Accessibility"],
                implementationSteps: [
                    "Establish global color tokens, typographic scales (Major Third), and 8pt grid rules.",
                    "Build interactive component variants for Buttons, Form Inputs, Badges, and Navigation bars.",
                    "Test components across mobile (375px), tablet (768px), and desktop (1440px) breakpoints.",
                ],
                expectedOutput: "A comprehensive Figma community component library file with auto-layout and interactive variants.",
                githubRecommendations: "Publish public Figma Community file link, style guidelines documentation, and component specs.",
            },
            {
                name: "End-to-End Mobile App UX Case Study & Interactive Prototype",
                level: "Intermediate",
                problemSolved: "Solves a real human problem through user research, empathy mapping, wireframing, and interactive prototyping.",
                technologies: ["Figma", "FigJam", "User Interviews", "Smart Animate", "Miro"],
                skillsDemonstrated: ["User Research", "Information Architecture", "Wireframing", "Clickable Prototyping"],
                implementationSteps: [
                    "Conduct 3 user interviews, identify primary pain points, and build user personas and journey maps.",
                    "Create low-fidelity wireframes exploring 3 different layout approaches for the core task flow.",
                    "Design polished high-fidelity screens and link into a clickable interactive prototype with Smart Animate.",
                ],
                expectedOutput: "A complete, published case study detailing the problem, iterations, and final interactive prototype.",
                githubRecommendations: "Link to online portfolio or Behance/Medium case study with high-res prototypes and user quotes.",
            },
            {
                name: "SaaS Analytics Dashboard with Micro-Interactions & Usability Testing",
                level: "Advanced",
                problemSolved: "Designs complex data-dense web application screens with intuitive filtering and verified usability.",
                technologies: ["Figma", "Maze", "Usability Testing", "Design Handoff"],
                skillsDemonstrated: ["Complex UI Design", "Usability Testing Sessions", "Micro-Interactions", "Developer Specs"],
                implementationSteps: [
                    "Design complex data tables with multi-column sorting, search filters, and status badges.",
                    "Run usability testing on Maze with 5 users to measure task completion rate and time-on-task.",
                    "Annotate layout specs and redlines for frontend engineers in Figma Dev Mode.",
                ],
                expectedOutput: "A production-grade SaaS web interface proven through usability testing with full developer handoff notes.",
                githubRecommendations: "Include usability test metrics, before-and-after iteration comparisons, and design token exports.",
            },
        ];
        alternativeRoutes = [
            {
                role: "Junior Visual Designer / Graphic Specialist",
                description: "Creating marketing visuals, landing page graphics, and brand assets.",
                howItHelpsProgression: "Sharpens typographic and visual taste while collaborating with product and marketing teams.",
            },
            {
                role: "UX Research Assistant",
                description: "Recruiting user testing participants, taking interview notes, and transcribing usability sessions.",
                howItHelpsProgression: "Mastery of user empathy and qualitative research—the most prized and rare skill in product design.",
            },
        ];
    }
    else {
        // General career projects & alternatives
        projects = [
            {
                name: "Foundational Showcase Project",
                level: "Beginner",
                problemSolved: "Addresses a single focused real-world problem using fundamental tools of the field.",
                technologies: ["Core Industry Tools", "Git"],
                skillsDemonstrated: ["Fundamentals", "Clean Organization", "Documentation"],
                implementationSteps: [
                    "Define problem scope and expected input/output.",
                    "Build initial implementation with clean commenting.",
                    "Publish repository with clean README.",
                ],
                expectedOutput: "A functional, documented starter project.",
                githubRecommendations: "Include clear problem description and visual preview.",
            },
            {
                name: "Comprehensive End-to-End Practical Solution",
                level: "Intermediate",
                problemSolved: "Solves an end-to-end workflow integrating multiple technologies and real data.",
                technologies: ["Intermediate Frameworks", "Database / Storage", "API / Interface"],
                skillsDemonstrated: ["Architecture", "Data Handling", "User Experience"],
                implementationSteps: [
                    "Design schema and modular components.",
                    "Implement complete functional flow with validation.",
                    "Deploy to public hosting.",
                ],
                expectedOutput: "A live deployed project accessible via URL.",
                githubRecommendations: "Add live demo link, screenshots, and architecture overview.",
            },
            {
                name: "Advanced Production-Grade Architecture",
                level: "Advanced",
                problemSolved: "Handles complex requirements such as concurrency, security, and performance optimization.",
                technologies: ["Advanced Tooling", "Testing Suite", "CI/CD Pipeline"],
                skillsDemonstrated: ["Performance Tuning", "Security Standards", "Scalability"],
                implementationSteps: [
                    "Implement automated testing and continuous integration.",
                    "Benchmark performance and optimize bottlenecks.",
                ],
                expectedOutput: "A high-performance system adhering to industry benchmarks.",
                githubRecommendations: "Include test coverage reports and performance benchmarks.",
            },
        ];
        alternativeRoutes = [
            {
                role: "Junior Technical Associate / Trainee",
                description: "Entry-level rotational role supporting technical projects.",
                howItHelpsProgression: "Provides immediate industry experience and professional team references.",
            },
            {
                role: "Technical Support / Quality Assurance",
                description: "Testing systems, reproducing bugs, and validating features.",
                howItHelpsProgression: "Direct pathway to engineering and specialized roles through internal mobility.",
            },
        ];
    }
    const recoveryStrategy = {
        reasonsForStruggle: [
            "Applying with a generic resume rather than tailoring keywords to the exact job description.",
            "Submitting applications without verifiable public GitHub projects or live demo links.",
            "Lack of hands-on lab demonstration—recruiters want to see what you built, not just certificates.",
            "Applying exclusively to hyper-competitive top-tier firms rather than mid-sized startups and IT service providers.",
        ],
        resumeImprovements: [
            "Place a 'Featured Practical Projects' section directly beneath your summary, with bolded tool names.",
            "Include clickable links to your live projects and GitHub repositories.",
            "Strip all complex graphics, multiple columns, and rating bars to ensure 100% ATS readability.",
            "Write accomplishment bullets using the Google formula: 'Accomplished [X] as measured by [Y] by doing [Z]'.",
        ],
        additionalProjects: [
            "Build one hyper-targeted clone or enhancement of a feature used by companies you are targeting.",
            "Create a public technical tutorial or write a detailed Markdown walkthrough of how you solved a tough bug.",
        ],
        missingTechnicalSkills: marketAnalysis.userSkillGaps,
        networkingAndPortfolioTips: [
            "Connect with 5 alumni or junior engineers currently working in your target role on LinkedIn each week.",
            "Send personalized, non-entitled connection notes: 'Hi [Name], loved your recent post on [Topic]. Aspiring [Role] here—really admire your path!'",
            "Participate in local tech meetups or active Discord/Slack developer communities.",
        ],
        thirtyDayActionPlan: [
            "Days 1-5: Complete a full resume audit, rebuild it in single-column ATS format, and update your LinkedIn headline.",
            "Days 6-12: Complete and polish your Intermediate portfolio project; ensure README has screenshots and setup instructions.",
            "Days 13-18: Practice answering 20 core technical interview questions out loud and solve 1 practical exercise daily.",
            "Days 19-25: Submit 5 tailored applications daily on LinkedIn, Naukri, and Wellfound; follow up with hiring managers politely.",
            "Days 26-30: Attend 1 online or in-person community meetup, connect with recruiters, and review feedback from any rejections.",
        ],
    };
    const opportunitiesAndBackup = {
        targetRole: input.decisionTitle,
        overview: "A resilient backup and real-world execution plan focusing on hands-on portfolio projects, live entry-level internship opportunities, and stepping-stone career pathways.",
        projects,
        internshipOpportunities: jobListings,
        jobMarketAnalysis: marketAnalysis,
        alternativeRoutes,
        recoveryStrategy,
    };
    // ==========================================
    // MAP TO STANDARD SCENARIOS (BACKWARDS COMPATIBLE)
    // ==========================================
    const optimisticSteps = learningRoadmap.stages.map((stage) => ({
        stepNumber: stage.stageNumber,
        title: stage.title,
        timeframe: stage.timeframe,
        description: `Master ${stage.skillsToMaster.slice(0, 3).join(", ")}. Complete hands-on labs and achieve milestone: ${stage.milestone}`,
        whatToDo: stage.coreConcepts.slice(0, 2).join(" "),
        howToDoIt: stage.practicalExercises[0] || "Practice daily hands-on exercises.",
        targetResult: stage.milestone,
        completionCheck: `Verified mastery of ${stage.technologiesAndTools.slice(0, 3).join(", ")} and completed lab assignments.`,
    }));
    const realisticSteps = interviewPreparation.subjects.map((subj, idx) => ({
        stepNumber: idx + 1,
        title: `Interview Mastery: ${subj.subjectName}`,
        timeframe: `Week ${idx * 2 + 1}-${idx * 2 + 2}`,
        description: `Study ${subj.importantTopics.slice(0, 3).join(", ")}. Practice answering sample technical questions and complete checklists.`,
        whatToDo: subj.whatToUnderstand,
        howToDoIt: subj.practicalExercises[0] || "Answer technical questions out loud.",
        targetResult: `Knowledge level: ${subj.expectedKnowledgeLevel}. Complete checklist of ${subj.checklist.length} core competencies.`,
        completionCheck: "Pass mock assessment on this subject without referring to notes.",
    }));
    const pessimisticSteps = [
        {
            stepNumber: 1,
            title: "Build & Deploy 3 Portfolio Projects",
            timeframe: "Month 1-2",
            description: "Construct Beginner, Intermediate, and Advanced practical projects demonstrating real-world problem solving.",
            whatToDo: "Build practical solutions that solve real business and technical problems.",
            howToDoIt: "Follow step-by-step implementations and document everything on GitHub.",
            targetResult: "3 verifiable GitHub repositories with live links.",
            completionCheck: "All 3 projects have clean READMEs with architecture diagrams.",
        },
        {
            stepNumber: 2,
            title: "Targeted Internship & Fresher Applications",
            timeframe: "Month 3-4",
            description: "Apply across LinkedIn, Naukri, and Wellfound using 0-experience and internship public search filters.",
            whatToDo: "Submit 5 tailored applications daily and follow up politely.",
            howToDoIt: "Use verified job platform search links and tailor your resume keywords.",
            targetResult: "Secure initial interviews and technical assessments.",
            completionCheck: "Track all applications in a spreadsheet and monitor callback rates.",
        },
        {
            stepNumber: 3,
            title: "Stepping-Stone Route & 30-Day Recovery Execution",
            timeframe: "Month 5+",
            description: "If immediate offers are delayed, enter via alternative stepping-stone roles (support, QA, junior ops) while executing the 30-day action plan.",
            whatToDo: "Gain direct industry experience in a related role while continuing skill advancement.",
            howToDoIt: "Apply to IT support, QA, or junior associate roles to get your foot in the door.",
            targetResult: "Industry employment, professional references, and clear trajectory to your target role.",
            completionCheck: "Active industry employment with real team experience.",
        },
    ];
    return {
        decisionOverview: {
            yourDecision: `You want to achieve: "${input.goal}". You are deciding: "${input.decisionTitle}".`,
            whatWeKnow: input.currentSituation
                ? `Current reality: ${input.currentSituation}. Available time: ${dailyCommitment}. ${budgetNote}.`
                : `Starting from your current schedule with ${dailyCommitment}. ${budgetNote}.`,
            assumptions: [
                `Assumes consistent commitment of ${dailyCommitment}.`,
                "Assumes internet access to free and open-source documentation and developer tools.",
                "Assumes willingness to build practical hands-on labs rather than relying solely on passive video watching.",
            ],
            missingDetails: input.skills ? undefined : [
                "Your current technical skills were not specified; the roadmap begins from core fundamentals.",
            ],
        },
        scenarios: [
            {
                name: "Your Learning Roadmap (Structured Technical Mastery)",
                description: `A complete, stage-by-stage learning roadmap answering exactly what to learn, in what order, and how to practice to master ${input.decisionTitle}.`,
                type: "optimistic",
                riskLevel: "low",
                expectedTimeline: learningRoadmap.estimatedLearningTime,
                advantages: [
                    "Complete clarity on exactly what technologies and concepts to study each month.",
                    "Focuses on free and accessible high-quality community resources.",
                    "Builds genuine hands-on competence through practical exercises and labs.",
                ],
                challenges: [
                    "Requires consistent daily focus and self-discipline.",
                    "Concepts compound; skipping fundamentals leads to confusion later.",
                ],
                requiredResources: [
                    "Computer with internet access",
                    "Free tools and IDEs",
                    dailyCommitment,
                ],
                steps: optimisticSteps,
                outcomes: [
                    {
                        title: `Complete Technical Fluency in ${input.decisionTitle}`,
                        description: "You develop confident, practical mastery across all core and intermediate technologies required in the profession.",
                        probability: 88,
                        impact: "high",
                        userControls: "Your daily study habits and completion of hands-on labs.",
                        dependsOnOthersOrMarket: "None; learning progress is entirely in your control.",
                    },
                    {
                        title: "Strong Foundation for Interviews & Real-World Work",
                        description: "You can explain complex technical concepts simply and build working projects independently.",
                        probability: 82,
                        impact: "high",
                        userControls: "Active practice and hands-on coding rather than passive reading.",
                        dependsOnOthersOrMarket: "None.",
                    },
                ],
                learningRoadmap,
            },
            {
                name: "Your Interview Preparation (Technical Syllabus & Assessment Guide)",
                description: `A rigorous interview preparation syllabus answering what to prepare to perform well in technical and HR interviews for ${input.decisionTitle}.`,
                type: "realistic",
                riskLevel: "medium",
                expectedTimeline: "2 to 3 Months Dedicated Prep",
                advantages: [
                    "Subject-by-subject clarity on frequently asked interview questions.",
                    "Clear guidance on what you must understand for each technical topic.",
                    "Concrete checklist ensuring you never walk into an interview unprepared.",
                ],
                challenges: [
                    "Explaining technical concepts under interview pressure takes vocal practice.",
                    "Requires solving problems out loud without relying on autocomplete.",
                ],
                requiredResources: [
                    "Whiteboard or notebook for sketching architectures",
                    "Peer or mentor for mock interview practice",
                ],
                steps: realisticSteps,
                outcomes: [
                    {
                        title: "High Performance in Technical Screening Rounds",
                        description: "You answer fundamental and scenario-based technical questions with clarity, structure, and depth.",
                        probability: 76,
                        impact: "high",
                        userControls: "Practicing answering questions aloud and mastering the preparation checklist.",
                        dependsOnOthersOrMarket: "Interview panel expectations and team requirements.",
                    },
                    {
                        title: "Professional Communication & Confidence",
                        description: "You articulate your problem-solving thought process calmly without freezing or over-promising.",
                        probability: 80,
                        impact: "medium",
                        userControls: "Mock interview practice and vocal rehearsal.",
                        dependsOnOthersOrMarket: "None.",
                    },
                ],
                interviewPreparation,
            },
            {
                name: "Your Projects, Internships & Job Opportunities (Real-World & Backup Plan)",
                description: `A resilient backup and practical execution plan covering portfolio projects, live entry-level internship opportunities, and stepping-stone career routes for ${input.decisionTitle}.`,
                type: "pessimistic",
                riskLevel: "medium",
                expectedTimeline: "4 to 6 Months Execution",
                advantages: [
                    "Guarantees you build verifiable, public GitHub portfolio projects.",
                    "Direct links to official public entry-level search filters across LinkedIn, Naukri, and Wellfound.",
                    "Provides stepping-stone alternative careers so you can start gaining industry experience immediately.",
                    "Includes a complete 30-day recovery strategy if initial applications are rejected.",
                ],
                challenges: [
                    "Entry-level market is competitive; requires consistent application discipline.",
                    "Rejection is common; resilience and iterative resume improvement are essential.",
                ],
                requiredResources: [
                    "Active GitHub account",
                    "Single-column ATS formatted resume",
                    "Profiles on LinkedIn, Naukri, and Wellfound",
                ],
                backupPlan: "If direct offers are delayed, accept an adjacent stepping-stone role (IT support, QA, junior operations) while executing the 30-day recovery action plan.",
                steps: pessimisticSteps,
                outcomes: [
                    {
                        title: "Verifiable Public Portfolio & Industry Exposure",
                        description: "You establish 3 robust GitHub repositories and active applications across verified job channels.",
                        probability: 85,
                        impact: "high",
                        userControls: "Completing project implementations and submitting daily applications.",
                        dependsOnOthersOrMarket: "Company hiring cycles and economic conditions.",
                    },
                    {
                        title: "Entry into Industry via Direct Role or Stepping-Stone Pathway",
                        description: "You secure an entry-level position or related stepping-stone role that provides immediate experience and mentorship.",
                        probability: 74,
                        impact: "high",
                        userControls: "Willingness to consider adjacent entry points and continuous portfolio refinement.",
                        dependsOnOthersOrMarket: "Available openings in your location.",
                    },
                ],
                opportunitiesAndBackup,
            },
        ],
    };
};
exports.generateCareerScenarios = generateCareerScenarios;
