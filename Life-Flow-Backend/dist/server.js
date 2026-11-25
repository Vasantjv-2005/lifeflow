"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const decision_routes_1 = __importDefault(require("./routes/decision.routes"));
const scenario_routes_1 = __importDefault(require("./routes/scenario.routes"));
const simulation_routes_1 = __importDefault(require("./routes/simulation.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const futureSelf_routes_1 = __importDefault(require("./routes/futureSelf.routes"));
const resumeTimeMachine_routes_1 = __importDefault(require("./routes/resumeTimeMachine.routes"));
const notFound_middleware_1 = require("./middleware/notFound.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const PORT = env_1.env.PORT;
const allowedOrigins = (0, env_1.getAllowedClientOrigins)();
// Trust reverse proxy (Render / Vercel / Cloudflare) for secure cookies & rate limiting
app.set("trust proxy", 1);
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration supporting single or comma-separated CLIENT_URL origins
app.use((0, cors_1.default)({
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
}));
// Request parsing middleware
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, cookie_parser_1.default)());
// Health check
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "LifeFlow Backend is running successfully",
    });
});
// API routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/decisions", decision_routes_1.default);
app.use("/api/scenarios", scenario_routes_1.default);
app.use("/api/simulations", simulation_routes_1.default);
app.use("/api/ai", ai_routes_1.default);
app.use("/api/future-self", futureSelf_routes_1.default);
app.use("/api/resume-time-machine", resumeTimeMachine_routes_1.default);
// Not-found and error middleware must come after all routes.
app.use(notFound_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
// Start server after MongoDB connects successfully.
const startServer = async () => {
    try {
        await (0, db_1.default)();
        app.listen(PORT, () => {
            console.log(`LifeFlow Backend running at http://localhost:${PORT}`);
            console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
        });
    }
    catch (error) {
        console.error("Failed to start LifeFlow Backend:", error);
        process.exit(1);
    }
};
void startServer();
