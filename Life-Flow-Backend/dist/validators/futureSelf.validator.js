"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReflectionSchema = exports.sendMessageSchema = exports.createInterviewSchema = exports.createFutureSelfProfileSchema = exports.isValidMeaningfulStatement = void 0;
const zod_1 = require("zod");
/**
 * Validates that an input string consists of meaningful language
 * rather than random keysmash or gibberish (e.g., "sdfsdoinoi", "asdfghjkl").
 */
const isValidMeaningfulStatement = (text) => {
    if (!text || typeof text !== "string")
        return false;
    const trimmed = text.trim();
    if (trimmed.length < 5)
        return false;
    // Check if it's repeated identical characters like "aaaaa" or "11111"
    if (/^(.)\1+$/.test(trimmed))
        return false;
    // Detect random keysmash with 5 or more consecutive consonants (e.g. "sdfsd", "qwrtp")
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed))
        return false;
    const words = trimmed.split(/\s+/).filter(Boolean);
    // If there is only 1 word and it's long without spaces, check for keysmash patterns
    if (words.length === 1 && trimmed.length > 7) {
        if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(trimmed))
            return false;
    }
    // Must contain letters
    const letters = trimmed.replace(/[^a-zA-Z]/g, "");
    if (letters.length < 3)
        return false;
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
exports.isValidMeaningfulStatement = isValidMeaningfulStatement;
exports.createFutureSelfProfileSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title cannot exceed 200 characters")
        .optional(),
    timeHorizon: zod_1.z.enum(["6 months", "1 year", "3 years", "5 years", "10 years"], {
        message: "Time horizon must be one of: 6 months, 1 year, 3 years, 5 years, 10 years",
    }),
    lifeAreas: zod_1.z
        .array(zod_1.z.string().trim().min(1))
        .min(1, "Please select at least one life area"),
    currentSituation: zod_1.z
        .string()
        .trim()
        .min(5, "Please describe your current situation (at least 5 characters)")
        .max(3000)
        .refine(exports.isValidMeaningfulStatement, "Not a valid statement. Please enter a meaningful description rather than random letters."),
    currentHabits: zod_1.z.string().trim().max(2000).optional().default(""),
    strengths: zod_1.z.string().trim().max(2000).optional().default(""),
    challenges: zod_1.z.string().trim().max(2000).optional().default(""),
    responsibilities: zod_1.z.string().trim().max(2000).optional().default(""),
    futureGoals: zod_1.z
        .string()
        .trim()
        .min(5, "Please describe what you want to achieve (at least 5 characters)")
        .max(3000)
        .refine(exports.isValidMeaningfulStatement, "Not a valid statement. Please enter your primary future goals in meaningful words."),
    desiredIdentity: zod_1.z.string().trim().max(2000).optional().default(""),
    desiredHabits: zod_1.z.string().trim().max(2000).optional().default(""),
    concerns: zod_1.z.string().trim().max(2000).optional().default(""),
    availableTime: zod_1.z
        .string()
        .trim()
        .min(1, "Please state your available time per day")
        .max(500)
        .refine((val) => val.trim().length >= 2 && !/^(.)\1+$/.test(val.trim()), "Please provide a valid time commitment (e.g. 1-2 hours per day)."),
    monthlyBudget: zod_1.z.string().trim().max(500).optional().default(""),
    currentSkills: zod_1.z.string().trim().max(2000).optional().default(""),
    availableSupport: zod_1.z.string().trim().max(2000).optional().default(""),
    constraints: zod_1.z.string().trim().max(2000).optional().default(""),
});
exports.createInterviewSchema = zod_1.z.object({
    futureSelfProfileId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Valid MongoDB ObjectId required"),
    title: zod_1.z.string().trim().max(200).optional(),
});
exports.sendMessageSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .trim()
        .min(1, "Message content cannot be empty")
        .max(4000, "Message cannot exceed 4000 characters"),
});
exports.updateReflectionSchema = zod_1.z.object({
    reflectionNotes: zod_1.z
        .string()
        .trim()
        .max(5000, "Reflection cannot exceed 5000 characters"),
});
