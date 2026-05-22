export type ApiSuccess<T> = {
  success: true;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type User = {
  id: string;
  email: string;
  role: "user" | "admin";
  profile: {
    name: string;
    targetRole: string;
    experienceLevel: string;
    targetCompanies: string[];
    preferredLanguage: string;
    timezone: string;
    dressCodePreference: string;
    photoUrl: string;
  };
  privacyConsents: {
    recordingStorage: boolean;
    leaderboardVisible: boolean;
    marketingEmails: boolean;
  };
};

export type AuthResult = {
  user: User;
  accessToken: string;
};

export type Resume = {
  _id: string;
  title: string;
  extractedText: string;
  parsed?: {
    skills: string[];
    experience: string[];
    projects: string[];
    education: string[];
    certifications: string[];
    leadershipSignals: string[];
    gaps: string[];
  };
  atsScore: number;
  suggestions: string[];
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScoreDimensions = {
  communication: number;
  technicalDepth: number;
  relevance: number;
  confidence: number;
  overall: number;
};

export type AnswerAttempt = {
  _id: string;
  answer: string;
  inputMode: "text" | "voice" | "combined";
  scores: ScoreDimensions;
  feedback: {
    strong: string[];
    weak: string[];
    modelAnswer: string;
    improvementTip: string;
    retryRecommended: boolean;
    passThresholdMet: boolean;
  };
  improvementDelta: number;
  createdAt: string;
};

export type InterviewQuestion = {
  _id: string;
  level: "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
  roundName: string;
  prompt: string;
  anchor: string;
  difficulty: "easy" | "medium" | "hard";
  expectedSignals: string[];
  attempts: AnswerAttempt[];
};

export type InterviewSession = {
  _id: string;
  targetRole: string;
  targetCompanies: string[];
  language: string;
  level: "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
  mode: "structured" | "free_practice" | "company_simulation";
  status: "draft" | "in_progress" | "completed" | "abandoned";
  companyPack?: string;
  currentDifficulty: "easy" | "medium" | "hard";
  questions: InterviewQuestion[];
  scorecard?: {
    scores: ScoreDimensions;
    interviewReadinessScore: number;
    strongestArea: string;
    weakestArea: string;
    nextSteps: string[];
    completedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

