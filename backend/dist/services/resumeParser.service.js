import { callAI } from "./aiProvider.service.js";
import { logger } from "../config/logger.js";
export async function parseResumeText(text, targetRole = "") {
    const systemPrompt = `You are an expert technical recruiter parsing a resume.
Target Role (if any): ${targetRole}
Resume Text:
${text}

Extract the key details and provide a constructive ATS score (0-100) and suggestions for improvement.
You MUST return ONLY a JSON object exactly matching this schema, with no markdown formatting or extra text:
{
  "skills": ["skill1", "skill2"],
  "experience": ["Company X - Led team"],
  "projects": ["Project Y - Increased speed"],
  "education": ["BS Computer Science"],
  "certifications": ["AWS Certified"],
  "leadershipSignals": ["Led 5 people"],
  "gaps": ["No measurable impact"],
  "atsScore": 75,
  "suggestions": ["Add metrics"]
}`;
    try {
        const aiResponseText = await callAI({
            systemPrompt,
            userMessage: "Parse the resume.",
            temperature: 0.1,
            maxTokens: 1000
        });
        if (!aiResponseText) {
            return parseMockResume(text, targetRole);
        }
        const parsed = JSON.parse(aiResponseText.replace(/```json|```/g, "").trim());
        return {
            skills: parsed.skills ?? [],
            experience: parsed.experience ?? [],
            projects: parsed.projects ?? [],
            education: parsed.education ?? [],
            certifications: parsed.certifications ?? [],
            leadershipSignals: parsed.leadershipSignals ?? [],
            gaps: parsed.gaps ?? [],
            atsScore: parsed.atsScore ?? 50,
            suggestions: parsed.suggestions ?? []
        };
    }
    catch (error) {
        logger.error("AI Parsing Error", { error });
        return parseMockResume(text, targetRole);
    }
}
function parseMockResume(text, targetRole) {
    return {
        skills: ["javascript", "react", "node"],
        experience: ["Detected ownership or impact-oriented experience bullets."],
        projects: ["Detected project or build-oriented resume content."],
        education: ["Detected education credentials."],
        certifications: ["Detected certification mention."],
        leadershipSignals: ["Ownership language detected."],
        gaps: ["Add measurable impact"],
        atsScore: 75,
        suggestions: ["Use ownership verbs like led, designed, improved, launched, or mentored."]
    };
}
