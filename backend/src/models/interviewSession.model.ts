import { Schema, model, type InferSchemaType } from "mongoose";

export const interviewLevels = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"] as const;
export const interviewDifficulties = ["easy", "medium", "hard"] as const;
export const interviewStatuses = ["draft", "in_progress", "completed", "abandoned"] as const;

const scoreDimensionsSchema = new Schema(
  {
    communication: { type: Number, min: 0, max: 100, required: true },
    technicalDepth: { type: Number, min: 0, max: 100, required: true },
    relevance: { type: Number, min: 0, max: 100, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    overall: { type: Number, min: 0, max: 100, required: true }
  },
  { _id: false }
);

const feedbackSchema = new Schema(
  {
    strong: [{ type: String, trim: true }],
    weak: [{ type: String, trim: true }],
    modelAnswer: { type: String, trim: true, required: true },
    improvementTip: { type: String, trim: true, required: true },
    retryRecommended: { type: Boolean, required: true },
    passThresholdMet: { type: Boolean, required: true }
  },
  { _id: false }
);

const answerAttemptSchema = new Schema(
  {
    answer: { type: String, trim: true, required: true },
    inputMode: { type: String, enum: ["text", "voice", "combined"], default: "text" },
    scores: { type: scoreDimensionsSchema, required: true },
    feedback: { type: feedbackSchema, required: true },
    improvementDelta: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const questionSchema = new Schema(
  {
    level: { type: String, enum: interviewLevels, required: true },
    roundName: { type: String, trim: true, required: true },
    prompt: { type: String, trim: true, required: true },
    anchor: { type: String, trim: true, required: true },
    difficulty: { type: String, enum: interviewDifficulties, required: true },
    expectedSignals: [{ type: String, trim: true }],
    followUpOf: { type: Schema.Types.ObjectId },
    followUpCount: { type: Number, default: 0 },
    attempts: [answerAttemptSchema],
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const scorecardSchema = new Schema(
  {
    scores: { type: scoreDimensionsSchema, required: true },
    interviewReadinessScore: { type: Number, min: 0, max: 100, required: true },
    strongestArea: { type: String, trim: true, required: true },
    weakestArea: { type: String, trim: true, required: true },
    nextSteps: [{ type: String, trim: true }],
    completedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const interviewSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume"
    },
    targetRole: {
      type: String,
      trim: true,
      required: true
    },
    targetCompanies: [{ type: String, trim: true }],
    language: {
      type: String,
      trim: true,
      default: "en"
    },
    level: {
      type: String,
      enum: interviewLevels,
      default: "L1"
    },
    mode: {
      type: String,
      enum: ["structured", "free_practice", "company_simulation"],
      default: "structured"
    },
    status: {
      type: String,
      enum: interviewStatuses,
      default: "draft",
      index: true
    },
    companyPack: {
      type: String,
      trim: true
    },
    currentDifficulty: {
      type: String,
      enum: interviewDifficulties,
      default: "medium"
    },
    questions: [questionSchema],
    scorecard: scorecardSchema,
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

interviewSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

export type InterviewSessionDocument = InferSchemaType<typeof interviewSessionSchema> & {
  _id: unknown;
  id: string;
};

export const InterviewSession = model("InterviewSession", interviewSessionSchema);

