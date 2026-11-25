import axios from "axios"

const DEFAULT_BACKEND_URL = "https://lifeflow-1-qzfb.onrender.com"

const resolveApiBaseUrl = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, "")
  return raw.endsWith("/api") ? raw : `${raw}/api`
}

export const API_BASE_URL = resolveApiBaseUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
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
  whatToDo?: string
  howToDoIt?: string
  targetResult?: string
  completionCheck?: string
}

export type ScenarioOutcome = {
  title: string
  description: string
  likelihood?: string
  probability?: number
  impact: "low" | "medium" | "high"
  userControls?: string
  dependsOnOthersOrMarket?: string
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
  expectedTimeline?: string
  advantages?: string[]
  challenges?: string[]
  requiredResources?: string[]
  backupPlan?: string
  steps?: ScenarioStep[]
  outcomes?: ScenarioOutcome[]
  learningRoadmap?: LearningRoadmap
  interviewPreparation?: InterviewPreparation
  opportunitiesAndBackup?: OpportunitiesAndBackup
  isSelected?: boolean
}

export type DecisionOverview = {
  yourDecision: string
  whatWeKnow: string
  assumptions: string[]
  missingDetails?: string[]
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
  const params = new URLSearchParams()
  if (promptSelect) params.set("prompt", "select_account")
  if (typeof window !== "undefined") {
    params.set("redirect_origin", window.location.origin)
  }
  const qs = params.toString()
  return `${API_BASE_URL}/auth/google${qs ? `?${qs}` : ""}`
}

export const getGithubAuthUrl = () => {
  const params = new URLSearchParams()
  if (typeof window !== "undefined") {
    params.set("redirect_origin", window.location.origin)
  }
  const qs = params.toString()
  return `${API_BASE_URL}/auth/github${qs ? `?${qs}` : ""}`
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
  skills?: string
  experience?: string
  challenges?: string
  additionalContext?: string
}): Promise<{ decisionOverview?: DecisionOverview; scenarios: Scenario[] }> => {
  const res = await api.post("/ai/generate-scenarios", data)
  return res.data.data as { decisionOverview?: DecisionOverview; scenarios: Scenario[] }
}

// ==================== FUTURE SELF INTERVIEW API ====================
export type GeneratedFutureProfile = {
  introduction: string
  timeHorizon: string
  futureLifestyle: string
  possibleAchievements: string[]
  developedHabits: string[]
  challenges: string[]
  lessons: string[]
  possibleRegrets: string[]
  turningPoints: string[]
  advice: string[]
  nextActions: string[]
  assumptions: string[]
  uncertainties: string[]
}

export type FutureSelfProfile = {
  id: string
  _id?: string
  userId?: string
  title: string
  timeHorizon: "6 months" | "1 year" | "3 years" | "5 years" | "10 years"
  lifeAreas: string[]
  currentSituation: string
  currentHabits?: string
  strengths?: string
  challenges?: string
  responsibilities?: string
  futureGoals: string
  desiredIdentity?: string
  desiredHabits?: string
  concerns?: string
  availableTime: string
  monthlyBudget?: string
  currentSkills?: string
  availableSupport?: string
  constraints?: string
  generatedProfile: GeneratedFutureProfile
  status: "active" | "archived"
  createdAt?: string
  updatedAt?: string
}

export type DecisionSummary = {
  benefits: string[]
  risks: string[]
  tradeOffs: string[]
  nextSteps: string[]
  fullSummary: string
  spokenText: string
  generatedAt?: string
}

export type FutureSelfInterview = {
  id: string
  _id?: string
  userId?: string
  futureSelfProfileId: string | FutureSelfProfile
  title: string
  status: "active" | "completed"
  startedAt?: string
  lastMessageAt?: string
  decisionSummary?: DecisionSummary
  reflectionNotes?: string
  createdAt?: string
  updatedAt?: string
}

export type FutureSelfMessage = {
  id: string
  _id?: string
  userId?: string
  interviewId: string
  role: "user" | "assistant"
  content: string
  metadata?: {
    spokenTranscript?: string
    tokens?: number
    suggestedQuestions?: string[]
  }
  createdAt?: string
  updatedAt?: string
}

export const createFutureSelfProfile = async (data: {
  title?: string
  timeHorizon: "6 months" | "1 year" | "3 years" | "5 years" | "10 years"
  lifeAreas: string[]
  currentSituation: string
  currentHabits?: string
  strengths?: string
  challenges?: string
  responsibilities?: string
  futureGoals: string
  desiredIdentity?: string
  desiredHabits?: string
  concerns?: string
  availableTime: string
  monthlyBudget?: string
  currentSkills?: string
  availableSupport?: string
  constraints?: string
}): Promise<FutureSelfProfile> => {
  const res = await api.post("/future-self/profiles", data)
  return normalizeDoc(res.data.data.profile) as FutureSelfProfile
}

export const getFutureSelfProfiles = async (): Promise<FutureSelfProfile[]> => {
  const res = await api.get("/future-self/profiles")
  const list = res.data.data?.profiles || []
  return list.map((item: Record<string, unknown>) => normalizeDoc(item) as FutureSelfProfile)
}

export const getFutureSelfProfile = async (id: string): Promise<FutureSelfProfile> => {
  const res = await api.get(`/future-self/profiles/${id}`)
  return normalizeDoc(res.data.data.profile) as FutureSelfProfile
}

export const deleteFutureSelfProfile = async (id: string) => {
  return (await api.delete(`/future-self/profiles/${id}`)).data
}

export const createFutureSelfInterview = async (data: {
  futureSelfProfileId: string
  title?: string
}): Promise<{ interview: FutureSelfInterview; openingMessage: FutureSelfMessage }> => {
  const res = await api.post("/future-self/interviews", data)
  return {
    interview: normalizeDoc(res.data.data.interview) as FutureSelfInterview,
    openingMessage: normalizeDoc(res.data.data.openingMessage) as FutureSelfMessage,
  }
}

export const getFutureSelfInterviews = async (
  page = 1,
  limit = 20
): Promise<{ interviews: FutureSelfInterview[]; total: number; page: number; totalPages: number }> => {
  const res = await api.get(`/future-self/interviews?page=${page}&limit=${limit}`)
  const rawList = res.data.data?.interviews || []
  const interviews = rawList.map((item: Record<string, unknown>) => normalizeDoc(item) as FutureSelfInterview)
  return {
    interviews,
    total: res.data.data?.total || 0,
    page: res.data.data?.page || 1,
    totalPages: res.data.data?.totalPages || 1,
  }
}

export const getFutureSelfInterview = async (id: string): Promise<FutureSelfInterview> => {
  const res = await api.get(`/future-self/interviews/${id}`)
  return normalizeDoc(res.data.data.interview) as FutureSelfInterview
}

export const getFutureSelfMessages = async (interviewId: string): Promise<FutureSelfMessage[]> => {
  const res = await api.get(`/future-self/interviews/${interviewId}/messages`)
  const list = res.data.data?.messages || []
  return list.map((item: Record<string, unknown>) => normalizeDoc(item) as FutureSelfMessage)
}

export const sendFutureSelfMessage = async (
  interviewId: string,
  content: string
): Promise<{ userMessage: FutureSelfMessage; assistantMessage: FutureSelfMessage }> => {
  const res = await api.post(`/future-self/interviews/${interviewId}/messages`, { content })
  return {
    userMessage: normalizeDoc(res.data.data.userMessage) as FutureSelfMessage,
    assistantMessage: normalizeDoc(res.data.data.assistantMessage) as FutureSelfMessage,
  }
}

export const completeFutureSelfInterview = async (interviewId: string): Promise<FutureSelfInterview> => {
  const res = await api.post(`/future-self/interviews/${interviewId}/complete`)
  return normalizeDoc(res.data.data.interview) as FutureSelfInterview
}

export const updateFutureSelfReflection = async (
  interviewId: string,
  reflectionNotes: string
): Promise<FutureSelfInterview> => {
  const res = await api.patch(`/future-self/interviews/${interviewId}/reflection`, { reflectionNotes })
  return normalizeDoc(res.data.data.interview) as FutureSelfInterview
}

export const deleteFutureSelfInterview = async (interviewId: string) => {
  return (await api.delete(`/future-self/interviews/${interviewId}`)).data
}

// ==================== AI DECISION ADVISOR & SCENARIO COMPARISON API ====================
export interface AdvisorMessage {
  id: string
  decisionId: string
  role: "user" | "assistant"
  content: string
  suggestedQuestions?: string[]
  createdAt: string
}

export interface ScenarioComparisonColumn {
  type: "optimistic" | "realistic" | "pessimistic" | "custom"
  name: string
  description: string
  riskLevel: "low" | "medium" | "high"
  timeRequired: {
    completionTime: string
    milestones: string[]
    dailyCommitment: string
  }
  estimatedCost: {
    budgetRange: string
    keyExpenses: string[]
    lowCostAlternatives: string
  }
  difficulty: {
    level: "Beginner-Friendly" | "Intermediate" | "Advanced"
    reason: string
  }
  potentialOutcomes: {
    achievements: string[]
    expectedProgress: string
    opportunities: string[]
  }
  majorRisks: {
    challenges: string[]
    possibleDelays: string
    backupPlan: string
  }
  requiredSkills: {
    skillsNeeded: string[]
    foundationalSkills: string[]
    skillsToDevelop: string[]
  }
}

export interface ScenarioComparisonDashboard {
  decisionTitle: string
  category: string
  goal: string
  scenarios: ScenarioComparisonColumn[]
  generatedAt: string
}

export const sendAdvisorMessage = async (
  decisionId: string,
  message: string
): Promise<{ userMessage: AdvisorMessage; assistantMessage: AdvisorMessage; suggestedQuestions?: string[] }> => {
  const res = await api.post(`/decisions/${decisionId}/advisor/chat`, { message })
  return {
    userMessage: normalizeDoc(res.data.data.userMessage) as unknown as AdvisorMessage,
    assistantMessage: normalizeDoc(res.data.data.assistantMessage) as unknown as AdvisorMessage,
    suggestedQuestions: res.data.data.suggestedQuestions || [],
  }
}

export const getAdvisorHistory = async (decisionId: string): Promise<AdvisorMessage[]> => {
  const res = await api.get(`/decisions/${decisionId}/advisor/history`)
  const list = res.data.data?.messages || []
  return list.map((item: Record<string, unknown>) => normalizeDoc(item) as unknown as AdvisorMessage)
}

export const clearAdvisorHistory = async (decisionId: string): Promise<void> => {
  await api.delete(`/decisions/${decisionId}/advisor/history`)
}

export const getScenarioComparison = async (decisionId: string): Promise<ScenarioComparisonDashboard> => {
  const res = await api.get(`/decisions/${decisionId}/scenarios/comparison`)
  return res.data.data.comparison as ScenarioComparisonDashboard
}

// ==================== CAREER SCENARIO TYPES & APIS ====================
export interface LearningRoadmapStage {
  stageNumber: number
  title: string
  timeframe: string
  skillsToMaster: string[]
  coreConcepts: string[]
  technologiesAndTools: string[]
  practicalExercises: string[]
  handsOnLabs: string[]
  recommendedResources: Array<{
    title: string
    provider: string
    url?: string
    isFree?: boolean
  }>
  milestone: string
}

export interface LearningRoadmap {
  targetRole: string
  estimatedLearningTime: string
  dailyCommitment: string
  overview: string
  stages: LearningRoadmapStage[]
}

export interface InterviewSubject {
  subjectName: string
  importantTopics: string[]
  detailedSubtopics: string[]
  whatToUnderstand: string
  practicalExercises: string[]
  interviewQuestions: Array<{
    question: string
    answerHint?: string
    type: "technical" | "scenario" | "hr"
  }>
  expectedKnowledgeLevel: "Beginner" | "Intermediate" | "Advanced"
  checklist: string[]
}

export interface InterviewPreparation {
  targetRole: string
  overview: string
  subjects: InterviewSubject[]
  frequentlyTestedConcepts: string[]
  hrInterviewQuestions: Array<{
    question: string
    guidance: string
  }>
  resumeChecklist: string[]
  mockInterviewPractice: string
}

export interface PracticalProject {
  name: string
  level: "Beginner" | "Intermediate" | "Advanced"
  problemSolved: string
  technologies: string[]
  skillsDemonstrated: string[]
  implementationSteps: string[]
  expectedOutput: string
  githubRecommendations: string
}

export interface JobListing {
  title: string
  company: string
  platform: "LinkedIn" | "Naukri" | "Wellfound"
  location: string
  employmentType: string
  experienceLevel: string
  requiredSkills: string[]
  postedDate: string
  applicationUrl: string
  lastVerifiedDate: string
  isVerifiedListing: boolean
  descriptionSnippet?: string
}

export interface JobMarketAnalysis {
  mostRequestedSkills: string[]
  commonQualifications: string[]
  commonTools: string[]
  experienceRequirements: string
  internshipAvailability: string
  commonJobTitles: string[]
  locationTrends: string
  userSkillGaps: string[]
}

export interface AlternativeCareerRoute {
  role: string
  description: string
  howItHelpsProgression: string
}

export interface RecoveryStrategy {
  reasonsForStruggle: string[]
  resumeImprovements: string[]
  additionalProjects: string[]
  missingTechnicalSkills: string[]
  networkingAndPortfolioTips: string[]
  thirtyDayActionPlan: string[]
}

export interface OpportunitiesAndBackup {
  targetRole: string
  overview: string
  projects: PracticalProject[]
  internshipOpportunities: JobListing[]
  jobMarketAnalysis: JobMarketAnalysis
  alternativeRoutes: AlternativeCareerRoute[]
  recoveryStrategy: RecoveryStrategy
}

export const fetchCareerJobs = async (
  role: string,
  location?: string
): Promise<{ jobs: JobListing[]; marketAnalysis: JobMarketAnalysis }> => {
  const params = new URLSearchParams({ role })
  if (location) params.append("location", location)
  const res = await api.get(`/ai/career-jobs?${params.toString()}`)
  return {
    jobs: res.data.data.jobs || [],
    marketAnalysis: res.data.data.marketAnalysis,
  }
}

// ==================== RESUME TIME MACHINE TYPES & APIS ====================

export interface ParsedPersonalInfo {
  fullName?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  portfolio?: string
}

export interface ParsedEducation {
  institution: string
  degree: string
  fieldOfStudy?: string
  startDate?: string
  endDate?: string
  gpa?: string
}

export interface ParsedExperience {
  company: string
  role: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  description?: string
  achievements?: string[]
}

export interface ParsedProject {
  name: string
  description: string
  technologies: string[]
  link?: string
  highlights?: string[]
  isPlanned?: boolean
}

export interface ParsedCertification {
  name: string
  issuer: string
  issueDate?: string
  credentialId?: string
  isPlanned?: boolean
}

export interface ParsedResumeContent {
  personalInfo: ParsedPersonalInfo
  summary?: string
  education: ParsedEducation[]
  experience: ParsedExperience[]
  skills: string[]
  technicalTools: string[]
  projects: ParsedProject[]
  certifications: ParsedCertification[]
  languages?: string[]
  achievements?: string[]
}

export interface ResumeRecord {
  _id: string
  id: string
  userId: string
  originalFileName: string
  fileType: "pdf" | "docx"
  fileSize: number
  parsedContent: ParsedResumeContent
  rawText: string
  parsingStatus: "pending" | "completed" | "failed"
  parsingError?: string
  createdAt: string
  updatedAt: string
}

export interface SkillGap {
  skill: string
  category: "technical" | "tool" | "soft" | "domain"
  priority: "high" | "medium" | "low"
  reason: string
}

export interface ReadinessAssessment {
  score: number
  criteriaExplanation: string
  summary: string
  recommendedFocusAreas: string[]
}

export interface ResumeAnalysis {
  _id: string
  id: string
  userId: string
  resumeId: string
  targetCareer: string
  targetRoleLevel: "entry" | "junior" | "mid" | "senior"
  timelineMonths: 3 | 6 | 12
  weeklyHoursAvailable: number
  currentExperienceLevel: "beginner" | "intermediate" | "advanced"
  preferredIndustry?: string
  strengths: string[]
  existingDemonstratedSkills: string[]
  skillsNeedingImprovement: string[]
  skillGaps: SkillGap[]
  experienceGaps: string[]
  portfolioRecommendations: string[]
  certificationRecommendations: string[]
  readinessAssessment: ReadinessAssessment
  createdAt: string
}

export interface RoadmapPhase {
  phaseNumber: number
  title: string
  description: string
  durationWeeks: number
  milestoneCount: number
}

export interface ResumeRoadmap {
  _id: string
  id: string
  userId: string
  resumeId: string
  analysisId: string
  targetCareer: string
  targetTimelineMonths: 3 | 6 | 12
  phases: RoadmapPhase[]
  totalMilestones: number
  completedMilestones: number
  overallProgressPercentage: number
  createdAt: string
  updatedAt: string
}

export interface ResumeMilestoneResource {
  title: string
  url: string
  type: "course" | "documentation" | "tutorial" | "book" | "lab"
  provider?: string
  badge?: string
}

export interface ResumeMilestone {
  _id: string
  id: string
  userId: string
  roadmapId: string
  resumeId: string
  phaseNumber: number
  phaseTitle: string
  title: string
  description: string
  category: "technical" | "soft" | "project" | "certification" | "portfolio" | "interview"
  requiredSkills: string[]
  learningObjectives: string[]
  recommendedResources: ResumeMilestoneResource[]
  practicalActivities: string[]
  expectedDeliverable: string
  estimatedDurationWeeks: number
  priority: "high" | "medium" | "low"
  dependencies: string[]
  completionCriteria: string
  status: "planned" | "in_progress" | "completed"
  completionDescription?: string
  evidenceUrl?: string
  completedAt?: string
  createdAt: string
}

export interface ProjectedAchievement {
  milestoneId?: string
  title: string
  category: string
  plannedOrAchieved: "planned" | "achieved"
  monthTarget: number
  description: string
}

export interface FoundationsGuide {
  coreConcepts: string[]
  toolsAndLanguages: string[]
  milestones: Array<{
    title: string
    description: string
    whyImportant: string
    learningLinks: Array<{ title: string; url: string; type: string }>
  }>
  weeklyFocusPlan: Array<{
    week: string
    focus: string
    outcome: string
  }>
}

export interface ApiEndpointDoc {
  method: string
  path: string
  description: string
}

export interface FullStackDocumentation {
  architectureOverview: string
  frontendSpec: string
  backendSpec: string
  databaseSchema: string
  apiEndpoints: ApiEndpointDoc[]
  deploymentAndDevOps: string
  stepByStepGuide: string[]
  keyResumeBullets: string[]
}

export interface SolidProject {
  title: string
  tagline: string
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Production-Ready"
  technologies: string[]
  fullStackDocumentation: FullStackDocumentation
}

export interface RemainingSkillsAndProjects {
  remainingSkills: string[]
  solidProjects: SolidProject[]
}

export interface TechnicalQuestion {
  category: string
  question: string
  idealAnswer: string
  keyTalkingPoints: string[]
  codeSnippetOrDiagram?: string
}

export interface TakeHomeChallenge {
  title: string
  prompt: string
  evaluationCriteria: string[]
}

export interface InterviewMastery {
  targetRoleOverview: string
  technicalQuestions: TechnicalQuestion[]
  takeHomeChallenges: TakeHomeChallenge[]
  interviewCheatSheet: string[]
}

export interface ResumeProjection {
  _id: string
  id: string
  userId: string
  resumeId: string
  roadmapId: string
  projectionTimelineMonths: 3 | 6 | 12
  projectedContent: ParsedResumeContent
  plannedAchievements: ProjectedAchievement[]
  achievedMilestonesCount: number
  foundationsGuide?: FoundationsGuide
  remainingSkillsAndProjects?: RemainingSkillsAndProjects
  interviewMastery?: InterviewMastery
  generatedAt: string
  createdAt: string
}

export interface ResumeSnapshot {
  _id: string
  id: string
  userId: string
  resumeId: string
  version: number
  title: string
  snapshotType: "current" | "projected_3m" | "projected_6m" | "projected_12m" | "milestone_update"
  snapshotContent: ParsedResumeContent
  changeLog: string[]
  createdAt: string
}

export interface ResumeExportData {
  isProjected: boolean
  projectionMonths?: number
  targetCareer?: string
  skillsStillToLearn?: Array<{ skill: string; priority: string; reason: string }>
  interviewQuestions?: TechnicalQuestion[]
  watermarkText: string
  disclaimer: string
  resume: {
    title: string
    personalInfo: ParsedPersonalInfo
    summary?: string
    education: ParsedEducation[]
    experience: ParsedExperience[]
    skills: string[]
    technicalTools: string[]
    projects: ParsedProject[]
    certifications: ParsedCertification[]
  }
}

export interface CareerTargetSetupPayload {
  targetCareer: string
  targetRoleLevel: "entry" | "junior" | "mid" | "senior"
  timelineMonths: 3 | 6 | 12
  weeklyHoursAvailable: number
  currentExperienceLevel: "beginner" | "intermediate" | "advanced"
  preferredIndustry?: string
}

export const uploadResume = async (file: File): Promise<ResumeRecord> => {
  const formData = new FormData()
  formData.append("file", file)
  const res = await api.post("/resume-time-machine/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return normalizeDoc(res.data.data)
}

export const getUserResumes = async (): Promise<ResumeRecord[]> => {
  const res = await api.get("/resume-time-machine/resumes")
  return (res.data.data || []).map((r: any) => normalizeDoc(r))
}

export const getResumeById = async (id: string): Promise<ResumeRecord> => {
  const res = await api.get(`/resume-time-machine/resumes/${id}`)
  return normalizeDoc(res.data.data)
}

export const updateParsedResume = async (
  id: string,
  data: Partial<ParsedResumeContent>
): Promise<ResumeRecord> => {
  const res = await api.put(`/resume-time-machine/resumes/${id}`, data)
  return normalizeDoc(res.data.data)
}

export const reparseResumeWithAI = async (id: string): Promise<ResumeRecord> => {
  const res = await api.post(`/resume-time-machine/resumes/${id}/reparse`)
  return normalizeDoc(res.data.data)
}

export const setupCareerTargetAndAnalyze = async (
  id: string,
  data: CareerTargetSetupPayload
): Promise<{
  analysis: ResumeAnalysis
  roadmap: ResumeRoadmap
  milestones: ResumeMilestone[]
  projections: ResumeProjection[]
}> => {
  const res = await api.post(`/resume-time-machine/resumes/${id}/analyze`, data)
  return {
    analysis: normalizeDoc(res.data.data.analysis),
    roadmap: normalizeDoc(res.data.data.roadmap),
    milestones: (res.data.data.milestones || []).map((m: any) => normalizeDoc(m)),
    projections: (res.data.data.projections || []).map((p: any) => normalizeDoc(p)),
  }
}

export const getLatestAnalysis = async (id: string): Promise<ResumeAnalysis | null> => {
  const res = await api.get(`/resume-time-machine/resumes/${id}/analysis`)
  return res.data.data ? normalizeDoc(res.data.data) : null
}

export const getRoadmapWithMilestones = async (
  id: string
): Promise<{ roadmap: ResumeRoadmap | null; milestones: ResumeMilestone[] }> => {
  const res = await api.get(`/resume-time-machine/resumes/${id}/roadmap`)
  return {
    roadmap: res.data.data.roadmap ? normalizeDoc(res.data.data.roadmap) : null,
    milestones: (res.data.data.milestones || []).map((m: any) => normalizeDoc(m)),
  }
}

export const updateMilestoneStatus = async (
  milestoneId: string,
  status: "planned" | "in_progress" | "completed"
): Promise<ResumeMilestone> => {
  const res = await api.patch(`/resume-time-machine/milestones/${milestoneId}/status`, { status })
  return normalizeDoc(res.data.data)
}

export const completeMilestoneWithEvidence = async (
  milestoneId: string,
  data: { completionDescription: string; evidenceUrl?: string; confirmed: boolean }
): Promise<{ milestone: ResumeMilestone; updatedRoadmap: ResumeRoadmap }> => {
  const res = await api.post(`/resume-time-machine/milestones/${milestoneId}/complete`, data)
  return {
    milestone: normalizeDoc(res.data.data.milestone),
    updatedRoadmap: normalizeDoc(res.data.data.updatedRoadmap),
  }
}

export const getProjections = async (id: string): Promise<ResumeProjection[]> => {
  const res = await api.get(`/resume-time-machine/resumes/${id}/projections`)
  return (res.data.data || []).map((p: any) => normalizeDoc(p))
}

export const createResumeSnapshot = async (
  id: string,
  data: { title: string; snapshotType: string; notes?: string }
): Promise<ResumeSnapshot> => {
  const res = await api.post(`/resume-time-machine/resumes/${id}/snapshots`, data)
  return normalizeDoc(res.data.data)
}

export const getResumeSnapshots = async (id: string): Promise<ResumeSnapshot[]> => {
  const res = await api.get(`/resume-time-machine/resumes/${id}/snapshots`)
  return (res.data.data || []).map((s: any) => normalizeDoc(s))
}

export const getResumeExportData = async (
  id: string,
  months?: number
): Promise<ResumeExportData> => {
  const res = await api.get(`/resume-time-machine/resumes/${id}/export${months ? `?months=${months}` : ""}`)
  return res.data.data
}


