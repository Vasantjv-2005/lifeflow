# LifeFlow Backend API

LifeFlow is an AI-powered decision simulation and life-path modeling platform. This backend service provides authentication, decision tracking, scenario analysis, graph-based simulation traversal, and OpenAI-compatible AI scenario generation.

---

## 🚀 Features

- **Authentication & Authorization**: Secure JWT authentication with HTTP-only cookies and Bearer token fallback, Bcrypt password hashing (12 salt rounds), and user management.
- **Simulation Engine**: Graph traversal engine with cycle detection, depth limits, branch exploration, and outcome identification for decision trees.
- **Decisions & Scenarios**: Full CRUD for structured life decisions, weighted factors, pros/cons, and scenarios (optimistic, realistic, pessimistic, custom).
- **AI Scenario Generation**: Integrates with OpenAI-compatible providers to generate realistic decision scenarios based on constraints, timeframes, and budget.
- **Robust Validation**: Comprehensive runtime schema validation using Zod for all requests, environment variables, and external AI responses.
- **Security & Reliability**: Helmet HTTP headers, CORS origin whitelisting, in-memory rate limiting, and centralized error handling.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+)
- **Language**: TypeScript (v5.9+)
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose (v9)
- **Validation**: Zod (v4)
- **Security**: Helmet, CORS, Cookie-Parser, Bcrypt.js, JsonWebToken
- **Testing**: Built-in Node test runner with TypeScript

---

## 📁 Project Structure

```
Life-Flow-Backend/
├── src/
│   ├── config/
│   │   ├── db.ts               # MongoDB connection & collection initialization
│   │   └── env.ts              # Zod-validated environment configuration
│   ├── controllers/
│   │   ├── ai.controller.ts    # AI scenario generation controller
│   │   ├── auth.controller.ts  # Auth controllers (register, login, logout, me)
│   │   ├── decision.controller.ts # Decision CRUD controller
│   │   ├── scenario.controller.ts # Scenario CRUD & batch controller
│   │   ├── simulation.controller.ts # Simulation CRUD & execution controller
│   │   └── user.controller.ts  # User profile & account management
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT extraction & verification
│   │   ├── error.middleware.ts # Centralized error handler
│   │   ├── notFound.middleware.ts # 404 handler
│   │   └── rateLimit.middleware.ts # In-memory rate limiting
│   ├── models/
│   │   ├── Decision.ts         # Decision schema & model
│   │   ├── Scenario.ts         # Scenario schema & model
│   │   ├── Simulation.ts       # Graph simulation (nodes & edges) model
│   │   └── User.ts             # User account schema & model
│   ├── routes/
│   │   ├── ai.routes.ts        # /api/ai routes
│   │   ├── auth.routes.ts      # /api/auth routes
│   │   ├── decision.routes.ts  # /api/decisions routes
│   │   ├── scenario.routes.ts  # /api/scenarios routes
│   │   ├── simulation.routes.ts # /api/simulations routes
│   │   └── user.routes.ts      # /api/users routes
│   ├── services/
│   │   ├── ai/                 # AI prompt generation & external API integration
│   │   ├── auth/               # User registration, login & JWT generation
│   │   ├── scenario/           # Scenario business logic & batch creation
│   │   ├── simulation/         # Simulation CRUD & graph traversal engine
│   │   └── user/               # Profile updates, password changes & cascading deletion
│   ├── types/                  # Shared TypeScript interfaces & types
│   ├── utils/                  # Reusable utilities (JWT, password, API responses)
│   ├── validators/             # Zod input validation schemas
│   └── server.ts               # Express application entry point
├── tests/
│   ├── auth.utils.test.ts      # Auth & password utility tests
│   ├── simulation.engine.test.ts # Graph traversal engine tests
│   ├── validators.test.ts      # Schema validator tests
│   └── index.ts                # Main test suite runner
├── .env.example                # Example environment variables
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection connection string | *Required* |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 8 chars) | *Required* |
| `JWT_EXPIRES_IN` | JWT expiration timeframe | `7d` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |
| `AI_API_URL` | OpenAI-compatible chat completion URL | `https://api.openai.com/v1/chat/completions` |
| `AI_API_KEY` | API key for AI provider | *Optional (required for AI)* |
| `AI_MODEL` | AI model identifier | `gpt-4o-mini` |

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Run the development server with hot-reload:
```bash
npm run dev
```

### 3. Run Tests
Execute the unit and integration test suite:
```bash
npm test
```

### 4. Production Build & Start
Compile TypeScript to `dist/` and start the server:
```bash
npm run build
npm start
```

---

## 📡 API Reference

### Health Check
- `GET /` — API health check.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`{ name, email, password }`).
- `POST /api/auth/login` — Sign in (`{ email, password }`).
- `POST /api/auth/logout` — Clear auth cookie.
- `GET /api/auth/me` — Get authenticated user details.

### User Profile (`/api/users`)
- `GET /api/users/me` — Get user profile.
- `PATCH /api/users/me` — Update user profile details (`{ name }`).
- `PATCH /api/users/me/password` — Change password (`{ currentPassword, newPassword }`).
- `DELETE /api/users/me` — Delete account and cascade-delete all user decisions, simulations, and scenarios.

### Simulations (`/api/simulations`)
- `POST /api/simulations` — Create a decision simulation with canvas nodes and edges.
- `GET /api/simulations` — List simulations for the authenticated user.
- `GET /api/simulations/:id` — Get simulation by ID.
- `PATCH /api/simulations/:id` — Update simulation graph or details.
- `DELETE /api/simulations/:id` — Delete simulation.
- `POST /api/simulations/:id/run` — **Execute graph simulation engine on a saved simulation** (traverses all possible paths to terminal outcomes).
- `POST /api/simulations/run` — **Execute ad-hoc simulation engine** on raw `{ nodes, edges }` (evaluates graphs directly without saving).

### Scenarios (`/api/scenarios`)
- `POST /api/scenarios` — Create a scenario for a simulation.
- `POST /api/scenarios/batch` — Batch create multiple scenarios (e.g. persisting AI-generated scenarios).
- `GET /api/scenarios/simulation/:simulationId` — List all scenarios for a simulation.
- `GET /api/scenarios/:id` — Get scenario by ID.
- `PATCH /api/scenarios/:id` — Update scenario.
- `DELETE /api/scenarios/:id` — Delete scenario.

### Decisions (`/api/decisions`)
- `POST /api/decisions` — Create a decision with factors and options.
- `GET /api/decisions` — List decisions for the authenticated user.
- `GET /api/decisions/:id` — Get decision by ID.
- `PATCH /api/decisions/:id` — Update decision.
- `DELETE /api/decisions/:id` — Delete decision.

### AI Integration (`/api/ai`)
- `POST /api/ai/generate-scenarios` — Generate structured optimistic, realistic, and pessimistic decision scenarios using AI (`{ decisionTitle, category, goal, budget, timeAvailable }`).

