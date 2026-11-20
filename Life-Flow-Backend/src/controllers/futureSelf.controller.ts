import { Request, Response, NextFunction } from "express";
import {
    createFutureSelfProfileSchema,
    createInterviewSchema,
    sendMessageSchema,
    updateReflectionSchema,
} from "../validators/futureSelf.validator";
import {
    createFutureSelfProfileService,
    listProfilesService,
    getProfileByIdService,
    deleteProfileService,
    createInterviewService,
    listInterviewsService,
    getInterviewByIdService,
    listMessagesService,
    sendMessageService,
    completeInterviewService,
    updateReflectionService,
    deleteInterviewService,
} from "../services/futureSelf/futureSelf.service";
import { sendSuccess } from "../utils/apiResponse";

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

const getUserId = (req: Request): string => {
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) {
        throw new Error("Authentication required.");
    }
    return userId;
};

// POST /api/future-self/profiles
export const createProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const parsed = createFutureSelfProfileSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }

        const profile = await createFutureSelfProfileService(userId, parsed.data);
        sendSuccess(res, "Future Self Profile created successfully.", { profile }, 201);
    } catch (error) {
        next(error);
    }
};

// GET /api/future-self/profiles
export const listProfiles = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const profiles = await listProfilesService(userId);
        sendSuccess(res, "Profiles retrieved successfully.", { profiles });
    } catch (error) {
        next(error);
    }
};

// GET /api/future-self/profiles/:id
export const getProfileById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const profileId = typeof req.params.id === "string" ? req.params.id : "";
        const profile = await getProfileByIdService(userId, profileId);
        sendSuccess(res, "Profile retrieved successfully.", { profile });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/future-self/profiles/:id
export const deleteProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const profileId = typeof req.params.id === "string" ? req.params.id : "";
        await deleteProfileService(userId, profileId);
        sendSuccess(res, "Profile and associated sessions deleted successfully.", null);
    } catch (error) {
        next(error);
    }
};

// POST /api/future-self/interviews
export const createInterview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const parsed = createInterviewSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }

        const result = await createInterviewService(userId, parsed.data);
        sendSuccess(res, "Interview session initiated successfully.", result, 201);
    } catch (error) {
        next(error);
    }
};

// GET /api/future-self/interviews
export const listInterviews = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

        const result = await listInterviewsService(userId, page, limit);
        sendSuccess(res, "Interviews retrieved successfully.", result);
    } catch (error) {
        next(error);
    }
};

// GET /api/future-self/interviews/:id
export const getInterviewById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const interview = await getInterviewByIdService(userId, interviewId);
        sendSuccess(res, "Interview retrieved successfully.", { interview });
    } catch (error) {
        next(error);
    }
};

// GET /api/future-self/interviews/:id/messages
export const listMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const messages = await listMessagesService(userId, interviewId);
        sendSuccess(res, "Messages retrieved successfully.", { messages });
    } catch (error) {
        next(error);
    }
};

// POST /api/future-self/interviews/:id/messages
export const sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const parsed = sendMessageSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }

        const result = await sendMessageService(userId, interviewId, parsed.data.content);
        sendSuccess(res, "Message sent and response generated.", result);
    } catch (error) {
        next(error);
    }
};

// POST /api/future-self/interviews/:id/complete
export const completeInterview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const interview = await completeInterviewService(userId, interviewId);
        sendSuccess(res, "Interview completed and decision summary synthesized.", { interview });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/future-self/interviews/:id/reflection
export const updateReflection = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        const parsed = updateReflectionSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: parsed.error.issues,
            });
            return;
        }

        const interview = await updateReflectionService(userId, interviewId, parsed.data.reflectionNotes);
        sendSuccess(res, "Personal reflection saved.", { interview });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/future-self/interviews/:id
export const deleteInterview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const interviewId = typeof req.params.id === "string" ? req.params.id : "";
        await deleteInterviewService(userId, interviewId);
        sendSuccess(res, "Interview deleted successfully.", null);
    } catch (error) {
        next(error);
    }
};
