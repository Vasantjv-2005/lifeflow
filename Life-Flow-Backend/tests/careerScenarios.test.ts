import { describe, it } from "node:test";
import assert from "node:assert";
import { generateCareerScenarios, isCareerDecision } from "../src/services/ai/careerScenario.service";
import { generateScenarios } from "../src/services/ai/ai.service";

describe("Intelligent Career Scenario Generation Engine", () => {
    describe("Career Decision Detection", () => {
        it("should accurately identify career decisions across categories and titles", () => {
            assert.strictEqual(isCareerDecision("Career", "Become a Cybersecurity Analyst", "Get hired as a SOC analyst"), true);
            assert.strictEqual(isCareerDecision("Other", "Become a Full-Stack Java Developer", "Build web applications"), true);
            assert.strictEqual(isCareerDecision("Career", "Data Scientist", "Master ML"), true);
            assert.strictEqual(isCareerDecision("Other", "UI/UX Designer", "Design products"), true);

            // Non-career decisions
            assert.strictEqual(isCareerDecision("Relationships", "Move in together with partner", "Build stronger bond"), false);
            assert.strictEqual(isCareerDecision("Health & wellbeing", "Run a half-marathon", "Improve cardiovascular fitness"), false);
            assert.strictEqual(isCareerDecision("Money & finance", "Pay off credit card debt", "Become financially free"), false);
        });
    });

    describe("1. Cybersecurity Analyst - 3 Distinct Purpose-Driven Scenarios", () => {
        it("should generate Learning Roadmap, Interview Mastery, and Projects/Internships/Backup for Cybersecurity", () => {
            const result = generateCareerScenarios({
                decisionTitle: "Become a Cybersecurity Analyst",
                category: "Career",
                goal: "Become an entry-level SOC Analyst or Security Analyst within 6-8 months.",
                currentSituation: "Beginner with basic computer literacy, 2 hours available daily.",
                timeAvailable: 2,
            });

            assert.strictEqual(result.scenarios.length, 3);
            const [optimistic, realistic, pessimistic] = result.scenarios;

            // 1. Optimistic Scenario: Complete Learning Roadmap
            assert.strictEqual(optimistic.type, "optimistic");
            assert.ok(optimistic.name.includes("Learning Roadmap"));
            assert.ok(optimistic.learningRoadmap, "Must include learningRoadmap structure");
            assert.ok(optimistic.learningRoadmap.stages.length >= 4, "Must have at least 4 progressive stages");

            const stage1 = optimistic.learningRoadmap.stages[0];
            assert.ok(stage1.title.toLowerCase().includes("networking"), "Stage 1 must cover networking foundations");
            assert.ok(stage1.technologiesAndTools.some((t) => t.includes("Wireshark")), "Must include Wireshark");
            assert.ok(stage1.skillsToMaster.some((s) => s.includes("TCP/IP")), "Must include TCP/IP");

            const stage4 = optimistic.learningRoadmap.stages[3];
            assert.ok(stage4.title.toLowerCase().includes("soc") || stage4.title.toLowerCase().includes("siem"), "Stage 4 must cover SOC/SIEM");
            assert.ok(stage4.technologiesAndTools.some((t) => t.includes("Splunk") || t.includes("Wazuh")), "Must include SIEM tools");

            // 2. Realistic Scenario: Interview Preparation Syllabus
            assert.strictEqual(realistic.type, "realistic");
            assert.ok(realistic.name.includes("Interview Preparation"));
            assert.ok(realistic.interviewPreparation, "Must include interviewPreparation structure");
            assert.ok(realistic.interviewPreparation.subjects.length >= 4, "Must have at least 4 interview subjects");

            const netSubject = realistic.interviewPreparation.subjects.find((s) => s.subjectName.toLowerCase().includes("network"));
            assert.ok(netSubject, "Must have Networking interview subject");
            assert.ok(netSubject.interviewQuestions.length >= 2, "Must include technical interview questions");
            assert.ok(netSubject.checklist.length >= 2, "Must include preparation checklist");

            const linuxSubject = realistic.interviewPreparation.subjects.find((s) => s.subjectName.toLowerCase().includes("linux"));
            assert.ok(linuxSubject, "Must have Linux interview subject");

            // 3. Pessimistic Scenario: Projects, Internships & Backup Plan
            assert.strictEqual(pessimistic.type, "pessimistic");
            assert.ok(pessimistic.name.includes("Projects, Internships"));
            assert.ok(pessimistic.opportunitiesAndBackup, "Must include opportunitiesAndBackup structure");

            const opps = pessimistic.opportunitiesAndBackup;
            // A. Practical Projects (Beginner, Intermediate, Advanced)
            assert.strictEqual(opps.projects.length, 3);
            assert.strictEqual(opps.projects[0].level, "Beginner");
            assert.strictEqual(opps.projects[1].level, "Intermediate");
            assert.strictEqual(opps.projects[2].level, "Advanced");
            assert.ok(opps.projects[0].githubRecommendations.length > 10, "Must include GitHub recommendations");

            // B. Internship Opportunities across LinkedIn, Naukri, Wellfound
            assert.ok(opps.internshipOpportunities.length >= 3);
            const platforms = opps.internshipOpportunities.map((j) => j.platform);
            assert.ok(platforms.includes("LinkedIn"), "Must include LinkedIn search/listings");
            assert.ok(platforms.includes("Naukri"), "Must include Naukri search/listings");
            assert.ok(platforms.includes("Wellfound"), "Must include Wellfound search/listings");

            // C. Market Analysis & Skill Gaps
            assert.ok(opps.jobMarketAnalysis.mostRequestedSkills.length >= 3);
            assert.ok(opps.jobMarketAnalysis.commonTools.some((t) => t.includes("Wireshark") || t.includes("Splunk")));

            // D. Alternative Routes
            assert.ok(opps.alternativeRoutes.length >= 2);
            assert.ok(opps.alternativeRoutes.some((r) => r.role.toLowerCase().includes("it support") || r.role.toLowerCase().includes("network")));

            // E. 30-Day Recovery Strategy
            assert.ok(opps.recoveryStrategy.thirtyDayActionPlan.length >= 5);
            assert.ok(opps.recoveryStrategy.resumeImprovements.length >= 2);
        });
    });

    describe("2. Full-Stack Java Developer - 3 Distinct Scenarios", () => {
        it("should generate Java, Spring Boot, React, and SQL specific roadmaps and interview syllabus", () => {
            const result = generateCareerScenarios({
                decisionTitle: "Become a Full-Stack Java Developer",
                category: "Career",
                goal: "Master Java, Spring Boot, REST APIs, and React to get an entry-level software engineer job.",
                timeAvailable: 2,
            });

            assert.strictEqual(result.scenarios.length, 3);
            const [optimistic, realistic, pessimistic] = result.scenarios;

            // Optimistic: Java & Spring Boot Roadmap
            const roadmap = optimistic.learningRoadmap!;
            assert.ok(roadmap.stages.some((s) => s.title.includes("Core Java")));
            assert.ok(roadmap.stages.some((s) => s.title.includes("Spring Data JPA") || s.title.includes("Relational Databases")));
            assert.ok(roadmap.stages.some((s) => s.title.includes("Spring Security") || s.title.includes("Microservices")));

            // Realistic: Java Interview Syllabus
            const interview = realistic.interviewPreparation!;
            assert.ok(interview.subjects.some((s) => s.subjectName.includes("Core Java")));
            assert.ok(interview.subjects.some((s) => s.subjectName.includes("Spring Boot")));

            // Pessimistic: Full-Stack Projects & Internships
            const opps = pessimistic.opportunitiesAndBackup!;
            assert.ok(opps.projects.some((p) => p.technologies.some((t) => t.includes("Spring Boot"))));
            assert.ok(opps.internshipOpportunities.some((j) => j.platform === "LinkedIn"));
        });
    });

    describe("3. Data Scientist - 3 Distinct Scenarios", () => {
        it("should generate Python, Statistics, Machine Learning, and SQL syllabus", () => {
            const result = generateCareerScenarios({
                decisionTitle: "Become a Data Scientist",
                category: "Career",
                goal: "Learn data analysis, machine learning algorithms, and build real-world Kaggle projects.",
                timeAvailable: 2,
            });

            const [optimistic, realistic, pessimistic] = result.scenarios;
            assert.ok(optimistic.learningRoadmap!.stages.some((s) => s.title.includes("Python") || s.title.includes("Pandas")));
            assert.ok(optimistic.learningRoadmap!.stages.some((s) => s.title.includes("Statistics")));
            assert.ok(optimistic.learningRoadmap!.stages.some((s) => s.title.includes("Machine Learning")));

            assert.ok(realistic.interviewPreparation);
            assert.ok(pessimistic.opportunitiesAndBackup!.internshipOpportunities.length >= 3);
        });
    });

    describe("4. UI/UX Designer - 3 Distinct Scenarios", () => {
        it("should generate Figma, User Research, Design Systems, and Prototyping syllabus", () => {
            const result = generateCareerScenarios({
                decisionTitle: "Become a UI/UX Designer",
                category: "Career",
                goal: "Build a portfolio of 2-3 case studies in Figma and secure a junior product design role.",
                timeAvailable: 2,
            });

            const [optimistic, realistic, pessimistic] = result.scenarios;
            assert.ok(optimistic.learningRoadmap!.stages.some((s) => s.title.includes("Figma") || s.title.includes("Design Fundamentals")));
            assert.ok(optimistic.learningRoadmap!.stages.some((s) => s.title.includes("UX") || s.title.includes("Research")));

            assert.ok(realistic.interviewPreparation);
            assert.ok(pessimistic.opportunitiesAndBackup!.projects.some((p) => p.technologies.includes("Figma")));
        });
    });

    describe("5. General-Purpose Scenario Preservation (Non-Career)", () => {
        it("should preserve standard relationship scenario generation for Relationships category", async () => {
            const result = await generateScenarios({
                decisionTitle: "Move in together with partner",
                category: "Relationships",
                goal: "Transition to co-living smoothly and build open communication routines.",
            });

            assert.strictEqual(result.scenarios.length, 3);
            const first = result.scenarios[0];
            // Ensure relationships content is generated without software/career terminology
            assert.ok(
                first.description.toLowerCase().includes("communication") ||
                first.description.toLowerCase().includes("relationship") ||
                first.name.toLowerCase().includes("joint") ||
                first.name.toLowerCase().includes("harmonious"),
                "Must preserve domain-specific relationship scenarios"
            );
        });
    });
});
