import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
    createProfile,
    listProfiles,
    getProfileById,
    deleteProfile,
    createInterview,
    listInterviews,
    getInterviewById,
    listMessages,
    sendMessage,
    completeInterview,
    updateReflection,
    deleteInterview,
} from "../controllers/futureSelf.controller";

const router = Router();

// All future-self endpoints require authentication
router.use(authMiddleware);

// Profile endpoints
router.post("/profiles", createProfile);
router.get("/profiles", listProfiles);
router.get("/profiles/:id", getProfileById);
router.delete("/profiles/:id", deleteProfile);

// Interview session endpoints
router.post("/interviews", createInterview);
router.get("/interviews", listInterviews);
router.get("/interviews/:id", getInterviewById);
router.delete("/interviews/:id", deleteInterview);

// Message endpoints
router.get("/interviews/:id/messages", listMessages);
router.post("/interviews/:id/messages", sendMessage);

// Decision summary & reflections
router.post("/interviews/:id/complete", completeInterview);
router.patch("/interviews/:id/reflection", updateReflection);

export default router;
