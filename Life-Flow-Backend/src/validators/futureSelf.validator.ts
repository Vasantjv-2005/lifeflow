import { z } from "zod";

const KEYBOARD_PATTERNS = [
    /qwerty/i,
    /asdf/i,
    /zxcv/i,
    /qwer/i,
    /dfgh/i,
    /fghj/i,
    /ghjk/i,
    /hjkl/i,
    /lkjh/i,
    /poiuy/i,
    /mnbvc/i,
    /sdfs/i,
    /fsdf/i,
    /dsfs/i,
    /sdff/i,
    /asdasd/i,
    /tyui/i,
    /yuio/i,
    /uiop/i,
    /xcvb/i,
    /cvbn/i,
    /vbnm/i,
    /wert/i,
    /erty/i,
    /rtyu/i,
    /sdfg/i,
    /fdsa/i,
    /gfdsa/i,
    /hgfdsa/i,
    /jhgfdsa/i,
    /kjhgfdsa/i,
    /nbvc/i,
    /bvcx/i,
    /vcxz/i,
    /trewq/i,
    /ytrewq/i,
];

const KNOWN_4CONSONANT_WORDS = new Set([
    "strength",
    "strengths",
    "length",
    "lengths",
    "catch",
    "match",
    "watch",
    "pitch",
    "switch",
    "scratch",
    "stretch",
    "spring",
    "splash",
    "bright",
    "flight",
    "wright",
    "insight",
    "straight",
    "eighth",
    "twelfth",
    "glimpse",
    "rhythm",
    "rhythms",
    "sch",
    "christ",
    "struct",
    "construct",
    "instruct",
    "destroy",
    "explain",
    "stack",
    "stacks",
    "script",
    "night",
    "light",
    "eight",
    "weight",
    "through",
    "thought",
    "psych",
    "craft",
    "draft",
    "warmth",
    "depth",
]);

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

    // Reject known keyboard mash / walk patterns
    for (const pat of KEYBOARD_PATTERNS) {
        if (pat.test(trimmed)) return false;
    }

    // Repeating 2 or 3 character patterns (e.g. "ababab", "asdasd")
    if (/(\b|\w)(\w{2,3})\2{2,}(\w|\b)/i.test(trimmed)) return false;

    const words = trimmed.split(/[\s\-]+/).filter(Boolean);

    // Check consonant clusters in words
    for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (cleanWord.length >= 4) {
            if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(cleanWord)) return false;
            const match = cleanWord.match(/[bcdfghjklmnpqrstvwxz]{4,}/g);
            if (match) {
                const isKnown = Array.from(KNOWN_4CONSONANT_WORDS).some((kw) =>
                    cleanWord.includes(kw)
                );
                if (!isKnown) return false;
            }
        }
    }

    // Must contain letters
    const letters = trimmed.replace(/[^a-zA-Z]/g, "");
    if (letters.length < 3) return false;

    // Count vowels
    const vowels = trimmed.replace(/[^aeiouyAEIOUY]/g, "");
    const vowelRatio = vowels.length / letters.length;

    // In normal human language, vowel ratio is between 12% and 88%
    if (letters.length >= 6 && (vowelRatio < 0.12 || vowelRatio > 0.88)) {
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

/**
 * Validates a realistic time commitment (e.g., "1-2 hours per day", "2 hrs", "30 mins").
 */
export const isValidTimeCommitment = (text: string): boolean => {
    if (!text || typeof text !== "string") return false;
    const trimmed = text.trim();
    if (trimmed.length < 2) return false;
    if (/^(.)\1+$/.test(trimmed)) return false;
    for (const pat of KEYBOARD_PATTERNS) {
        if (pat.test(trimmed)) return false;
    }
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed)) return false;

    const timeRegex = /(hr|hour|min|day|week|weekend|time|daily|m\b|h\b)/i;
    const digitRegex = /\d/;
    if (digitRegex.test(trimmed) && (timeRegex.test(trimmed) || trimmed.length <= 15)) {
        return true;
    }
    if (timeRegex.test(trimmed)) return true;
    return isValidMeaningfulStatement(trimmed);
};

/**
 * Validates a realistic monthly budget (e.g., "$100", "500 USD", "free", "none", or empty).
 */
export const isValidBudget = (text: string): boolean => {
    if (!text || typeof text !== "string") return true;
    const trimmed = text.trim();
    if (trimmed.length === 0) return true;
    if (/^(.)\1+$/.test(trimmed)) return false;
    for (const pat of KEYBOARD_PATTERNS) {
        if (pat.test(trimmed)) return false;
    }
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed)) return false;

    const budgetWords = /(free|zero|none|minimal|modest|no budget|dollars?|usd|inr|eur|budget|k\b)/i;
    const currencyOrDigit = /[\d$€£₹¥]/;
    if (currencyOrDigit.test(trimmed) || budgetWords.test(trimmed)) {
        return true;
    }
    return isValidMeaningfulStatement(trimmed);
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
            "not a valid statement. Please enter a meaningful description rather than random letters."
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
            "not a valid statement. Please enter your primary future goals in meaningful words."
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
            isValidTimeCommitment,
            "not a valid statement. Please provide a valid time commitment (e.g. 1-2 hours per day)."
        ),
    monthlyBudget: z
        .string()
        .trim()
        .max(500)
        .optional()
        .default("")
        .refine(
            isValidBudget,
            "not a valid statement. Please enter a valid monthly budget (e.g. $100, free, or leave empty)."
        ),
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
        .max(4000, "Message cannot exceed 4000 characters")
        .refine(
            isValidMeaningfulStatement,
            "not a valid statement. Please ask your future self a meaningful question."
        ),
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
