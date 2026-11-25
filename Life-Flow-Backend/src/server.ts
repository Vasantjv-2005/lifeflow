
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env, getAllowedClientOrigins } from "./config/env";
import connectDB from "./config/db";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import decisionRoutes from "./routes/decision.routes";
import scenarioRoutes from "./routes/scenario.routes";
import simulationRoutes from "./routes/simulation.routes";
import aiRoutes from "./routes/ai.routes";
import futureSelfRoutes from "./routes/futureSelf.routes";
import resumeTimeMachineRoutes from "./routes/resumeTimeMachine.routes";

import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

const PORT = env.PORT;
const allowedOrigins = getAllowedClientOrigins();

// Trust reverse proxy (Render / Vercel / Cloudflare) for secure cookies & rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS configuration supporting single or comma-separated CLIENT_URL origins
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            const normalizedOrigin = origin.replace(/\/+$/, "");
            if (allowedOrigins.includes(normalizedOrigin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    })
);

// Request parsing middleware
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Health check
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "LifeFlow Backend is running successfully",
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/decisions", decisionRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/simulations", simulationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/future-self", futureSelfRoutes);
app.use("/api/resume-time-machine", resumeTimeMachineRoutes);

// Not-found and error middleware must come after all routes.
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server after MongoDB connects successfully.
const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`LifeFlow Backend running at http://localhost:${PORT}`);
            console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
        });
    } catch (error: unknown) {
        console.error("Failed to start LifeFlow Backend:", error);
        process.exit(1);
    }
};

void startServer();
