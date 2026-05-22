import { InterviewSession } from "../../models/interviewSession.model.js";
import { Resume } from "../../models/resume.model.js";
import { AppError } from "../../utils/appError.js";
import { assertOwnership } from "../../utils/ownershipCheck.js";
import { aggregateScores, evaluateAnswer, generateQuestion as generateQuestionWithAi, nextDifficulty } from "../../services/aiInterview.service.js";
export async function createInterviewSession(userId, input) {
    if (input.resumeId) {
        await assertOwnership(Resume, input.resumeId, userId);
    }
    return InterviewSession.create({
        userId,
        targetRole: input.targetRole,
        targetCompanies: input.targetCompanies,
        language: input.language,
        level: input.level,
        mode: input.mode,
        status: "draft",
        currentDifficulty: "medium",
        questions: [],
        ...(input.resumeId ? { resumeId: input.resumeId } : {}),
        ...(input.companyPack ? { companyPack: input.companyPack } : {})
    });
}
export async function listInterviewSessions(userId, page, limit, status) {
    const filter = {
        userId,
        isDeleted: false,
        ...(status ? { status } : {})
    };
    const [data, total] = await Promise.all([
        InterviewSession.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        InterviewSession.countDocuments(filter)
    ]);
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        }
    };
}
export async function getInterviewSession(userId, sessionId) {
    return assertOwnership(InterviewSession, sessionId, userId);
}
export async function generateQuestion(userId, sessionId, input) {
    const session = await assertOwnership(InterviewSession, sessionId, userId);
    const resume = session.resumeId ? await Resume.findOne({ _id: session.resumeId, userId, isDeleted: false }) : null;
    const generated = await generateQuestionWithAi({
        level: session.level,
        targetRole: session.targetRole,
        difficulty: input.difficulty ?? session.currentDifficulty,
        resumeSkills: resume?.parsed?.skills ?? [],
        resumeProjects: resume?.parsed?.projects ?? [],
        previousPrompts: session.questions.map((question) => question.prompt),
        ...(session.companyPack ? { companyPack: session.companyPack } : {})
    });
    session.questions.push({
        ...generated,
        attempts: []
    });
    session.status = "in_progress";
    await session.save();
    const question = session.questions[session.questions.length - 1];
    if (!question) {
        throw new AppError(500, "INTERNAL_ERROR", "Question was not created");
    }
    return question;
}
export async function submitAnswer(userId, sessionId, questionId, input) {
    const session = await assertOwnership(InterviewSession, sessionId, userId);
    const question = findQuestion(session, questionId);
    const generatedQuestion = toGeneratedQuestion(question);
    const previousBest = bestOverall(question);
    const evaluation = await evaluateAnswer({
        question: generatedQuestion,
        answer: input.answer,
        attemptNumber: question.attempts.length + 1
    });
    question.attempts.push({
        answer: input.answer,
        inputMode: input.inputMode,
        scores: evaluation.scores,
        feedback: evaluation.feedback,
        improvementDelta: Math.max(0, evaluation.scores.overall - previousBest),
        createdAt: new Date()
    });
    session.currentDifficulty = nextDifficulty(session.currentDifficulty, evaluation.scores.overall);
    session.status = "in_progress";
    await session.save();
    return {
        question,
        latestAttempt: question.attempts[question.attempts.length - 1],
        nextAction: evaluation.feedback.retryRecommended ? "retry" : "move_next"
    };
}
export async function completeInterviewSession(userId, sessionId) {
    const session = await assertOwnership(InterviewSession, sessionId, userId);
    const scores = allLatestScores(session);
    if (scores.length === 0) {
        throw new AppError(400, "INVALID_REQUEST", "Answer at least one question before completing the session");
    }
    const aggregate = aggregateScores(scores);
    const dimensions = {
        Communication: aggregate.communication,
        "Technical Depth": aggregate.technicalDepth,
        "Relevance to Role": aggregate.relevance,
        "Confidence Signals": aggregate.confidence
    };
    const sorted = Object.entries(dimensions).sort((a, b) => b[1] - a[1]);
    session.status = "completed";
    session.completedAt = new Date();
    session.scorecard = {
        scores: aggregate,
        interviewReadinessScore: aggregate.overall,
        strongestArea: sorted[0]?.[0] ?? "Communication",
        weakestArea: sorted[sorted.length - 1]?.[0] ?? "Technical Depth",
        nextSteps: nextStepsFor(aggregate),
        completedAt: new Date()
    };
    await session.save();
    return session.scorecard;
}
export async function deleteInterviewSession(userId, sessionId) {
    const session = await assertOwnership(InterviewSession, sessionId, userId);
    session.isDeleted = true;
    session.deletedAt = new Date();
    await session.save();
}
function findQuestion(session, questionId) {
    const question = session.questions.find((candidate) => candidate._id.toString() === questionId);
    if (!question) {
        throw new AppError(404, "NOT_FOUND", "Question not found");
    }
    return question;
}
function toGeneratedQuestion(question) {
    return {
        level: question.level,
        roundName: question.roundName,
        prompt: question.prompt,
        anchor: question.anchor,
        difficulty: question.difficulty,
        expectedSignals: question.expectedSignals
    };
}
function bestOverall(question) {
    return question.attempts.reduce((best, attempt) => Math.max(best, attempt.scores.overall), 0);
}
function allLatestScores(session) {
    return session.questions
        .map((question) => question.attempts[question.attempts.length - 1]?.scores)
        .filter((score) => Boolean(score));
}
function nextStepsFor(scores) {
    const steps = [];
    if (scores.communication < 75) {
        steps.push("Practice STAR-format answers with a crisp opening and result-focused close.");
    }
    if (scores.technicalDepth < 75) {
        steps.push("Add technical tradeoffs, constraints, and complexity analysis to each answer.");
    }
    if (scores.relevance < 75) {
        steps.push("Tie each answer back to your target role and resume evidence.");
    }
    if (scores.confidence < 75) {
        steps.push("Use direct ownership language and reduce hedging phrases.");
    }
    return steps.length ? steps : ["Move to a harder round or company-specific simulation pack."];
}
