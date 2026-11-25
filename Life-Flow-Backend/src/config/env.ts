import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables before validation
dotenv.config();

const envSchema = z.object({
    PORT: z
        .string()
        .default("5000")
        .transform((val) => {
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? 5000 : parsed;
        }),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    MONGODB_URI: z
        .string()
        .min(1, "MONGODB_URI is required and cannot be empty"),
    JWT_SECRET: z
        .string()
        .min(8, "JWT_SECRET must be at least 8 characters long"),
    JWT_EXPIRES_IN: z
        .string()
        .default("7d"),
    CLIENT_URL: z
        .string()
        .default("http://localhost:3000"),
    AI_API_URL: z
        .string()
        .url("AI_API_URL must be a valid URL")
        .optional()
        .default("https://api.openai.com/v1/chat/completions"),
    AI_API_KEY: z
        .string()
        .optional()
        .default(""),
    AI_MODEL: z
        .string()
        .optional()
        .default("gpt-4o-mini"),
    GOOGLE_CLIENT_ID: z
        .string()
        .optional()
        .default(""),
    GOOGLE_CLIENT_SECRET: z
        .string()
        .optional()
        .default(""),
    GOOGLE_CALLBACK_URL: z
        .string()
        .default("http://localhost:5000/api/auth/google/callback"),
    GITHUB_CLIENT_ID: z
        .string()
        .optional()
        .default(""),
    GITHUB_CLIENT_SECRET: z
        .string()
        .optional()
        .default(""),
    GITHUB_CALLBACK_URL: z
        .string()
        .default("http://localhost:5000/api/auth/github/callback"),
});

const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:", parsed.error.format());
        // For development fallback or runtime clarity, throw an informative error
        const issues = parsed.error.issues
            .map((issue) => `[${issue.path.join(".")}] ${issue.message}`)
            .join("; ");
        throw new Error(`Environment configuration error: ${issues}`);
    }

    return parsed.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;

/**
 * Parses comma-separated CLIENT_URL values into normalized origin strings.
 */
export const getAllowedClientOrigins = (): string[] => {
    return env.CLIENT_URL.split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean);
};

/**
 * Returns the primary frontend URL (first entry in CLIENT_URL).
 */
export const getPrimaryClientUrl = (): string => {
    return getAllowedClientOrigins()[0] || "http://localhost:3000";
};
