"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInterviewService = exports.updateReflectionService = exports.completeInterviewService = exports.sendMessageService = exports.listMessagesService = exports.getInterviewByIdService = exports.listInterviewsService = exports.createInterviewService = exports.deleteProfileService = exports.getProfileByIdService = exports.listProfilesService = exports.createFutureSelfProfileService = void 0;
const mongoose_1 = require("mongoose");
const FutureSelfProfile_1 = __importDefault(require("../../models/FutureSelfProfile"));
const FutureSelfInterview_1 = __importDefault(require("../../models/FutureSelfInterview"));
const FutureSelfMessage_1 = __importDefault(require("../../models/FutureSelfMessage"));
const error_middleware_1 = require("../../middleware/error.middleware");
const futureSelf_ai_service_1 = require("../ai/futureSelf.ai.service");
/**
 * Creates and persists a new Future Self Profile with AI-generated projections.
 */
const createFutureSelfProfileService = async (userId, input) => {
    const generatedProfile = await (0, futureSelf_ai_service_1.generateFutureSelfProfileAI)(input);
    const title = input.title?.trim() ||
        `${input.timeHorizon} Horizon: ${input.lifeAreas.slice(0, 2).join(" & ")}`;
    const profile = await FutureSelfProfile_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        title,
        timeHorizon: input.timeHorizon,
        lifeAreas: input.lifeAreas,
        currentSituation: input.currentSituation,
        currentHabits: input.currentHabits,
        strengths: input.strengths,
        challenges: input.challenges,
        responsibilities: input.responsibilities,
        futureGoals: input.futureGoals,
        desiredIdentity: input.desiredIdentity,
        desiredHabits: input.desiredHabits,
        concerns: input.concerns,
        availableTime: input.availableTime,
        monthlyBudget: input.monthlyBudget,
        currentSkills: input.currentSkills,
        availableSupport: input.availableSupport,
        constraints: input.constraints,
        generatedProfile,
        status: "active",
    });
    return profile;
};
exports.createFutureSelfProfileService = createFutureSelfProfileService;
/**
 * Lists all future self profiles for the authenticated user.
 */
const listProfilesService = async (userId) => {
    return FutureSelfProfile_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
};
exports.listProfilesService = listProfilesService;
/**
 * Gets a single future self profile, ensuring user ownership.
 */
const getProfileByIdService = async (userId, profileId) => {
    if (!mongoose_1.Types.ObjectId.isValid(profileId)) {
        throw new error_middleware_1.AppError("Invalid profile identifier format.", 400);
    }
    const profile = await FutureSelfProfile_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(profileId),
        userId: new mongoose_1.Types.ObjectId(userId),
    }).exec();
    if (!profile) {
        throw new error_middleware_1.AppError("Future self profile not found or unauthorized.", 404);
    }
    return profile;
};
exports.getProfileByIdService = getProfileByIdService;
/**
 * Deletes an owned profile and safely cleans up all associated interviews and messages.
 */
const deleteProfileService = async (userId, profileId) => {
    const profile = await (0, exports.getProfileByIdService)(userId, profileId);
    // Find all interviews linked to this profile
    const interviews = await FutureSelfInterview_1.default.find({
        futureSelfProfileId: profile._id,
        userId: new mongoose_1.Types.ObjectId(userId),
    }).exec();
    const interviewIds = interviews.map((i) => i._id);
    // Delete messages, interviews, and the profile
    if (interviewIds.length > 0) {
        await FutureSelfMessage_1.default.deleteMany({ interviewId: { $in: interviewIds } });
        await FutureSelfInterview_1.default.deleteMany({ _id: { $in: interviewIds } });
    }
    await FutureSelfProfile_1.default.deleteOne({ _id: profile._id });
};
exports.deleteProfileService = deleteProfileService;
/**
 * Creates an interview session from an owned profile, and posts the opening welcome message.
 */
const createInterviewService = async (userId, input) => {
    const profile = await (0, exports.getProfileByIdService)(userId, input.futureSelfProfileId);
    const title = input.title?.trim() ||
        `Conversation with my ${profile.timeHorizon} Self`;
    const interview = await FutureSelfInterview_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        futureSelfProfileId: profile._id,
        title,
        status: "active",
        startedAt: new Date(),
        lastMessageAt: new Date(),
    });
    const defaultQuestions = [
        "Did we achieve our biggest goal?",
        "Which habit made the greatest difference?",
        "What was our biggest mistake or regret?",
        "What should I start doing today?",
        "What surprised you most about this journey?",
    ];
    // Opening greeting from the hypothetical future self in simple, warm everyday English
    const openingContent = `Hey! I'm a possible version of you from ${profile.timeHorizon} in the future. I remember where we started and what you want to achieve. What would you like to ask me about our journey?`;
    const openingMessage = await FutureSelfMessage_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        interviewId: interview._id,
        role: "assistant",
        content: openingContent,
        metadata: {
            spokenTranscript: openingContent,
            suggestedQuestions: defaultQuestions,
        },
    });
    return { interview, openingMessage };
};
exports.createInterviewService = createInterviewService;
/**
 * Lists interviews for the authenticated user.
 */
const listInterviewsService = async (userId, page = 1, limit = 20) => {
    const filter = { userId: new mongoose_1.Types.ObjectId(userId) };
    const skip = (page - 1) * limit;
    const [interviews, total] = await Promise.all([
        FutureSelfInterview_1.default.find(filter)
            .populate("futureSelfProfileId")
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        FutureSelfInterview_1.default.countDocuments(filter),
    ]);
    return {
        interviews,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
};
exports.listInterviewsService = listInterviewsService;
/**
 * Retrieves an owned interview with populated profile details.
 */
const getInterviewByIdService = async (userId, interviewId) => {
    if (!mongoose_1.Types.ObjectId.isValid(interviewId)) {
        throw new error_middleware_1.AppError("Invalid interview identifier format.", 400);
    }
    const interview = await FutureSelfInterview_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(interviewId),
        userId: new mongoose_1.Types.ObjectId(userId),
    })
        .populate("futureSelfProfileId")
        .exec();
    if (!interview) {
        throw new error_middleware_1.AppError("Interview not found or unauthorized.", 404);
    }
    return interview;
};
exports.getInterviewByIdService = getInterviewByIdService;
/**
 * Retrieves message history for an owned interview.
 */
const listMessagesService = async (userId, interviewId) => {
    await (0, exports.getInterviewByIdService)(userId, interviewId); // Verify ownership
    return FutureSelfMessage_1.default.find({
        interviewId: new mongoose_1.Types.ObjectId(interviewId),
        userId: new mongoose_1.Types.ObjectId(userId),
    })
        .sort({ createdAt: 1 })
        .exec();
};
exports.listMessagesService = listMessagesService;
/**
 * Sends a user message and generates an in-character AI response.
 */
const sendMessageService = async (userId, interviewId, content) => {
    const interview = await (0, exports.getInterviewByIdService)(userId, interviewId);
    // Fetch profile
    const profile = await FutureSelfProfile_1.default.findById(interview.futureSelfProfileId).exec();
    if (!profile) {
        throw new error_middleware_1.AppError("Linked profile not found.", 404);
    }
    // Save user's message
    const userMessage = await FutureSelfMessage_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        interviewId: interview._id,
        role: "user",
        content: content.trim(),
    });
    // Fetch conversation history for bounded context
    const previousMessages = await FutureSelfMessage_1.default.find({
        interviewId: interview._id,
    })
        .sort({ createdAt: 1 })
        .limit(20)
        .exec();
    const historyPayload = previousMessages.map((m) => ({
        role: m.role,
        content: m.content,
    }));
    // Generate AI response
    const { response, spokenText, suggestedQuestions } = await (0, futureSelf_ai_service_1.generateFutureSelfChatResponseAI)({
        profile: profile.generatedProfile,
        history: historyPayload,
        userMessage: content.trim(),
    });
    // Save assistant message
    const assistantMessage = await FutureSelfMessage_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        interviewId: interview._id,
        role: "assistant",
        content: response,
        metadata: {
            spokenTranscript: spokenText || response,
            suggestedQuestions,
        },
    });
    // Update interview's lastMessageAt
    interview.lastMessageAt = new Date();
    await interview.save();
    return { userMessage, assistantMessage };
};
exports.sendMessageService = sendMessageService;
/**
 * Concludes an interview and synthesizes a strategic decision summary with spoken guidance.
 */
const completeInterviewService = async (userId, interviewId) => {
    const interview = await (0, exports.getInterviewByIdService)(userId, interviewId);
    const profile = await FutureSelfProfile_1.default.findById(interview.futureSelfProfileId).exec();
    if (!profile) {
        throw new error_middleware_1.AppError("Linked profile not found.", 404);
    }
    // Build transcript
    const messages = await (0, exports.listMessagesService)(userId, interviewId);
    const transcript = messages
        .map((m) => `${m.role === "user" ? "User" : "Future Self"}: ${m.content}`)
        .join("\n\n");
    const decisionSummary = await (0, futureSelf_ai_service_1.generateDecisionSummaryAI)({
        profile: profile.generatedProfile,
        transcript,
    });
    interview.status = "completed";
    interview.decisionSummary = decisionSummary;
    await interview.save();
    return interview;
};
exports.completeInterviewService = completeInterviewService;
/**
 * Saves user's personal reflection notes on an interview.
 */
const updateReflectionService = async (userId, interviewId, reflectionNotes) => {
    const interview = await (0, exports.getInterviewByIdService)(userId, interviewId);
    interview.reflectionNotes = reflectionNotes.trim();
    await interview.save();
    return interview;
};
exports.updateReflectionService = updateReflectionService;
/**
 * Deletes an owned interview and its messages.
 */
const deleteInterviewService = async (userId, interviewId) => {
    const interview = await (0, exports.getInterviewByIdService)(userId, interviewId);
    await FutureSelfMessage_1.default.deleteMany({ interviewId: interview._id });
    await FutureSelfInterview_1.default.deleteOne({ _id: interview._id });
};
exports.deleteInterviewService = deleteInterviewService;
