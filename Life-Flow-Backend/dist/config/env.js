"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables before validation
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z
        .string()
        .default("5000")
        .transform((val) => {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? 5000 : parsed;
    }),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    MONGODB_URI: zod_1.z
        .string()
        .min(1, "MONGODB_URI is required and cannot be empty"),
    JWT_SECRET: zod_1.z
        .string()
        .min(8, "JWT_SECRET must be at least 8 characters long"),
    JWT_EXPIRES_IN: zod_1.z
        .string()
        .default("7d"),
    CLIENT_URL: zod_1.z
        .string()
        .default("http://localhost:3000"),
    AI_API_URL: zod_1.z
        .string()
        .url("AI_API_URL must be a valid URL")
        .optional()
        .default("https://api.openai.com/v1/chat/completions"),
    AI_API_KEY: zod_1.z
        .string()
        .optional()
        .default(""),
    AI_MODEL: zod_1.z
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
exports.env = parseEnv();
