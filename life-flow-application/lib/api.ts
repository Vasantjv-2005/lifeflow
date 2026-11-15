import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("lifeflow-token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("lifeflow-token")
      window.dispatchEvent(new CustomEvent("lifeflow:unauthorized"))
    }
    return Promise.reject(error)
  },
)

// Helper to normalize MongoDB documents so they always have `id`
export const normalizeDoc = <T extends Record<string, unknown>>(doc: T): T & { id: string } => {
  if (!doc) return doc as T & { id: string }
  const id = (doc._id || doc.id || "") as string
  return { ...doc, id }
}

export type DecisionFactor = {
  name: string
  description?: string
  importance: "low" | "medium" | "high"
}

export type DecisionOption = {
  name: string
  description?: string
  pros: string[]
  cons: string[]
}

export type Decision = {
  id: string
  _id?: string
  userId?: string
  title: string
  description?: string
  category: string
  goal: string
  currentSituation?: string
  timeAvailable?: number
  budget?: number
  status: "draft" | "active" | "completed"
  factors?: DecisionFactor[]
  options?: DecisionOption[]
  simulationId?: string
  createdAt?: string
  updatedAt?: string
}

export type SimulationNode = {
  nodeId: string
  type: "start" | "decision" | "action" | "outcome"
  title: string
  description?: string
  position: { x: number; y: number }
}

export type SimulationEdge = {
  edgeId: string
  source: string
  target: string
  label?: string
  condition?: string
}

export type Simulation = {
  id: string
  _id?: string
  userId?: string
  title: string
  description?: string
  category: string
  goal: string
  status: "draft" | "active" | "completed"
  nodes: SimulationNode[]
  edges: SimulationEdge[]
  createdAt?: string
  updatedAt?: string
}

export type ScenarioStep = {
  stepNumber: number
  title: string
  description: string
  timeframe?: string
}

export type ScenarioOutcome = {
  title: string
  description: string
  probability?: number
  impact: "low" | "medium" | "high"
}

export type Scenario = {
  id?: string
  _id?: string
  simulationId?: string
  name: string
  description?: string
  type: "optimistic" | "realistic" | "pessimistic" | "custom"
  score?: number
  riskLevel: "low" | "medium" | "high"
  steps?: ScenarioStep[]
  outcomes?: ScenarioOutcome[]
  isSelected?: boolean
}

export type SimulationPathStep = {
  nodeId: string
  type: "start" | "decision" | "action" | "outcome"
  title: string
  description?: string
  edgeLabel?: string
  condition?: string
}

export type SimulationPath = {
  pathId: string
  steps: SimulationPathStep[]
  outcome: SimulationNode
  totalSteps: number
}

export type SimulationEngineResult = {
  startNodeId: string
  paths: SimulationPath[]
  totalPaths: number
}

export type User = {
  id: string
  _id?: string
  name: string
  email: string
  profilePicture?: string
  authProvider?: "local" | "google" | "github"
  googleId?: string
  githubId?: string
  emailVerified?: boolean
  createdAt?: string
}

export const getGoogleAuthUrl = (promptSelect: boolean = true) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  return `${base}/auth/google${promptSelect ? "?prompt=select_account" : ""}`
}

export const getGithubAuthUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  return `${base}/auth/github`
}

// ==================== AUTH API ====================
export const register = async (data: { name: string; email: string; password: string }) => {
  const res = await api.post("/auth/register", data)
  return res.data.data as { user: User; token: string }
}

export const login = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data)
  return res.data.data as { user: User; token: string }
}

export const logout = async () => {
  return (await api.post("/auth/logout")).data
}

export const getCurrentUser = async (): Promise<User> => {
  const res = await api.get("/auth/me")
  return normalizeDoc(res.data.data.user)
}

// ==================== USER PROFILE API ====================
export const getUserProfile = async (): Promise<User> => {
  const res = await api.get("/users/me")
  return normalizeDoc(res.data.data.user)
}

export const updateUserProfile = async (data: { name: string }): Promise<User> => {
  const res = await api.patch("/users/me", data)
  return normalizeDoc(res.data.data.user)
}

export const changeUserPassword = async (data: { currentPassword: string; newPassword: string }) => {
  return (await api.patch("/users/me/password", data)).data
}

export const deleteUserAccount = async () => {
  return (await api.delete("/users/me")).data
}

// ==================== DECISIONS API ====================
export const getDecisions = async (): Promise<Decision[]> => {
  const res = await api.get("/decisions")
  const list = res.data.data?.decisions || []
  return list.map((item: Record<string, unknown>) => normalizeDoc(item) as Decision)
}

export const getDecisionById = async (id: string): Promise<Decision> => {
  const res = await api.get(`/decisions/${id}`)
  return normalizeDoc(res.data.data.decision) as Decision
}

export const createDecision = async (data: Partial<Decision>): Promise<Decision> => {
  const res = await api.post("/decisions", data)
  return normalizeDoc(res.data.data.decision) as Decision
}

export const updateDecision = async (id: string, data: Partial<Decision>): Promise<Decision> => {
  const res = await api.patch(`/decisions/${id}`, data)
  return normalizeDoc(res.data.data.decision) as Decision
}

export const deleteDecision = async (id: string) => {
  return (await api.delete(`/decisions/${id}`)).data
}

// ==================== SIMULATIONS API ====================
export const getSimulations = async (): Promise<Simulation[]> => {
  const res = await api.get("/simulations")
  const list = res.data.data?.simulations || []
  return list.map((item: Record<string, unknown>) => normalizeDoc(item) as Simulation)
}

export const getSimulationById = async (id: string): Promise<Simulation> => {
  const res = await api.get(`/simulations/${id}`)
  return normalizeDoc(res.data.data.simulation) as Simulation
}

export const createSimulation = async (data: Partial<Simulation>): Promise<Simulation> => {
  const res = await api.post("/simulations", data)
  return normalizeDoc(res.data.data.simulation) as Simulation
}

export const updateSimulation = async (id: string, data: Partial<Simulation>): Promise<Simulation> => {
  const res = await api.patch(`/simulations/${id}`, data)
  return normalizeDoc(res.data.data.simulation) as Simulation
}

export const deleteSimulation = async (id: string) => {
  return (await api.delete(`/simulations/${id}`)).data
}

export const runSimulationById = async (
  id: string,
  options?: { maxPaths?: number; maxDepth?: number },
): Promise<SimulationEngineResult> => {
  const res = await api.post(`/simulations/${id}/run`, options || {})
  return res.data.data as SimulationEngineResult
}

export const runAdHocSimulation = async (payload: {
  nodes: SimulationNode[]
  edges: SimulationEdge[]
  maxPaths?: number
  maxDepth?: number
}): Promise<SimulationEngineResult> => {
  const res = await api.post("/simulations/run", payload)
  return res.data.data as SimulationEngineResult
}

// ==================== SCENARIOS API ====================
export const getScenariosForSimulation = async (simulationId: string): Promise<Scenario[]> => {
  const res = await api.get(`/scenarios/simulation/${simulationId}`)
  const list = res.data.data?.scenarios || []
  return list.map((item: Record<string, unknown>) => normalizeDoc(item) as Scenario)
}

export const createBatchScenarios = async (simulationId: string, scenarios: Scenario[]): Promise<Scenario[]> => {
  const res = await api.post("/scenarios/batch", { simulationId, scenarios })
  const list = res.data.data?.scenarios || []
  return list.map((item: Record<string, unknown>) => normalizeDoc(item) as Scenario)
}

// ==================== AI API ====================
export const generateScenarios = async (data: {
  decisionTitle: string
  category: string
  goal: string
  currentSituation?: string
  timeAvailable?: number
  budget?: number
  additionalContext?: string
}): Promise<{ scenarios: Scenario[] }> => {
  const res = await api.post("/ai/generate-scenarios", data)
  return res.data.data as { scenarios: Scenario[] }
}
