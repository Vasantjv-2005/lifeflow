"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInterview = exports.updateReflection = exports.completeInterview = exports.sendMessage = exports.listMessages = exports.getInterviewById = exports.listInterviews = exports.createInterview = exports.deleteProfile = exports.getProfileById = exports.listProfiles = exports.createProfile = void 0;
const futureSelf_validator_1 = require("../validators/futureSelf.validator");
const futureSelf_service_1 = require("../services/futureSelf/futureSelf.service");
const apiResponse_1 = require("../utils/apiResponse");
const getUserId = (req) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new Error("Authentication required.");
    }
    return userId;
};
// POST /api/future-self/profiles
const createProfile = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const parsed = futureSelf_validator_1.createFutureSelfProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }
        const profile = await (0, futureSelf_service_1.createFutureSelfProfileService)(userId, parsed.data);
        (0, apiResponse_1.sendSuccess)(res, "Future Self Profile created successfully.", { profile }, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createProfile = createProfile;
// GET /api/future-self/profiles
const listProfiles = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const profiles = await (0, futureSelf_service_1.listProfilesService)(userId);
        (0, apiResponse_1.sendSuccess)(res, "Profiles retrieved successfully.", { profiles });
    }
    catch (error) {
        next(error);
    }
};
exports.listProfiles = listProfiles;
// GET /api/future-self/profiles/:id
const getProfileById = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const profileId = typeof req.params.id === "string" ? req.params.id : "";
        const profile = await (0, futureSelf_service_1.getProfileByIdService)(userId, profileId);
        (0, apiResponse_1.sendSuccess)(res, "Profile retrieved successfully.", { profile });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfileById = getProfileById;
// DELETE /api/future-self/profiles/:id
const deleteProfile = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const profileId = typeof req.params.id === "string" ? req.params.id : "";
        await (0, futureSelf_service_1.deleteProfileService)(userId, profileId);
        (0, apiResponse_1.sendSuccess)(res, "Profile and associated sessions deleted successfully.", null);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProfile = deleteProfile;
// POST /api/future-self/interviews
const createInterview = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const parsed = futureSelf_validator_1.createInterviewSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }
        const result = await (0, futureSelf_service_1.createInterviewService)(userId, parsed.data);
        (0, apiResponse_1.sendSuccess)(res, "Interview session initiated successfully.", result, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createInterview = createInterview;
// GET /api/future-self/interviews
const listInterviews = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const result = await (0, futureSelf_service_1.listInterviewsService)(userId, page, limit);
        (0, apiResponse_1.sendSuccess)(res, "Interviews retrieved successfully.", result);
    }
    catch (error) {
        next(error);
    }
};
exports.listInterviews = listInterviews;
// GET /api/future-self/interviews/:id
const getInterviewById = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const interview = await (0, futureSelf_service_1.getInterviewByIdService)(userId, interviewId);
        (0, apiResponse_1.sendSuccess)(res, "Interview retrieved successfully.", { interview });
    }
    catch (error) {
        next(error);
    }
};
exports.getInterviewById = getInterviewById;
// GET /api/future-self/interviews/:id/messages
const listMessages = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const messages = await (0, futureSelf_service_1.listMessagesService)(userId, interviewId);
        (0, apiResponse_1.sendSuccess)(res, "Messages retrieved successfully.", { messages });
    }
    catch (error) {
        next(error);
    }
};
exports.listMessages = listMessages;
// POST /api/future-self/interviews/:id/messages
const sendMessage = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const parsed = futureSelf_validator_1.sendMessageSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }
        const result = await (0, futureSelf_service_1.sendMessageService)(userId, interviewId, parsed.data.content);
        (0, apiResponse_1.sendSuccess)(res, "Message sent and response generated.", result);
    }
    catch (error) {
        next(error);
    }
};
exports.sendMessage = sendMessage;
// POST /api/future-self/interviews/:id/complete
const completeInterview = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const interview = await (0, futureSelf_service_1.completeInterviewService)(userId, interviewId);
        (0, apiResponse_1.sendSuccess)(res, "Interview completed and decision summary synthesized.", { interview });
    }
    catch (error) {
        next(error);
    }
};
exports.completeInterview = completeInterview;
// PATCH /api/future-self/interviews/:id/reflection
const updateReflection = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const parsed = futureSelf_validator_1.updateReflectionSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }
        const interview = await (0, futureSelf_service_1.updateReflectionService)(userId, interviewId, parsed.data.reflectionNotes);
        (0, apiResponse_1.sendSuccess)(res, "Personal reflection saved.", { interview });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReflection = updateReflection;
// DELETE /api/future-self/interviews/:id
const deleteInterview = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        await (0, futureSelf_service_1.deleteInterviewService)(userId, interviewId);
        (0, apiResponse_1.sendSuccess)(res, "Interview deleted successfully.", null);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInterview = deleteInterview;
