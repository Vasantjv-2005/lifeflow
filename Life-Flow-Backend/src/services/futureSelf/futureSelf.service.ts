import mongoose, { Types } from "mongoose";
import FutureSelfProfile, { IFutureSelfProfile } from "../../models/FutureSelfProfile";
import FutureSelfInterview, { IFutureSelfInterview } from "../../models/FutureSelfInterview";
import FutureSelfMessage, { IFutureSelfMessage } from "../../models/FutureSelfMessage";
import { AppError } from "../../middleware/error.middleware";
import {
    generateFutureSelfProfileAI,
    generateFutureSelfChatResponseAI,
    generateDecisionSummaryAI,
} from "../ai/futureSelf.ai.service";
import type {
    CreateFutureSelfProfileInput,
    CreateInterviewInput,
} from "../../validators/futureSelf.validator";

/**
 * Creates and persists a new Future Self Profile with AI-generated projections.
 */
export const createFutureSelfProfileService = async (
    userId: string,
    input: CreateFutureSelfProfileInput
): Promise<IFutureSelfProfile> => {
    const generatedProfile = await generateFutureSelfProfileAI(input);

    const title =
        input.title?.trim() ||
        `${input.timeHorizon} Horizon: ${input.lifeAreas.slice(0, 2).join(" & ")}`;

    const profile = await FutureSelfProfile.create({
        userId: new Types.ObjectId(userId),
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

/**
 * Lists all future self profiles for the authenticated user.
 */
export const listProfilesService = async (
    userId: string
): Promise<IFutureSelfProfile[]> => {
    return FutureSelfProfile.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
};

/**
 * Gets a single future self profile, ensuring user ownership.
 */
export const getProfileByIdService = async (
    userId: string,
    profileId: string
): Promise<IFutureSelfProfile> => {
    if (!Types.ObjectId.isValid(profileId)) {
        throw new AppError("Invalid profile identifier format.", 400);
    }

    const profile = await FutureSelfProfile.findOne({
        _id: new Types.ObjectId(profileId),
        userId: new Types.ObjectId(userId),
    }).exec();

    if (!profile) {
        throw new AppError("Future self profile not found or unauthorized.", 404);
    }

    return profile;
};

/**
 * Deletes an owned profile and safely cleans up all associated interviews and messages.
 */
export const deleteProfileService = async (
    userId: string,
    profileId: string
): Promise<void> => {
    const profile = await getProfileByIdService(userId, profileId);

    // Find all interviews linked to this profile
    const interviews = await FutureSelfInterview.find({
        futureSelfProfileId: profile._id,
        userId: new Types.ObjectId(userId),
    }).exec();

    const interviewIds = interviews.map((i) => i._id);

    // Delete messages, interviews, and the profile
    if (interviewIds.length > 0) {
        await FutureSelfMessage.deleteMany({ interviewId: { $in: interviewIds } });
        await FutureSelfInterview.deleteMany({ _id: { $in: interviewIds } });
    }

    await FutureSelfProfile.deleteOne({ _id: profile._id });
};

/**
 * Creates an interview session from an owned profile, and posts the opening welcome message.
 */
export const createInterviewService = async (
    userId: string,
    input: CreateInterviewInput
): Promise<{ interview: IFutureSelfInterview; openingMessage: IFutureSelfMessage }> => {
    const profile = await getProfileByIdService(userId, input.futureSelfProfileId);

    const title =
        input.title?.trim() ||
        `Conversation with my ${profile.timeHorizon} Self`;

    const interview = await FutureSelfInterview.create({
        userId: new Types.ObjectId(userId),
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

    const openingMessage = await FutureSelfMessage.create({
        userId: new Types.ObjectId(userId),
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

/**
 * Lists interviews for the authenticated user.
 */
export const listInterviewsService = async (
    userId: string,
    page = 1,
    limit = 20
): Promise<{ interviews: IFutureSelfInterview[]; total: number; page: number; totalPages: number }> => {
    const filter = { userId: new Types.ObjectId(userId) };
    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
        FutureSelfInterview.find(filter)
            .populate("futureSelfProfileId")
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        FutureSelfInterview.countDocuments(filter),
    ]);

    return {
        interviews,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
};

/**
 * Retrieves an owned interview with populated profile details.
 */
export const getInterviewByIdService = async (
    userId: string,
    interviewId: string
): Promise<IFutureSelfInterview> => {
    if (!Types.ObjectId.isValid(interviewId)) {
        throw new AppError("Invalid interview identifier format.", 400);
    }

    const interview = await FutureSelfInterview.findOne({
        _id: new Types.ObjectId(interviewId),
        userId: new Types.ObjectId(userId),
    })
        .populate("futureSelfProfileId")
        .exec();

    if (!interview) {
        throw new AppError("Interview not found or unauthorized.", 404);
    }

    return interview;
};

/**
 * Retrieves message history for an owned interview.
 */
export const listMessagesService = async (
    userId: string,
    interviewId: string
): Promise<IFutureSelfMessage[]> => {
    await getInterviewByIdService(userId, interviewId); // Verify ownership

    return FutureSelfMessage.find({
        interviewId: new Types.ObjectId(interviewId),
        userId: new Types.ObjectId(userId),
    })
        .sort({ createdAt: 1 })
        .exec();
};

/**
 * Sends a user message and generates an in-character AI response.
 */
export const sendMessageService = async (
    userId: string,
    interviewId: string,
    content: string
): Promise<{ userMessage: IFutureSelfMessage; assistantMessage: IFutureSelfMessage }> => {
    const interview = await getInterviewByIdService(userId, interviewId);

    // Fetch profile
    const profile = await FutureSelfProfile.findById(interview.futureSelfProfileId).exec();
    if (!profile) {
        throw new AppError("Linked profile not found.", 404);
    }

    // Save user's message
    const userMessage = await FutureSelfMessage.create({
        userId: new Types.ObjectId(userId),
        interviewId: interview._id,
        role: "user",
        content: content.trim(),
    });

    // Fetch conversation history for bounded context
    const previousMessages = await FutureSelfMessage.find({
        interviewId: interview._id,
    })
        .sort({ createdAt: 1 })
        .limit(20)
        .exec();

    const historyPayload = previousMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
    }));

    // Generate AI response
    const { response, spokenText, suggestedQuestions } = await generateFutureSelfChatResponseAI({
        profile: profile.generatedProfile,
        history: historyPayload,
        userMessage: content.trim(),
    });

    // Save assistant message
    const assistantMessage = await FutureSelfMessage.create({
        userId: new Types.ObjectId(userId),
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

/**
 * Concludes an interview and synthesizes a strategic decision summary with spoken guidance.
 */
export const completeInterviewService = async (
    userId: string,
    interviewId: string
): Promise<IFutureSelfInterview> => {
    const interview = await getInterviewByIdService(userId, interviewId);
    const profile = await FutureSelfProfile.findById(interview.futureSelfProfileId).exec();

    if (!profile) {
        throw new AppError("Linked profile not found.", 404);
    }

    // Build transcript
    const messages = await listMessagesService(userId, interviewId);
    const transcript = messages
        .map((m) => `${m.role === "user" ? "User" : "Future Self"}: ${m.content}`)
        .join("\n\n");

    const decisionSummary = await generateDecisionSummaryAI({
        profile: profile.generatedProfile,
        transcript,
    });

    interview.status = "completed";
    interview.decisionSummary = decisionSummary;
    await interview.save();

    return interview;
};

/**
 * Saves user's personal reflection notes on an interview.
 */
export const updateReflectionService = async (
    userId: string,
    interviewId: string,
    reflectionNotes: string
): Promise<IFutureSelfInterview> => {
    const interview = await getInterviewByIdService(userId, interviewId);
    interview.reflectionNotes = reflectionNotes.trim();
    await interview.save();
    return interview;
};

/**
 * Deletes an owned interview and its messages.
 */
export const deleteInterviewService = async (
    userId: string,
    interviewId: string
): Promise<void> => {
    const interview = await getInterviewByIdService(userId, interviewId);

    await FutureSelfMessage.deleteMany({ interviewId: interview._id });
    await FutureSelfInterview.deleteOne({ _id: interview._id });
};
