import { z } from "zod";
import { isValidMeaningfulStatement } from "./futureSelf.validator";

export const advisorChatRequestSchema = z.object({
    message: z
        .string()
        .trim()
        .min(1, "Message cannot be empty")
        .max(2000, "Message cannot exceed 2000 characters")
        .refine(
            isValidMeaningfulStatement,
            "not a valid statement. Please ask your AI Decision Advisor a meaningful question."
        ),
});

export type AdvisorChatRequestInput = z.infer<typeof advisorChatRequestSchema>;
