"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDomainRoadmapFallback = exports.generateDomainAnalysisFallback = exports.projectFutureResume = exports.generateRoadmapWithAI = exports.analyzeResumeGapsWithAI = exports.refineResumeWithAI = void 0;
const env_1 = require("../../config/env");
const resumeHorizonGenerators_1 = require("./resumeHorizonGenerators");
const getAIConfig = () => {
    const apiUrl = env_1.env.AI_API_URL?.trim() || "";
    const apiKey = env_1.env.AI_API_KEY?.trim() || "";
    const model = env_1.env.AI_MODEL?.trim() || "openai/gpt-oss-20b";
    return { apiUrl, apiKey, model };
};
const RESUME_SYSTEM_PROMPT = "You are LifeFlow Resume Intelligence. Analyze resumes and generate career-specific development plans. " +
    "CRITICAL TRUST RULE: Never fabricate a user's experience, education, certifications, projects, skills, or achievements. " +
    "Clearly distinguish existing information, user-reported information, planned activities, and future projections. " +
    "When information is insufficient, state it as missing or unknown rather than inventing details. Return strictly valid JSON.";
/**
 * Uses Groq to refine and parse raw resume text into structured fields.
 */
const refineResumeWithAI = async (rawText, fallback) => {
    const { apiUrl, apiKey, model } = getAIConfig();
    if (!apiUrl || !apiKey || rawText.trim().length < 50)
        return fallback;
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                temperature: 0.1,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: RESUME_SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `Extract complete, detailed structured resume data from this raw document text without inventing or fabricating any facts.
CRITICAL INSTRUCTIONS:
- Parse the WHOLE resume thoroughly.
- Extract every work experience (company, role title, location, dates, description, and individual bullet achievements).
- Extract every project (name, detailed description, technologies used, link).
- Extract every education entry (institution, degree, field of study, start and end dates).
- Extract all certifications (name, issuer, issue date).
- Extract all skills and technical tools.
- Clean up the professional summary: it must only contain the candidate's professional bio or career summary statement. Remove any raw phone numbers, email headers, raw portfolio URLs, or document symbols (like §, #, |).

Return strictly valid JSON with exact keys:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
  "summary": "",
  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "", "gpa": "" }],
  "experience": [{ "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "", "achievements": [] }],
  "skills": [],
  "technicalTools": [],
  "projects": [{ "name": "", "description": "", "technologies": [], "link": "" }],
  "certifications": [{ "name": "", "issuer": "", "issueDate": "" }]
}

Raw resume document text:
${rawText.slice(0, 30000)}`,
                    },
                ],
            }),
            signal: AbortSignal.timeout(25000),
        });
        if (!response.ok)
            return fallback;
        const data = (await response.json());
        const content = data.choices?.[0]?.message?.content;
        if (!content)
            return fallback;
        const parsed = JSON.parse(content);
        const cleanSummary = String(parsed.summary || fallback.summary || "")
            .replace(/^[\s§#|•\d+()\-—:]+/, "")
            .replace(/(?:email|phone|portfolio|linkedin|github)\s*[:#|]/gi, "")
            .trim();
        return {
            personalInfo: {
                fullName: parsed.personalInfo?.fullName || fallback.personalInfo.fullName,
                email: parsed.personalInfo?.email || fallback.personalInfo.email,
                phone: parsed.personalInfo?.phone || fallback.personalInfo.phone,
                location: parsed.personalInfo?.location || fallback.personalInfo.location,
                linkedin: parsed.personalInfo?.linkedin || fallback.personalInfo.linkedin,
                github: parsed.personalInfo?.github || fallback.personalInfo.github,
                portfolio: parsed.personalInfo?.portfolio || fallback.personalInfo.portfolio,
            },
            summary: cleanSummary || fallback.summary,
            education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education : fallback.education,
            experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience : fallback.experience,
            skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : fallback.skills,
            technicalTools: Array.isArray(parsed.technicalTools) ? parsed.technicalTools : fallback.technicalTools,
            projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : fallback.projects,
            certifications: Array.isArray(parsed.certifications) ? parsed.certifications : fallback.certifications,
            languages: Array.isArray(parsed.languages) ? parsed.languages : fallback.languages,
            achievements: Array.isArray(parsed.achievements) ? parsed.achievements : fallback.achievements,
        };
    }
    catch {
        return fallback;
    }
};
exports.refineResumeWithAI = refineResumeWithAI;
/**
 * Analyzes resume gaps against target career.
 */
const analyzeResumeGapsWithAI = async (resume, targetCareer, targetRoleLevel, timelineMonths, weeklyHours, rawText) => {
    const { apiUrl, apiKey, model } = getAIConfig();
    const fallback = (0, exports.generateDomainAnalysisFallback)(resume, targetCareer, targetRoleLevel, timelineMonths);
    if (!apiUrl || !apiKey)
        return fallback;
    const fullExperienceText = resume.experience && resume.experience.length > 0
        ? resume.experience
            .map((e) => `• ${e.role} at ${e.company} (${e.startDate || ""} - ${e.endDate || (e.current ? "Present" : "")})\n  Description: ${e.description || "N/A"}\n  Achievements: ${e.achievements?.join("; ") || "N/A"}`)
            .join("\n\n")
        : "No formal employment listed";
    const fullProjectsText = resume.projects && resume.projects.length > 0
        ? resume.projects
            .map((p) => `• Project: ${p.name}\n  Description: ${p.description || "N/A"}\n  Tech Stack: ${p.technologies?.join(", ") || "N/A"}${p.link ? `\n  Link: ${p.link}` : ""}`)
            .join("\n\n")
        : "No personal projects listed";
    const fullEducationText = resume.education && resume.education.length > 0
        ? resume.education
            .map((edu) => `• ${edu.degree} in ${edu.fieldOfStudy || "General Studies"} — ${edu.institution} (${edu.startDate || ""} - ${edu.endDate || ""})`)
            .join("\n")
        : "No education listed";
    const fullCertificationsText = resume.certifications && resume.certifications.length > 0
        ? resume.certifications
            .map((c) => `• ${c.name} (Issued by ${c.issuer || "Accredited Provider"})`)
            .join("\n")
        : "No certifications listed";
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: RESUME_SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `Analyze this complete resume comprehensively for target career "${targetCareer}" (${targetRoleLevel} level, ${timelineMonths} months timeline, ${weeklyHours} hrs/week).

CRITICAL INSTRUCTION: Analyze the WHOLE resume comprehensively. Evaluate all their verified skills, tools, full work experience, completed projects, education, and credentials against modern market expectations for a ${targetCareer}.

Candidate: ${resume.personalInfo?.fullName || "Candidate"}
Professional Summary: ${resume.summary || "N/A"}

Verified Skills & Tools:
${resume.skills.join(", ")}
${resume.technicalTools && resume.technicalTools.length > 0 ? `Tools: ${resume.technicalTools.join(", ")}` : ""}

Full Work Experience History:
${fullExperienceText}

Projects & Portfolio:
${fullProjectsText}

Education & Academic Background:
${fullEducationText}

Certifications & Credentials:
${fullCertificationsText}

${rawText ? `Raw Document Excerpt:\n${rawText.slice(0, 15000)}` : ""}

Generate a deep, holistic gap analysis. Return JSON with:
- strengths: string[] (Specific strengths from their actual experience, projects, tools, or education)
- existingDemonstratedSkills: string[] (Skills they genuinely possess that directly apply to ${targetCareer})
- skillsNeedingImprovement: string[] (Skills they have touched on that need deeper production-level mastery)
- skillGaps: Array<{ skill: string, category: "technical"|"tool"|"soft"|"domain", priority: "high"|"medium"|"low", reason: string }>
- experienceGaps: string[] (Practical gaps in real-world systems, architectures, or scale they haven't operated yet)
- portfolioRecommendations: string[] (Exact capstone projects tailored to elevate their current background)
- certificationRecommendations: string[] (Target certifications suited to their trajectory)
- readinessAssessment: { score: number (0-100), criteriaExplanation: string, summary: string, recommendedFocusAreas: string[] }`,
                    },
                ],
            }),
            signal: AbortSignal.timeout(25000),
        });
        if (!response.ok)
            return fallback;
        const data = (await response.json());
        const content = data.choices?.[0]?.message?.content;
        if (!content)
            return fallback;
        const parsed = JSON.parse(content);
        const rawGaps = Array.isArray(parsed.skillGaps) ? parsed.skillGaps : fallback.skillGaps;
        const sanitizedGaps = rawGaps.map((g) => {
            const rawCat = String(g?.category || "technical").toLowerCase();
            const category = ["technical", "tool", "soft", "domain"].includes(rawCat) ? rawCat : "technical";
            const rawPri = String(g?.priority || "high").toLowerCase();
            const priority = ["high", "medium", "low"].includes(rawPri) ? rawPri : "medium";
            return {
                skill: String(g?.skill || "Technical Competency"),
                category,
                priority,
                reason: String(g?.reason || ""),
            };
        });
        return {
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : fallback.strengths,
            existingDemonstratedSkills: Array.isArray(parsed.existingDemonstratedSkills) ? parsed.existingDemonstratedSkills.map(String) : fallback.existingDemonstratedSkills,
            skillsNeedingImprovement: Array.isArray(parsed.skillsNeedingImprovement) ? parsed.skillsNeedingImprovement.map(String) : fallback.skillsNeedingImprovement,
            skillGaps: sanitizedGaps,
            experienceGaps: Array.isArray(parsed.experienceGaps) ? parsed.experienceGaps.map(String) : fallback.experienceGaps,
            portfolioRecommendations: Array.isArray(parsed.portfolioRecommendations) ? parsed.portfolioRecommendations.map(String) : fallback.portfolioRecommendations,
            certificationRecommendations: Array.isArray(parsed.certificationRecommendations) ? parsed.certificationRecommendations.map(String) : fallback.certificationRecommendations,
            readinessAssessment: {
                score: typeof parsed.readinessAssessment?.score === "number" ? Math.min(100, Math.max(0, parsed.readinessAssessment.score)) : fallback.readinessAssessment.score,
                criteriaExplanation: String(parsed.readinessAssessment?.criteriaExplanation || fallback.readinessAssessment.criteriaExplanation),
                summary: String(parsed.readinessAssessment?.summary || fallback.readinessAssessment.summary),
                recommendedFocusAreas: Array.isArray(parsed.readinessAssessment?.recommendedFocusAreas) ? parsed.readinessAssessment.recommendedFocusAreas.map(String) : fallback.readinessAssessment.recommendedFocusAreas,
            },
        };
    }
    catch {
        return fallback;
    }
};
exports.analyzeResumeGapsWithAI = analyzeResumeGapsWithAI;
/**
 * Generates personalized multi-phase roadmap for target career.
 */
const generateRoadmapWithAI = async (resume, analysis, targetCareer, timelineMonths, weeklyHours, rawText) => {
    const { apiUrl, apiKey, model } = getAIConfig();
    const fallback = (0, exports.generateDomainRoadmapFallback)(targetCareer, timelineMonths);
    if (!apiUrl || !apiKey)
        return fallback;
    const experienceSummary = resume.experience && resume.experience.length > 0
        ? resume.experience.map((e) => `${e.role} at ${e.company} (${e.description || ""})`).join("; ")
        : "No previous formal role";
    const projectsSummary = resume.projects && resume.projects.length > 0
        ? resume.projects.map((p) => `${p.name} (${p.technologies?.join(", ") || ""})`).join("; ")
        : "No personal projects";
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                temperature: 0.25,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: RESUME_SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `Generate a personalized ${timelineMonths}-month development roadmap for target role "${targetCareer}" (${weeklyHours} hrs/week).
Build directly upon their existing background so they do not start from scratch:
- Current verified skills: ${resume.skills.join(", ")}
- Prior Experience: ${experienceSummary}
- Completed Projects: ${projectsSummary}
- Identified Gaps: ${analysis.skillGaps.map((g) => g.skill).join(", ")}
- Recommended Capstones: ${analysis.portfolioRecommendations.join("; ")}
- Recommended Certifications: ${analysis.certificationRecommendations.join("; ")}

Organize into 4 chronological phases:
Phase 1: Foundations & Core Tools
Phase 2: Applied Architecture & Production Systems
Phase 3: Portfolio Capstones & Proof of Work
Phase 4: ATS Optimization & Interview Readiness

Return JSON with:
- phases: Array<{ phaseNumber, title, description, durationWeeks, milestoneCount }>
- milestones: Array<{ phaseNumber, phaseTitle, title, description, category ("technical"|"project"|"certification"|"portfolio"|"interview"), requiredSkills[], learningObjectives[], recommendedResources: Array<{ title, url, type, provider }>, practicalActivities[], expectedDeliverable, estimatedDurationWeeks, priority ("high"|"medium"|"low"), dependencies[], completionCriteria }>`,
                    },
                ],
            }),
            signal: AbortSignal.timeout(25000),
        });
        if (!response.ok)
            return fallback;
        const data = (await response.json());
        const content = data.choices?.[0]?.message?.content;
        if (!content)
            return fallback;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.milestones) && parsed.milestones.length >= 4) {
            const sanitizedMilestones = parsed.milestones.map((m, idx) => {
                const rawCat = String(m?.category || "technical").toLowerCase();
                const category = ["technical", "soft", "project", "certification", "portfolio", "interview"].includes(rawCat)
                    ? rawCat
                    : "technical";
                const rawPri = String(m?.priority || "medium").toLowerCase();
                const priority = ["high", "medium", "low"].includes(rawPri) ? rawPri : "medium";
                const duration = parseInt(String(m?.estimatedDurationWeeks), 10);
                const estimatedDurationWeeks = isNaN(duration) || duration <= 0 ? 2 : duration;
                const phaseNum = parseInt(String(m?.phaseNumber), 10) || Math.min(4, Math.floor(idx / 2) + 1);
                const resources = Array.isArray(m?.recommendedResources)
                    ? m.recommendedResources.map((r) => {
                        const rawType = String(r?.type || "course").toLowerCase();
                        const type = ["course", "documentation", "tutorial", "book", "lab"].includes(rawType)
                            ? rawType
                            : "course";
                        return {
                            title: String(r?.title || "Curated Guide"),
                            url: String(r?.url || ""),
                            type,
                            provider: String(r?.provider || ""),
                            badge: String(r?.badge || ""),
                        };
                    })
                    : [];
                return {
                    phaseNumber: phaseNum,
                    phaseTitle: String(m?.phaseTitle || `Phase ${phaseNum}`),
                    title: String(m?.title || "Career Milestone"),
                    description: String(m?.description || "Milestone description"),
                    category,
                    requiredSkills: Array.isArray(m?.requiredSkills) ? m.requiredSkills.map(String) : [],
                    learningObjectives: Array.isArray(m?.learningObjectives) ? m.learningObjectives.map(String) : [],
                    recommendedResources: resources,
                    practicalActivities: Array.isArray(m?.practicalActivities) ? m.practicalActivities.map(String) : [],
                    expectedDeliverable: String(m?.expectedDeliverable || "Milestone deliverable"),
                    estimatedDurationWeeks,
                    priority,
                    dependencies: Array.isArray(m?.dependencies) ? m.dependencies.map(String) : [],
                    completionCriteria: String(m?.completionCriteria || "Complete deliverable successfully"),
                };
            });
            return {
                phases: Array.isArray(parsed.phases) && parsed.phases.length > 0 ? parsed.phases : fallback.phases,
                milestones: sanitizedMilestones,
            };
        }
        return fallback;
    }
    catch {
        return fallback;
    }
};
exports.generateRoadmapWithAI = generateRoadmapWithAI;
/**
 * Builds projected future resume (3m, 6m, 12m) by combining current verified data
 * with planned roadmap deliverables and tagging them strictly as planned.
 */
const projectFutureResume = (currentResume, targetCareer, timelineMonths, milestones) => {
    const plannedAchievements = [];
    // Filter milestones belonging to this timeline window
    const targetWeeks = timelineMonths * 4.3;
    let accumulatedWeeks = 0;
    const applicableMilestones = milestones.filter((m) => {
        accumulatedWeeks += m.estimatedDurationWeeks || 2;
        return accumulatedWeeks <= targetWeeks;
    });
    // Planned skills to integrate
    const plannedSkills = new Set();
    applicableMilestones.forEach((m) => {
        m.requiredSkills.forEach((s) => plannedSkills.add(s));
    });
    // Planned projects to integrate
    const plannedProjects = [];
    applicableMilestones
        .filter((m) => m.category === "project" || m.category === "portfolio")
        .slice(0, timelineMonths === 3 ? 1 : timelineMonths === 6 ? 2 : 3)
        .forEach((m) => {
        plannedProjects.push({
            name: `${m.title} (Planned Project)`,
            description: `Planned ${targetCareer} project deliverable: ${m.expectedDeliverable}`,
            technologies: m.requiredSkills,
            isPlanned: true,
            highlights: m.practicalActivities.slice(0, 2),
        });
        plannedAchievements.push({
            title: m.title,
            category: "Project",
            plannedOrAchieved: "planned",
            monthTarget: Math.min(timelineMonths, Math.ceil((m.phaseNumber / 4) * timelineMonths)),
            description: m.expectedDeliverable,
        });
    });
    // Planned certifications to integrate
    const plannedCertifications = [];
    applicableMilestones
        .filter((m) => m.category === "certification")
        .forEach((m) => {
        plannedCertifications.push({
            name: `${m.title} (Planned)`,
            issuer: "Industry Standard Certification",
            isPlanned: true,
        });
        plannedAchievements.push({
            title: m.title,
            category: "Certification",
            plannedOrAchieved: "planned",
            monthTarget: timelineMonths,
            description: m.description,
        });
    });
    // Ensure all applicable milestones for this horizon are tracked as planned achievements
    applicableMilestones.forEach((m) => {
        const exists = plannedAchievements.some((a) => a.title === m.title);
        if (!exists) {
            plannedAchievements.push({
                title: m.title,
                category: m.category ? m.category.charAt(0).toUpperCase() + m.category.slice(1) : "Technical Skill",
                plannedOrAchieved: "planned",
                monthTarget: Math.min(timelineMonths, Math.max(1, Math.ceil((m.phaseNumber / 4) * timelineMonths))),
                description: m.description,
            });
        }
    });
    const projectedSkills = Array.from(new Set([...currentResume.skills, ...Array.from(plannedSkills)]));
    const projectedTools = Array.from(new Set([...currentResume.technicalTools, ...Array.from(plannedSkills).filter((s) => s.length < 15)]));
    const projectedContent = {
        personalInfo: { ...currentResume.personalInfo },
        summary: `Targeted ${targetCareer} with solid background in ${currentResume.skills.slice(0, 3).join(", ")}. Projected with planned proficiency in ${Array.from(plannedSkills).slice(0, 3).join(", ")} and completed production capstones. (Projected +${timelineMonths} Months Profile).`,
        education: [...currentResume.education],
        experience: [...currentResume.experience],
        skills: projectedSkills,
        technicalTools: projectedTools,
        projects: [...currentResume.projects, ...plannedProjects],
        certifications: [...currentResume.certifications, ...plannedCertifications],
        languages: currentResume.languages || ["English"],
        achievements: currentResume.achievements || [],
    };
    let foundationsGuide;
    let remainingSkillsAndProjects;
    let interviewMastery;
    if (timelineMonths === 3) {
        foundationsGuide = (0, resumeHorizonGenerators_1.generateFoundationsGuide)(targetCareer, currentResume, milestones);
    }
    else if (timelineMonths === 6) {
        remainingSkillsAndProjects = (0, resumeHorizonGenerators_1.generateRemainingSkillsAndProjects)(targetCareer, currentResume, milestones);
    }
    else if (timelineMonths === 12) {
        interviewMastery = (0, resumeHorizonGenerators_1.generateInterviewMastery)(targetCareer, currentResume, milestones);
    }
    return {
        projectedContent,
        plannedAchievements,
        foundationsGuide,
        remainingSkillsAndProjects,
        interviewMastery,
    };
};
exports.projectFutureResume = projectFutureResume;
// ==================== DOMAIN FALLBACK GENERATORS ====================
const generateDomainAnalysisFallback = (resume, targetCareer, roleLevel, timelineMonths) => {
    const lowerCareer = targetCareer.toLowerCase();
    let domainSkills = ["Git", "REST APIs", "System Design", "Agile", "Testing"];
    let expGaps = ["Production deployment experience", "High-concurrency systems"];
    let certRecs = ["Industry Standard Associate Certification"];
    if (lowerCareer.includes("cloud") || lowerCareer.includes("devops")) {
        domainSkills = ["Docker", "Kubernetes", "Terraform", "AWS (EC2, S3, IAM, VPC)", "CI/CD", "Linux", "Prometheus"];
        expGaps = ["Multi-environment infrastructure automation", "Kubernetes cluster management"];
        certRecs = ["AWS Certified Solutions Architect", "CKA (Certified Kubernetes Administrator)", "HashiCorp Terraform Associate"];
    }
    else if (lowerCareer.includes("cyber") || lowerCareer.includes("security")) {
        domainSkills = ["Network Protocols (TCP/IP)", "Wireshark", "Burp Suite", "OWASP Top 10", "SIEM (Splunk)", "Linux Hardening"];
        expGaps = ["Hands-on vulnerability remediation reports", "SOC incident triage simulation"];
        certRecs = ["CompTIA Security+", "eJPT (eLearnSecurity Junior Penetration Tester)", "BTL1"];
    }
    else if (lowerCareer.includes("java")) {
        domainSkills = ["Core Java 21", "Spring Boot 3", "Spring Security", "Hibernate/JPA", "PostgreSQL", "Kafka", "Docker", "JUnit/Mockito"];
        expGaps = ["Distributed microservices transaction handling", "Virtual Threads concurrency tuning"];
        certRecs = ["Oracle Certified Professional: Java SE 21 Developer", "Spring Professional Certification"];
    }
    else if (lowerCareer.includes("data") || lowerCareer.includes("ai") || lowerCareer.includes("machine learning")) {
        domainSkills = ["Python (NumPy, Pandas)", "SQL", "Scikit-Learn", "PyTorch", "FastAPI", "RAG with Vector DBs", "Docker"];
        expGaps = ["End-to-end model serving pipeline", "Quantitative evaluation metrics in production"];
        certRecs = ["DeepLearning.AI Machine Learning Specialization", "AWS Certified Machine Learning - Specialty"];
    }
    else if (lowerCareer.includes("mobile") || lowerCareer.includes("flutter")) {
        domainSkills = ["Flutter", "Dart", "BLoC/Provider", "REST Integration", "Offline SQLite", "Push Notifications", "App Store Publishing"];
        expGaps = ["Live production apps published on Google Play or Apple App Store", "Native platform channel integration"];
        certRecs = ["Google Associate Android Developer", "Meta React Native Specialization"];
    }
    else if (lowerCareer.includes("design") || lowerCareer.includes("ui") || lowerCareer.includes("ux")) {
        domainSkills = ["Figma (Auto-layout, Components)", "Design Systems", "User Research", "Wireframing", "Clickable Prototypes", "Usability Testing"];
        expGaps = ["Documented case study with before/after user validation data", "Developer design tokens handoff"];
        certRecs = ["Google UX Design Professional Certificate", "Nielsen Norman Group UX Master"];
    }
    const demonstrated = resume.skills.filter((s) => domainSkills.some((ds) => ds.toLowerCase().includes(s.toLowerCase())));
    const missing = domainSkills.filter((ds) => !resume.skills.some((s) => s.toLowerCase().includes(ds.toLowerCase())));
    const skillGaps = missing.map((s, idx) => ({
        skill: s,
        category: "technical",
        priority: idx < 3 ? "high" : idx < 6 ? "medium" : "low",
        reason: `Essential prerequisite competency for ${roleLevel} ${targetCareer} candidates.`,
    }));
    return {
        strengths: [
            `Demonstrated foundational knowledge in ${resume.skills.slice(0, 3).join(", ") || "core academic concepts"}.`,
            `Documented education with structured technical exposure.`,
            `Clear commitment to upskilling toward ${targetCareer}.`,
        ],
        existingDemonstratedSkills: demonstrated.length > 0 ? demonstrated : [resume.skills[0] || "Foundational Problem Solving"],
        skillsNeedingImprovement: demonstrated.slice(0, 2),
        skillGaps,
        experienceGaps: expGaps,
        portfolioRecommendations: [
            `Build 2 production-grade, deployed capstones demonstrating end-to-end ${targetCareer} workflows.`,
            `Publish clean GitHub repositories with architecture diagrams and live demo links.`,
        ],
        certificationRecommendations: certRecs,
        readinessAssessment: {
            score: Math.min(85, Math.max(35, 40 + demonstrated.length * 8)),
            criteriaExplanation: `Readiness is evaluated across 4 pillars: Verified Core Skills (${demonstrated.length}/${domainSkills.length}), Documented Project Deliverables, Target Career Alignment, and Market Assessment standards.`,
            summary: `Candidate has strong baseline capabilities. Reaching target readiness in ${timelineMonths} months requires executing focused technical milestones and building verifiable proof of work.`,
            recommendedFocusAreas: missing.slice(0, 3),
        },
    };
};
exports.generateDomainAnalysisFallback = generateDomainAnalysisFallback;
const generateDomainRoadmapFallback = (targetCareer, timelineMonths) => {
    const lower = targetCareer.toLowerCase();
    const weeksPerPhase = Math.max(2, Math.round((timelineMonths * 4.3) / 4));
    if (lower.includes("cloud") || lower.includes("devops")) {
        return {
            phases: [
                { phaseNumber: 1, title: "Phase 1: Linux Kernel, Shell & Cloud Foundations", description: "Master Linux system administration, Bash automation, TCP/IP, and AWS core compute.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
                { phaseNumber: 2, title: "Phase 2: Docker Containers & Kubernetes Orchestration", description: "Multi-stage Docker builds, image security, K8s Pods, Deployments, and Helm charts.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
                { phaseNumber: 3, title: "Phase 3: Infrastructure as Code & GitOps Capstone", description: "Automated Terraform VPC/EKS provisioning, GitHub Actions CI/CD pipelines, and ArgoCD.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
                { phaseNumber: 4, title: "Phase 4: Telemetry, Certifications & Interview Prep", description: "Prometheus & Grafana observability, AWS Solutions Architect prep, and system troubleshooting.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
            ],
            milestones: [
                {
                    phaseNumber: 1,
                    phaseTitle: "Phase 1: Linux Kernel, Shell & Cloud Foundations",
                    title: "Linux Server Administration & Bash Automation",
                    description: "Configure secure Ubuntu/RHEL servers, systemd services, SSH key pairs, and automate backup pipelines with Bash scripts.",
                    category: "technical",
                    requiredSkills: ["Linux", "Bash", "SSH", "Networking"],
                    learningObjectives: ["Manage user permissions and systemd services", "Write automated bash cron tasks"],
                    recommendedResources: [{ title: "Linux Foundation LFS101x", url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux", type: "course", provider: "Linux Foundation" }],
                    practicalActivities: ["Set up a local Linux VM and write a system health monitor script"],
                    expectedDeliverable: "Automated bash system health check and alerting script on GitHub",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "high",
                    dependencies: [],
                    completionCriteria: "Script monitors CPU, memory, and disk space with verified exit codes.",
                },
                {
                    phaseNumber: 1,
                    phaseTitle: "Phase 1: Linux Kernel, Shell & Cloud Foundations",
                    title: "AWS Core Architecture & IAM Security",
                    description: "Provision EC2 instances, S3 storage buckets, VPC subnets, and configure least-privilege IAM policies.",
                    category: "technical",
                    requiredSkills: ["AWS EC2", "AWS S3", "IAM", "VPC"],
                    learningObjectives: ["Architect a secure multi-tier VPC network with public and private subnets"],
                    recommendedResources: [{ title: "AWS Skill Builder Solutions Architect", url: "https://explore.skillbuilder.aws/", type: "course", provider: "AWS Official" }],
                    practicalActivities: ["Deploy a hardened Nginx web server inside an isolated private subnet behind an ALB"],
                    expectedDeliverable: "VPC architecture diagram and running EC2 cluster with strict IAM roles",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "high",
                    dependencies: ["Linux Server Administration & Bash Automation"],
                    completionCriteria: "Secure web server reachable only through load balancer with zero direct public SSH exposure.",
                },
                {
                    phaseNumber: 2,
                    phaseTitle: "Phase 2: Docker Containers & Kubernetes Orchestration",
                    title: "Multi-Stage Docker Packaging & Microservice Hardening",
                    description: "Containerize web applications with multi-stage Dockerfiles, non-root users, and minimal Alpine/distroless base images.",
                    category: "technical",
                    requiredSkills: ["Docker", "Docker Compose", "Container Security"],
                    learningObjectives: ["Reduce container image size by >60% using multi-stage builds"],
                    recommendedResources: [{ title: "Docker & Kubernetes Full Course", url: "https://www.freecodecamp.org/news/kubernetes-course/", type: "course", provider: "freeCodeCamp" }],
                    practicalActivities: ["Build and benchmark a 3-tier microservice stack with Docker Compose"],
                    expectedDeliverable: "Docker Compose multi-tier repository with automated vulnerability scanning",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "high",
                    dependencies: ["AWS Core Architecture & IAM Security"],
                    completionCriteria: "Trivy vulnerability scan passes with zero critical CVEs.",
                },
                {
                    phaseNumber: 2,
                    phaseTitle: "Phase 2: Docker Containers & Kubernetes Orchestration",
                    title: "Kubernetes Cluster Deployment & Helm Packaging",
                    description: "Deploy microservices onto Kubernetes with Deployments, Services, ConfigMaps, Secrets, Ingress, and Helm charts.",
                    category: "project",
                    requiredSkills: ["Kubernetes", "Helm", "kubectl", "Ingress"],
                    learningObjectives: ["Implement zero-downtime rolling updates and liveness/readiness probes"],
                    recommendedResources: [{ title: "Kubernetes Official Docs & Interactive Tutorials", url: "https://kubernetes.io/docs/tutorials/", type: "documentation", provider: "CNCF" }],
                    practicalActivities: ["Package a full web application into a reusable Helm chart and simulate pod failure recovery"],
                    expectedDeliverable: "Tested Helm chart repository with ingress TLS termination",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "high",
                    dependencies: ["Multi-Stage Docker Packaging & Microservice Hardening"],
                    completionCriteria: "Application sustains traffic during automated rolling restart with 100% uptime.",
                },
                {
                    phaseNumber: 3,
                    phaseTitle: "Phase 3: Infrastructure as Code & GitOps Capstone",
                    title: "Terraform Modular Cloud Infrastructure (AWS / EKS)",
                    description: "Define complete cloud environments as code using reusable Terraform modules with remote state locking.",
                    category: "project",
                    requiredSkills: ["Terraform", "AWS EKS", "Remote State (S3 + DynamoDB)"],
                    learningObjectives: ["Provision production VPC, security groups, and EKS managed node groups declaratively"],
                    recommendedResources: [{ title: "HashiCorp Terraform Associate Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials", type: "tutorial", provider: "HashiCorp" }],
                    practicalActivities: ["Deploy Terraform modules creating VPC, RDS PostgreSQL, and EKS cluster"],
                    expectedDeliverable: "Open-source GitHub repository with clean Terraform modules and architecture diagram",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "high",
                    dependencies: ["Kubernetes Cluster Deployment & Helm Packaging"],
                    completionCriteria: "terraform plan executes with clean idempotency and zero manual AWS console steps.",
                },
                {
                    phaseNumber: 3,
                    phaseTitle: "Phase 3: Infrastructure as Code & GitOps Capstone",
                    title: "End-to-End CI/CD GitOps Pipeline (GitHub Actions & ArgoCD)",
                    description: "Build an automated continuous delivery pipeline that tests code, builds images, and triggers GitOps synchronization.",
                    category: "portfolio",
                    requiredSkills: ["GitHub Actions", "ArgoCD", "GitOps", "Docker Registry"],
                    learningObjectives: ["Achieve automated commit-to-production deployment in under 5 minutes"],
                    recommendedResources: [{ title: "GitOps with ArgoCD Course", url: "https://www.cncf.io/training/", type: "lab", provider: "CNCF" }],
                    practicalActivities: ["Trigger automated test and build on push, with ArgoCD auto-syncing changes to Kubernetes"],
                    expectedDeliverable: "Live running portfolio capstone demonstrating end-to-end GitOps deployment",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "high",
                    dependencies: ["Terraform Modular Cloud Infrastructure (AWS / EKS)"],
                    completionCriteria: "Git commit updates image tag in manifests and triggers zero-downtime deployment verified via ArgoCD dashboard.",
                },
                {
                    phaseNumber: 4,
                    phaseTitle: "Phase 4: Telemetry, Certifications & Interview Prep",
                    title: "Observability Telemetry Stack (Prometheus & Grafana)",
                    description: "Instrument infrastructure with Prometheus metrics scraping, custom Grafana dashboards, and Alertmanager notification rules.",
                    category: "technical",
                    requiredSkills: ["Prometheus", "Grafana", "Alertmanager", "Metrics"],
                    learningObjectives: ["Monitor latency, error rates, CPU/memory saturation, and node health"],
                    recommendedResources: [{ title: "Prometheus Monitoring Guide", url: "https://prometheus.io/docs/introduction/overview/", type: "documentation", provider: "Prometheus.io" }],
                    practicalActivities: ["Set up a Grafana dashboard visualizing request rates, p99 latency, and cluster pod utilization"],
                    expectedDeliverable: "Configured Grafana dashboard JSON export and documented alerting runbook",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "medium",
                    dependencies: ["End-to-End CI/CD GitOps Pipeline (GitHub Actions & ArgoCD)"],
                    completionCriteria: "Dashboard reflects synthetic load test spikes and triggers alerts on error rates exceeding 2%.",
                },
                {
                    phaseNumber: 4,
                    phaseTitle: "Phase 4: Telemetry, Certifications & Interview Prep",
                    title: "AWS Solutions Architect / CKA Certification & Mock Scenarios",
                    description: "Complete certification practice exams and master cloud troubleshooting questions: CrashLoopBackOff, DNS failure, and disaster recovery.",
                    category: "interview",
                    requiredSkills: ["Troubleshooting", "System Architecture", "Interview Cracking"],
                    learningObjectives: ["Master STAR technical interview communication for cloud infrastructure roles"],
                    recommendedResources: [{ title: "AWS Solutions Architect Practice Exams", url: "https://explore.skillbuilder.aws/", type: "course", provider: "AWS" }],
                    practicalActivities: ["Conduct 3 mock technical interviews diagnosing live infrastructure breakdown scenarios"],
                    expectedDeliverable: "ATS-optimized single-column resume with verified capstone links and certification voucher confirmation",
                    estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                    priority: "high",
                    dependencies: ["Observability Telemetry Stack (Prometheus & Grafana)"],
                    completionCriteria: "Pass full-length practice exam with >80% score and complete 5 scenario walk-throughs.",
                },
            ],
        };
    }
    // Default Full-Stack / Software Engineering Roadmap
    return {
        phases: [
            { phaseNumber: 1, title: "Phase 1: Foundations & Core Architecture", description: "Master core programming language, algorithms, data structures, and clean coding principles.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
            { phaseNumber: 2, title: "Phase 2: Backend REST APIs & Database Design", description: "Design relational/NoSQL schemas, implement secure authentication, and build robust CRUD APIs.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
            { phaseNumber: 3, title: "Phase 3: Production Capstone Projects & Deployment", description: "Build 2 full-stack deployed applications with modern frameworks and CI/CD pipelines.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
            { phaseNumber: 4, title: "Phase 4: ATS Resume Optimization & Interview Mastery", description: "Format ATS resume, publish case studies, and crack technical coding and system design interviews.", durationWeeks: weeksPerPhase, milestoneCount: 2 },
        ],
        milestones: [
            {
                phaseNumber: 1,
                phaseTitle: "Phase 1: Foundations & Core Architecture",
                title: "Advanced Core Language Concepts & Data Structures",
                description: "Master OOP principles, memory management, asynchronous concurrency, and solve 40+ medium coding challenges.",
                category: "technical",
                requiredSkills: ["Core Language", "Data Structures", "Algorithms", "Git"],
                learningObjectives: ["Implement custom data structures and analyze time/space complexity"],
                recommendedResources: [{ title: "Data Structures & Algorithms Course", url: "https://www.freecodecamp.org/", type: "course", provider: "freeCodeCamp" }],
                practicalActivities: ["Solve and document 40 LeetCode Easy/Medium problems with clean unit tests"],
                expectedDeliverable: "GitHub repository containing tested algorithm implementations and complexity notes",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: [],
                completionCriteria: "All 40 problem solutions pass automated test suites with documented O(N) complexity.",
            },
            {
                phaseNumber: 1,
                phaseTitle: "Phase 1: Foundations & Core Architecture",
                title: "Git Workflow & Clean Architecture Fundamentals",
                description: "Implement Git branching strategies, semantic versioning, and SOLID object-oriented architecture patterns.",
                category: "technical",
                requiredSkills: ["Git", "GitHub", "SOLID Principles", "Design Patterns"],
                learningObjectives: ["Structure modular applications separating presentation, business, and data access layers"],
                recommendedResources: [{ title: "Refactoring & Design Patterns Guide", url: "https://refactoring.guru/", type: "documentation", provider: "RefactoringGuru" }],
                practicalActivities: ["Refactor a monolithic script into a clean layered architecture with dependency injection"],
                expectedDeliverable: "Clean architecture template repository with documented design patterns",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: ["Advanced Core Language Concepts & Data Structures"],
                completionCriteria: "Code exhibits low coupling, high cohesion, and 90%+ unit test coverage.",
            },
            {
                phaseNumber: 2,
                phaseTitle: "Phase 2: Backend REST APIs & Database Design",
                title: "Database Modeling, Indexing & Query Optimization",
                description: "Design normalized database schemas, write complex queries, manage migrations, and configure indexing.",
                category: "technical",
                requiredSkills: ["SQL / NoSQL", "Indexing", "Transactions", "Migrations"],
                learningObjectives: ["Optimize slow queries from full table scans to index scans (B-Tree)"],
                recommendedResources: [{ title: "Use The Index, Luke (SQL Indexing Guide)", url: "https://use-the-index-luke.com/", type: "tutorial", provider: "Markus Winand" }],
                practicalActivities: ["Design an e-commerce schema handling 100k records and benchmark indexed query latency"],
                expectedDeliverable: "Schema migration scripts and query performance benchmark report",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: ["Git Workflow & Clean Architecture Fundamentals"],
                completionCriteria: "Benchmark proves >75% reduction in query execution time using compound indexes.",
            },
            {
                phaseNumber: 2,
                phaseTitle: "Phase 2: Backend REST APIs & Database Design",
                title: "Production REST API with Authentication & Security",
                description: "Build robust RESTful microservices with JWT/OAuth authentication, role-based access control, and rate limiting.",
                category: "project",
                requiredSkills: ["REST APIs", "JWT", "Security (CORS, Rate Limiting)", "Postman"],
                learningObjectives: ["Protect APIs against OWASP vulnerabilities and implement OpenAPI/Swagger documentation"],
                recommendedResources: [{ title: "OWASP API Security Top 10", url: "https://owasp.org/www-project-api-security/", type: "documentation", provider: "OWASP" }],
                practicalActivities: ["Build a secure backend service with comprehensive Postman test collection"],
                expectedDeliverable: "Deployed API service with interactive Swagger documentation and automated tests",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: ["Database Modeling, Indexing & Query Optimization"],
                completionCriteria: "Passes 100% of integration test assertions with zero unauthorized data leaks.",
            },
            {
                phaseNumber: 3,
                phaseTitle: "Phase 3: Production Capstone Projects & Deployment",
                title: "Full-Stack Production Capstone 1 (SaaS Platform)",
                description: "Build, deploy, and launch a full-featured web application with modern frontend, backend, payments/auth, and database.",
                category: "portfolio",
                requiredSkills: ["Full-Stack Architecture", "State Management", "Docker", "Cloud Hosting"],
                learningObjectives: ["Deliver a responsive, accessible user experience integrated with secure backend APIs"],
                recommendedResources: [{ title: "Full Stack Open", url: "https://fullstackopen.com/en/", type: "course", provider: "Univ. of Helsinki" }],
                practicalActivities: ["Develop and deploy full application to Vercel/Render with automated CI/CD"],
                expectedDeliverable: "Live running public web application with GitHub repository and README demo GIF",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: ["Production REST API with Authentication & Security"],
                completionCriteria: "Application is publicly accessible, mobile-responsive, and achieves >90 Lighthouse performance score.",
            },
            {
                phaseNumber: 3,
                phaseTitle: "Phase 3: Production Capstone Projects & Deployment",
                title: "Full-Stack Production Capstone 2 (Real-Time System)",
                description: "Architect a real-time collaborative application using WebSockets/event streaming, caching, and background jobs.",
                category: "portfolio",
                requiredSkills: ["WebSockets / Streaming", "Redis Caching", "Background Workers"],
                learningObjectives: ["Handle concurrent real-time client events with low latency"],
                recommendedResources: [{ title: "Real-Time Systems Architecture Guide", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API", type: "documentation", provider: "MDN" }],
                practicalActivities: ["Implement real-time collaboration or live dashboard with sub-50ms message latency"],
                expectedDeliverable: "Live deployed real-time application with documented architecture blueprint",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: ["Full-Stack Production Capstone 1 (SaaS Platform)"],
                completionCriteria: "Multi-user concurrency test verifies instantaneous updates without message loss.",
            },
            {
                phaseNumber: 4,
                phaseTitle: "Phase 4: ATS Resume Optimization & Interview Mastery",
                title: "ATS-Optimized Resume Overhaul & Portfolio Showcase",
                description: "Transform your resume using the STAR method (Situation, Task, Action, Result) with quantifiable impact metrics.",
                category: "portfolio",
                requiredSkills: ["ATS Formatting", "STAR Method", "Portfolio Presentation"],
                learningObjectives: ["Format a 1-page single-column ATS resume scoring >85 on recruiter screening parsers"],
                recommendedResources: [{ title: "Technical Resume & Portfolio Handbook", url: "https://www.freecodecamp.org/news/how-to-write-a-good-resume-in-tech/", type: "tutorial", provider: "freeCodeCamp" }],
                practicalActivities: ["Rewrite all project and experience bullets to lead with action verbs and metrics"],
                expectedDeliverable: "Polished PDF resume and live portfolio website showcasing verified deliverables",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: ["Full-Stack Production Capstone 2 (Real-Time System)"],
                completionCriteria: "Resume accurately documents all completed capstones with verified live URLs.",
            },
            {
                phaseNumber: 4,
                phaseTitle: "Phase 4: ATS Resume Optimization & Interview Mastery",
                title: "Technical Mock Interviews & System Design Preparation",
                description: "Practice behavioral STAR questions, live coding rounds, and system design architecture questions for ${targetCareer}.",
                category: "interview",
                requiredSkills: ["System Design", "Behavioral STAR", "Mock Interviews"],
                learningObjectives: ["Articulate architectural trade-offs with confidence during 45-minute technical interviews"],
                recommendedResources: [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "documentation", provider: "GitHub" }],
                practicalActivities: ["Complete 5 timed system design diagrams and record mock interview responses"],
                expectedDeliverable: "Documented interview preparation cheatsheet and recorded technical walk-through",
                estimatedDurationWeeks: Math.ceil(weeksPerPhase / 2),
                priority: "high",
                dependencies: ["ATS-Optimized Resume Overhaul & Portfolio Showcase"],
                completionCriteria: "Successfully complete 3 mock interviews answering core architectural trade-offs.",
            },
        ],
    };
};
exports.generateDomainRoadmapFallback = generateDomainRoadmapFallback;
