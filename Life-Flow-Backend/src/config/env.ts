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
