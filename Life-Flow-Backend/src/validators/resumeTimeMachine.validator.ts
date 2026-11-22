import { z } from "zod";

export const careerTargetSetupSchema = z.object({
    targetCareer: z
        .string()
        .trim()
        .min(2, "Target career must be at least 2 characters")
        .max(150, "Target career cannot exceed 150 characters"),
    targetRoleLevel: z
        .enum(["entry", "junior", "mid", "senior"])
        .default("entry"),
    timelineMonths: z
        .preprocess((val) => Number(val), z.enum(["3", "6", "12"]).or(z.number().refine((n) => [3, 6, 12].includes(n))))
        .transform((val) => Number(val) as 3 | 6 | 12),
    weeklyHoursAvailable: z
        .preprocess((val) => (val !== undefined && val !== null ? Number(val) : 15), z.number().min(1).max(100))
        .default(15),
    currentExperienceLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .default("beginner"),
    preferredIndustry: z
        .string()
        .trim()
        .max(100, "Industry cannot exceed 100 characters")
        .optional()
        .default(""),
});

export type CareerTargetSetupInput = z.infer<typeof careerTargetSetupSchema>;

export const completeMilestoneSchema = z.object({
    completionDescription: z
        .string()
        .trim()
        .min(10, "Please provide at least 10 characters describing the work performed")
        .max(2000, "Description cannot exceed 2000 characters"),
    evidenceUrl: z
        .string()
        .trim()
        .max(500, "Evidence URL cannot exceed 500 characters")
        .optional()
        .refine((val) => !val || /^https?:\/\/.+/i.test(val) || /^github\.com\/.+/i.test(val), {
            message: "Evidence URL must be a valid http/https or github URL if provided",
        }),
    confirmed: z
        .boolean()
        .refine((v) => v === true, {
            message: "You must confirm that this milestone was genuinely achieved",
        }),
});

export type CompleteMilestoneInput = z.infer<typeof completeMilestoneSchema>;

export const updateMilestoneStatusSchema = z.object({
    status: z.enum(["planned", "in_progress", "completed"]),
});

export type UpdateMilestoneStatusInput = z.infer<typeof updateMilestoneStatusSchema>;

export const createSnapshotSchema = z.object({
    title: z.string().trim().min(2).max(150),
    snapshotType: z
        .enum(["current", "projected_3m", "projected_6m", "projected_12m", "milestone_update"])
        .default("current"),
    notes: z.string().trim().max(1000).optional(),
});

export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;
