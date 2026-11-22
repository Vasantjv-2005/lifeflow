"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSnapshotSchema = exports.updateMilestoneStatusSchema = exports.completeMilestoneSchema = exports.careerTargetSetupSchema = void 0;
const zod_1 = require("zod");
exports.careerTargetSetupSchema = zod_1.z.object({
    targetCareer: zod_1.z
        .string()
        .trim()
        .min(2, "Target career must be at least 2 characters")
        .max(150, "Target career cannot exceed 150 characters"),
    targetRoleLevel: zod_1.z
        .enum(["entry", "junior", "mid", "senior"])
        .default("entry"),
    timelineMonths: zod_1.z
        .preprocess((val) => Number(val), zod_1.z.enum(["3", "6", "12"]).or(zod_1.z.number().refine((n) => [3, 6, 12].includes(n))))
        .transform((val) => Number(val)),
    weeklyHoursAvailable: zod_1.z
        .preprocess((val) => (val !== undefined && val !== null ? Number(val) : 15), zod_1.z.number().min(1).max(100))
        .default(15),
    currentExperienceLevel: zod_1.z
        .enum(["beginner", "intermediate", "advanced"])
        .default("beginner"),
    preferredIndustry: zod_1.z
        .string()
        .trim()
        .max(100, "Industry cannot exceed 100 characters")
        .optional()
        .default(""),
});
exports.completeMilestoneSchema = zod_1.z.object({
    completionDescription: zod_1.z
        .string()
        .trim()
        .min(10, "Please provide at least 10 characters describing the work performed")
        .max(2000, "Description cannot exceed 2000 characters"),
    evidenceUrl: zod_1.z
        .string()
        .trim()
        .max(500, "Evidence URL cannot exceed 500 characters")
        .optional()
        .refine((val) => !val || /^https?:\/\/.+/i.test(val) || /^github\.com\/.+/i.test(val), {
        message: "Evidence URL must be a valid http/https or github URL if provided",
    }),
    confirmed: zod_1.z
        .boolean()
        .refine((v) => v === true, {
        message: "You must confirm that this milestone was genuinely achieved",
    }),
});
exports.updateMilestoneStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["planned", "in_progress", "completed"]),
});
exports.createSnapshotSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2).max(150),
    snapshotType: zod_1.z
        .enum(["current", "projected_3m", "projected_6m", "projected_12m", "milestone_update"])
        .default("current"),
    notes: zod_1.z.string().trim().max(1000).optional(),
});
