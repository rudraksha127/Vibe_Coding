import { Resume } from "../../models/resume.model.js";
import { AppError } from "../../utils/appError.js";
import { assertOwnership } from "../../utils/ownershipCheck.js";
import { parseResumeText } from "../../services/resumeParser.service.js";
import type { CreateResumeInput, UpdateResumeInput } from "./resume.schema.js";
// @ts-ignore
import pdf from "pdf-parse";

export async function createResume(userId: string, input: CreateResumeInput, file?: Express.Multer.File) {
  if (!input.extractedText && !file) {
    throw new AppError(400, "INVALID_REQUEST", "Provide resume text or upload a resume file");
  }

  if (input.isPrimary) {
    await Resume.updateMany({ userId, isDeleted: false }, { $set: { isPrimary: false } });
  }

  let extractedText = input.extractedText || "";

  if (file) {
    if (file.mimetype === "application/pdf") {
      try {
        const parsedPdf = await pdf(file.buffer);
        extractedText = parsedPdf.text;
      } catch (err) {
        throw new AppError(400, "INVALID_REQUEST", "Failed to parse PDF resume file");
      }
    } else if (file.mimetype === "text/plain") {
      extractedText = file.buffer.toString("utf8");
    } else {
      throw new AppError(400, "INVALID_REQUEST", "Unsupported file type. Only PDF and TXT are supported.");
    }
  }

  if (!extractedText.trim()) {
    throw new AppError(400, "INVALID_REQUEST", "Extracted resume text is empty");
  }

  const parsed = await parseResumeText(extractedText, input.targetRole);
  const resume = await Resume.create({
    userId,
    title: input.title,
    extractedText,
    parsed: {
      skills: parsed.skills,
      experience: parsed.experience,
      projects: parsed.projects,
      education: parsed.education,
      certifications: parsed.certifications,
      leadershipSignals: parsed.leadershipSignals,
      gaps: parsed.gaps
    },
    atsScore: parsed.atsScore,
    suggestions: parsed.suggestions,
    isPrimary: input.isPrimary,
    ...(file
      ? {
          originalFileName: file.originalname,
          mimeType: file.mimetype,
          fileSizeBytes: file.size
        }
      : {})
  });

  return resume;
}

export async function listResumes(userId: string, page: number, limit: number) {
  const filter = { userId, isDeleted: false };
  const [data, total] = await Promise.all([
    Resume.find(filter)
      .sort({ isPrimary: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Resume.countDocuments(filter)
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

export async function getResume(userId: string, resumeId: string) {
  return assertOwnership(Resume, resumeId, userId);
}

export async function updateResume(userId: string, resumeId: string, input: UpdateResumeInput) {
  const resume = await assertOwnership(Resume, resumeId, userId);

  if (input.isPrimary) {
    await Resume.updateMany({ userId, isDeleted: false, _id: { $ne: resumeId } }, { $set: { isPrimary: false } });
  }

  if (input.title !== undefined) {
    resume.title = input.title;
  }
  if (input.extractedText !== undefined) {
    const parsed = await parseResumeText(input.extractedText);
    resume.extractedText = input.extractedText;
    resume.parsed = {
      skills: parsed.skills,
      experience: parsed.experience,
      projects: parsed.projects,
      education: parsed.education,
      certifications: parsed.certifications,
      leadershipSignals: parsed.leadershipSignals,
      gaps: parsed.gaps
    };
    resume.atsScore = parsed.atsScore;
    resume.suggestions = parsed.suggestions;
  }
  if (input.isPrimary !== undefined) {
    resume.isPrimary = input.isPrimary;
  }

  await resume.save();
  return resume;
}

export async function analyzeResume(userId: string, resumeId: string) {
  const resume = await assertOwnership(Resume, resumeId, userId);
  const parsed = await parseResumeText(resume.extractedText);

  resume.parsed = {
    skills: parsed.skills,
    experience: parsed.experience,
    projects: parsed.projects,
    education: parsed.education,
    certifications: parsed.certifications,
    leadershipSignals: parsed.leadershipSignals,
    gaps: parsed.gaps
  };
  resume.atsScore = parsed.atsScore;
  resume.suggestions = parsed.suggestions;
  await resume.save();

  return resume;
}

export async function deleteResume(userId: string, resumeId: string): Promise<void> {
  const resume = await assertOwnership(Resume, resumeId, userId);
  resume.isDeleted = true;
  resume.deletedAt = new Date();
  await resume.save();
}
