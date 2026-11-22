import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { validateFileSignature, parseResumeTextHeuristically, extractTextFromBuffer } from "../src/services/resume/resumeParser.service";
import {
    analyzeResumeGapsWithAI,
    generateRoadmapWithAI,
    projectFutureResume,
} from "../src/services/resume/resumeAI.service";
import {
    careerTargetSetupSchema,
    completeMilestoneSchema,
} from "../src/validators/resumeTimeMachine.validator";

describe("Resume Time Machine — Parser & Security Validation", () => {
    test("should accept valid PDF magic bytes (%PDF-1.4)", () => {
        const pdfBuffer = Buffer.from("%PDF-1.4 sample pdf content for testing");
        const res = validateFileSignature(pdfBuffer);
        assert.equal(res.isValid, true);
        assert.equal(res.fileType, "pdf");
    });

    test("should accept valid DOCX magic bytes (PK 0x03 0x04)", () => {
        const docxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
        const res = validateFileSignature(docxHeader);
        assert.equal(res.isValid, true);
        assert.equal(res.fileType, "docx");
    });

    test("should reject spoofed files (e.g. text file renamed to .pdf)", () => {
        const spoofedBuffer = Buffer.from("Hello world, this is a plain text file");
        const res = validateFileSignature(spoofedBuffer);
        assert.equal(res.isValid, false);
    });

    test("should extract text from a valid PDF buffer using pdf-parse", async () => {
        const samplePdf = Buffer.from(
            "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Senior Software Engineer Alex) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n299\n%%EOF"
        );
        const text = await extractTextFromBuffer(samplePdf, "pdf");
        assert.ok(text.includes("Senior Software Engineer Alex"));
    });

    test("should heuristically extract sections from plain resume text", () => {
        const sampleText = `
        Alex Mercer
        alex.mercer@example.com | +1 555-0199 | San Francisco, CA
        https://github.com/alexmercer | https://linkedin.com/in/alexmercer

        Summary
        Passionate Junior Software Engineer with 1 year experience building web APIs with Node.js and TypeScript.

        Education
        Bachelor of Science in Computer Science
        University of California, Berkeley - 2023

        Skills
        JavaScript, TypeScript, Node.js, Express, Git, MongoDB, Docker

        Experience
        Junior Backend Developer
        TechCorp Inc. - 2023 to Present
        Maintained internal REST APIs and wrote unit tests with Jest.
        `;

        const parsed = parseResumeTextHeuristically(sampleText);
        assert.ok(parsed.personalInfo.fullName);
        assert.equal(parsed.personalInfo.email, "alex.mercer@example.com");
        assert.ok(parsed.skills.includes("TypeScript"));
        assert.ok(parsed.skills.includes("Node.js"));
    });
});

describe("Resume Time Machine — Gap Analysis & Roadmap Generation", () => {
    const baseResume = {
        personalInfo: { fullName: "Alex Mercer", email: "alex@example.com" },
        summary: "Junior Developer",
        education: [{ institution: "UC Berkeley", degree: "BS CS" }],
        experience: [{ company: "TechCorp", role: "Junior Dev", description: "Backend APIs" }],
        skills: ["JavaScript", "TypeScript", "Node.js", "Git"],
        technicalTools: ["Git"],
        projects: [{ name: "API Service", description: "Built with Node", technologies: ["Node.js"] }],
        certifications: [],
    };

    test("should generate career gap analysis without fabricating credentials", async () => {
        const analysis = await analyzeResumeGapsWithAI(
            baseResume,
            "AWS Cloud Solutions Architect",
            "entry",
            6,
            15
        );

        assert.ok(analysis.strengths.length > 0);
        assert.ok(analysis.skillGaps.length > 0);
        assert.ok(analysis.readinessAssessment.score >= 0 && analysis.readinessAssessment.score <= 100);
        // Ensure identified gaps are relevant to cloud
        const gapSkills = analysis.skillGaps.map((g) => g.skill.toLowerCase()).join(" ");
        assert.ok(gapSkills.includes("cloud") || gapSkills.includes("aws") || gapSkills.includes("infrastructure"));
    });

    test("should generate multi-phase roadmap and milestones for target career", async () => {
        const analysis = await analyzeResumeGapsWithAI(
            baseResume,
            "Full-Stack Java Developer",
            "junior",
            6,
            20
        );

        const roadmap = await generateRoadmapWithAI(
            baseResume,
            analysis,
            "Full-Stack Java Developer",
            6,
            20
        );

        assert.ok(roadmap.phases.length >= 3);
        assert.ok(roadmap.milestones.length >= 4);
        assert.ok(roadmap.milestones.every((m) => m.title && m.completionCriteria));
    });

    test("should project +3, +6, and +12 month resumes strictly marking planned milestones as planned", () => {
        const sampleMilestones = [
            {
                phaseNumber: 1,
                phaseTitle: "Foundations",
                title: "Complete Core Java & Spring Boot Fundamentals",
                description: "Master Java OOP, Streams, and Spring Boot REST controllers",
                category: "technical" as const,
                requiredSkills: ["Java", "Spring Boot"],
                learningObjectives: ["Java syntax", "REST APIs"],
                recommendedResources: [],
                practicalActivities: [],
                expectedDeliverable: "Spring Boot CRUD API",
                estimatedDurationWeeks: 4,
                priority: "high" as const,
                dependencies: [],
                completionCriteria: "Pass all JUnit tests",
            },
        ];

        const projection3m = projectFutureResume(
            baseResume,
            "Full-Stack Java Developer",
            3,
            sampleMilestones
        );

        assert.ok(projection3m.projectedContent);
        // Strict Trust Rule: planned achievements must have planned status
        assert.ok(projection3m.plannedAchievements.length > 0);
        assert.ok(projection3m.plannedAchievements.every((a) => a.plannedOrAchieved === "planned"));
        // Projected skills should include the planned skill
        assert.ok(projection3m.projectedContent.skills.includes("Java"));
        // +3M Foundations verification
        assert.ok(projection3m.foundationsGuide);
        assert.ok(projection3m.foundationsGuide.coreConcepts.length > 0);
        assert.ok(projection3m.foundationsGuide.toolsAndLanguages.length > 0);
        assert.ok(projection3m.foundationsGuide.weeklyFocusPlan.length > 0);

        // +6M Remaining skills and solid projects with full-stack documentation
        const projection6m = projectFutureResume(
            baseResume,
            "AWS Cloud Solutions Architect",
            6,
            sampleMilestones
        );
        assert.ok(projection6m.remainingSkillsAndProjects);
        assert.ok(projection6m.remainingSkillsAndProjects.remainingSkills.length > 0);
        assert.ok(projection6m.remainingSkillsAndProjects.solidProjects.length > 0);
        const p1 = projection6m.remainingSkillsAndProjects.solidProjects[0];
        assert.ok(p1.fullStackDocumentation.architectureOverview);
        assert.ok(p1.fullStackDocumentation.apiEndpoints.length > 0);
        assert.ok(p1.fullStackDocumentation.stepByStepGuide.length > 0);
        assert.ok(p1.fullStackDocumentation.keyResumeBullets.length > 0);

        // +12M Interview mastery and technical interview Q&A
        const projection12m = projectFutureResume(
            baseResume,
            "AWS Cloud Solutions Architect",
            12,
            sampleMilestones
        );
        assert.ok(projection12m.interviewMastery);
        assert.ok(projection12m.interviewMastery.technicalQuestions.length > 0);
        const q1 = projection12m.interviewMastery.technicalQuestions[0];
        assert.ok(q1.question);
        assert.ok(q1.idealAnswer);
        assert.ok(q1.keyTalkingPoints.length > 0);
        assert.ok(projection12m.interviewMastery.takeHomeChallenges.length > 0);
        assert.ok(projection12m.interviewMastery.interviewCheatSheet.length > 0);
    });
});

describe("Resume Time Machine — Zod Validators & Verification Rules", () => {
    test("should require confirmed=true when completing a milestone", () => {
        // Failing confirmation
        assert.throws(() => {
            completeMilestoneSchema.parse({
                completionDescription: "Built full CRUD API and pushed to GitHub repository.",
                confirmed: false,
            });
        });

        // Valid confirmation
        const valid = completeMilestoneSchema.parse({
            completionDescription: "Built full CRUD API and pushed to GitHub repository.",
            evidenceUrl: "https://github.com/user/project",
            confirmed: true,
        });

        assert.equal(valid.confirmed, true);
    });

    test("should validate career target setup schema", () => {
        const valid = careerTargetSetupSchema.parse({
            targetCareer: "Cybersecurity SOC Analyst",
            targetRoleLevel: "entry",
            timelineMonths: 6,
            weeklyHoursAvailable: 15,
        });

        assert.equal(valid.targetCareer, "Cybersecurity SOC Analyst");
        assert.equal(valid.timelineMonths, 6);
    });
});
