"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advisorChatRequestSchema = void 0;
const zod_1 = require("zod");
const futureSelf_validator_1 = require("./futureSelf.validator");
exports.advisorChatRequestSchema = zod_1.z.object({
    message: zod_1.z
        .string()
        .trim()
        .min(1, "Message cannot be empty")
        .max(2000, "Message cannot exceed 2000 characters")
        .refine(futureSelf_validator_1.isValidMeaningfulStatement, "not a valid statement. Please ask your AI Decision Advisor a meaningful question."),
});
