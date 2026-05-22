import { callAI } from "./aiProvider.service.js";
import { logger } from "../config/logger.js";
const roundNames = {
    L1: "Recruiter Screen / HR Call",
    L2: "Technical Phone Screen",
    L3: "Virtual / Onsite DSA Round",
    L4: "System Design Round",
    L5: "Behavioral + Leadership Round",
    L6: "Hiring Manager / Director Round",
    L7: "Team Match / Offer Discussion"
};
export async function generateQuestion(input) {
    const anchor = input.resumeSkills[0] ?? input.resumeProjects[0] ?? input.targetRole ?? "your resume";
    const systemPrompt = `You are an expert technical interviewer for a ${input.companyPack ? input.companyPack : 'top-tier tech'} company. 
Your goal is to generate a realistic interview question for a ${input.targetRole} role at ${input.level} level. 
The difficulty should be ${input.difficulty}.
The candidate has listed skills: ${input.resumeSkills.join(', ')}.
Make the question grounded in the skill/anchor: ${anchor}.
You MUST return ONLY a JSON object with the following schema, with no markdown formatting or extra text:
{
  "prompt": "The actual question text spoken to the candidate",
  "expectedSignals": ["signal1", "signal2", "signal3"]
}`;
    try {
        const aiResponseText = await callAI({
            systemPrompt,
            userMessage: "Generate the question now.",
            temperature: 0.7,
            maxTokens: 500
        });
        if (!aiResponseText) {
            return generateMockQuestion(input, anchor);
        }
        const parsed = JSON.parse(aiResponseText.replace(/```json|```/g, "").trim());
        return {
            level: input.level,
            roundName: roundNames[input.level],
            prompt: parsed.prompt ?? generateMockQuestion(input, anchor).prompt,
            anchor,
            difficulty: input.difficulty,
            expectedSignals: parsed.expectedSignals ?? [anchor, "impact"]
        };
    }
    catch (error) {
        logger.error("AI Generation Error", { error });
        return generateMockQuestion(input, anchor);
    }
}
export async function evaluateAnswer(input) {
    const systemPrompt = `You are an expert technical interviewer evaluating a candidate's answer.
Question: ${input.question.prompt}
Expected Signals: ${input.question.expectedSignals.join(', ')}
Candidate Answer: ${input.answer}
Attempt Number: ${input.attemptNumber}

Evaluate the answer out of 100 on 4 dimensions: communication, technicalDepth, relevance, confidence.
Calculate an overall score.
Provide constructive feedback: strong points (array), weak points (array), a model answer snippet, and a concise improvement tip.
Decide if they should retry (retryRecommended) and if they passed the 75 threshold (passThresholdMet).

You MUST return ONLY a JSON object exactly matching this schema, with no markdown formatting or extra text:
{
  "scores": {
    "communication": 80,
    "technicalDepth": 75,
    "relevance": 85,
    "confidence": 90,
    "overall": 82
  },
  "feedback": {
    "strong": ["Clear structure"],
    "weak": ["Missed edge cases"],
    "modelAnswer": "...",
    "improvementTip": "...",
    "retryRecommended": false,
    "passThresholdMet": true
  }
}`;
    try {
        const aiResponseText = await callAI({
            systemPrompt,
            userMessage: "Evaluate the answer.",
            temperature: 0.2,
            maxTokens: 800
        });
        if (!aiResponseText) {
            return evaluateMockAnswer(input);
        }
        const parsed = JSON.parse(aiResponseText.replace(/```json|```/g, "").trim());
        return {
            scores: parsed.scores,
            feedback: parsed.feedback
        };
    }
    catch (error) {
        logger.error("AI Evaluation Error", { error });
        return evaluateMockAnswer(input);
    }
}
export function aggregateScores(scores) {
    if (scores.length === 0) {
        return { communication: 0, technicalDepth: 0, relevance: 0, confidence: 0, overall: 0 };
    }
    return {
        communication: average(scores.map((s) => s.communication)),
        technicalDepth: average(scores.map((s) => s.technicalDepth)),
        relevance: average(scores.map((s) => s.relevance)),
        confidence: average(scores.map((s) => s.confidence)),
        overall: average(scores.map((s) => s.overall))
    };
}
export function nextDifficulty(current, latestOverall) {
    if (latestOverall >= 85)
        return current === "easy" ? "medium" : "hard";
    if (latestOverall < 55)
        return current === "hard" ? "medium" : "easy";
    return current;
}
function average(values) {
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
// Fallback logic
function generateMockQuestion(input, anchor) {
    return {
        level: input.level,
        roundName: roundNames[input.level],
        prompt: `[MOCK] Tell me about your experience with ${anchor} and how it applies to ${input.targetRole}.`,
        anchor,
        difficulty: input.difficulty,
        expectedSignals: [anchor, "impact", "tradeoffs"]
    };
}
function evaluateMockAnswer(input) {
    const isThin = (input.answer || "").trim().split(/\s+/).length < 10;
    return {
        scores: {
            communication: isThin ? 50 : 75,
            technicalDepth: isThin ? 40 : 75,
            relevance: isThin ? 60 : 75,
            confidence: isThin ? 50 : 75,
            overall: isThin ? 50 : 75
        },
        feedback: {
            strong: isThin ? ["Attempted to answer"] : ["Good attempt"],
            weak: isThin ? ["Answer is too short and lacks detail"] : ["Needs more metrics"],
            modelAnswer: "A model answer involves STAR format.",
            improvementTip: isThin ? "Provide a more detailed explanation with examples." : "Add more quantifiable impact.",
            retryRecommended: isThin,
            passThresholdMet: !isThin
        }
    };
}
