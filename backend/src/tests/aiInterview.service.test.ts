import { describe, expect, it } from "vitest";
import { evaluateAnswer, generateQuestion } from "../services/aiInterview.service.js";

describe("aiInterview.service", () => {
  it("generates resume-grounded questions", async () => {
    const question = await generateQuestion({
      level: "L2",
      targetRole: "Frontend Engineer",
      difficulty: "medium",
      resumeSkills: ["React"],
      resumeProjects: [],
      previousPrompts: []
    });

    expect(typeof question.prompt).toBe("string");
    expect(question.prompt.length).toBeGreaterThan(10);
    expect(Array.isArray(question.expectedSignals)).toBe(true);
    expect(question.expectedSignals.length).toBeGreaterThan(0);
  });

  it("recommends retry for thin answers", async () => {
    const question = await generateQuestion({
      level: "L5",
      targetRole: "Software Engineer",
      difficulty: "medium",
      resumeSkills: ["Node"],
      resumeProjects: [],
      previousPrompts: []
    });

    const result = await evaluateAnswer({
      question,
      answer: "I worked on Node and it was good.",
      attemptNumber: 1
    });

    expect(result.feedback.retryRecommended).toBe(true);
    expect(result.scores.overall).toBeLessThan(75);
  });
});

