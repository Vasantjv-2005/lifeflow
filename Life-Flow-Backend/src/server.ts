
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import connectDB from "./config/db";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import decisionRoutes from "./routes/decision.routes";
import scenarioRoutes from "./routes/scenario.routes";
import simulationRoutes from "./routes/simulation.routes";
import aiRoutes from "./routes/ai.routes";

import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

const PORT = env.PORT;
const CLIENT_URL = env.CLIENT_URL;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: CLIENT_URL,
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

// Not-found and error middleware must come after all routes.
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server after MongoDB connects successfully.
const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`LifeFlow Backend running at http://localhost:${PORT}`);
            console.log(`Allowed frontend origin: ${CLIENT_URL}`);
        });
    } catch (error: unknown) {
        console.error("Failed to start LifeFlow Backend:", error);
        process.exit(1);
    }
};

void startServer();
