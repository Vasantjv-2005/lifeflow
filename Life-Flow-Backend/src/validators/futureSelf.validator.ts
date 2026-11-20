import { z } from "zod";

/**
 * Validates that an input string consists of meaningful language
 * rather than random keysmash or gibberish (e.g., "sdfsdoinoi", "asdfghjkl").
 */
export const isValidMeaningfulStatement = (text: string): boolean => {
    if (!text || typeof text !== "string") return false;
    const trimmed = text.trim();
    if (trimmed.length < 5) return false;

    // Check if it's repeated identical characters like "aaaaa" or "11111"
    if (/^(.)\1+$/.test(trimmed)) return false;

    // Detect random keysmash with 5 or more consecutive consonants (e.g. "sdfsd", "qwrtp")
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed)) return false;

    const words = trimmed.split(/\s+/).filter(Boolean);

    // If there is only 1 word and it's long without spaces, check for keysmash patterns
    if (words.length === 1 && trimmed.length > 7) {
        if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(trimmed)) return false;
    }

    // Must contain letters
    const letters = trimmed.replace(/[^a-zA-Z]/g, "");
    if (letters.length < 3) return false;

    // Count vowels
    const vowels = trimmed.replace(/[^aeiouyAEIOUY]/g, "");
    const vowelRatio = vowels.length / letters.length;

    // In normal human language, vowel ratio is between 15% and 80%
    if (letters.length >= 6 && (vowelRatio < 0.15 || vowelRatio > 0.85)) {
        return false;
    }

    // Check that at least half of the words of length >= 3 contain a vowel
    let invalidWordCount = 0;
    for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (cleanWord.length >= 3 && !/[aeiouy]/.test(cleanWord)) {
            invalidWordCount++;
        }
    }

    if (invalidWordCount > 0 && invalidWordCount >= words.length / 2) {
        return false;
    }

    return true;
};

export const createFutureSelfProfileSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title cannot exceed 200 characters")
        .optional(),
    timeHorizon: z.enum(
        ["6 months", "1 year", "3 years", "5 years", "10 years"],
        {
            message:
                "Time horizon must be one of: 6 months, 1 year, 3 years, 5 years, 10 years",
        }
    ),
    lifeAreas: z
        .array(z.string().trim().min(1))
        .min(1, "Please select at least one life area"),
    currentSituation: z
        .string()
        .trim()
        .min(5, "Please describe your current situation (at least 5 characters)")
        .max(3000)
        .refine(
            isValidMeaningfulStatement,
            "Not a valid statement. Please enter a meaningful description rather than random letters."
        ),
    currentHabits: z.string().trim().max(2000).optional().default(""),
    strengths: z.string().trim().max(2000).optional().default(""),
    challenges: z.string().trim().max(2000).optional().default(""),
    responsibilities: z.string().trim().max(2000).optional().default(""),
    futureGoals: z
        .string()
        .trim()
        .min(5, "Please describe what you want to achieve (at least 5 characters)")
        .max(3000)
        .refine(
            isValidMeaningfulStatement,
            "Not a valid statement. Please enter your primary future goals in meaningful words."
        ),
    desiredIdentity: z.string().trim().max(2000).optional().default(""),
    desiredHabits: z.string().trim().max(2000).optional().default(""),
    concerns: z.string().trim().max(2000).optional().default(""),
    availableTime: z
        .string()
        .trim()
        .min(1, "Please state your available time per day")
        .max(500)
        .refine(
            (val) => val.trim().length >= 2 && !/^(.)\1+$/.test(val.trim()),
            "Please provide a valid time commitment (e.g. 1-2 hours per day)."
        ),
    monthlyBudget: z.string().trim().max(500).optional().default(""),
    currentSkills: z.string().trim().max(2000).optional().default(""),
    availableSupport: z.string().trim().max(2000).optional().default(""),
    constraints: z.string().trim().max(2000).optional().default(""),
});

export const createInterviewSchema = z.object({
    futureSelfProfileId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Valid MongoDB ObjectId required"),
    title: z.string().trim().max(200).optional(),
});

export const sendMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Message content cannot be empty")
        .max(4000, "Message cannot exceed 4000 characters"),
});

export const updateReflectionSchema = z.object({
    reflectionNotes: z
        .string()
        .trim()
        .max(5000, "Reflection cannot exceed 5000 characters"),
});

export type CreateFutureSelfProfileInput = z.infer<
    typeof createFutureSelfProfileSchema
>;
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateReflectionInput = z.infer<typeof updateReflectionSchema>;
