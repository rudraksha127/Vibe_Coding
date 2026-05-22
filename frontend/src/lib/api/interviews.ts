import { apiClient, unwrap } from "./client";
import type { ApiSuccess, InterviewQuestion, InterviewSession } from "../../types/api";

export type CreateInterviewPayload = {
  resumeId?: string | undefined;
  targetRole: string;
  targetCompanies: string[];
  language: string;
  level: InterviewSession["level"];
  mode: InterviewSession["mode"];
  companyPack?: string | undefined;
};

export type SubmitAnswerResult = {
  question: InterviewQuestion;
  latestAttempt: InterviewQuestion["attempts"][number];
  nextAction: "retry" | "move_next";
};

export async function listInterviews(): Promise<InterviewSession[]> {
  const response = await apiClient.get<ApiSuccess<InterviewSession[]>>("/interviews", {
    params: { page: 1, limit: 20 }
  });
  return unwrap(response.data);
}

export async function createInterview(payload: CreateInterviewPayload): Promise<InterviewSession> {
  const response = await apiClient.post<ApiSuccess<InterviewSession>>("/interviews", payload);
  return unwrap(response.data);
}

export async function getInterview(id: string): Promise<InterviewSession> {
  const response = await apiClient.get<ApiSuccess<InterviewSession>>(`/interviews/${id}`);
  return unwrap(response.data);
}

export async function generateQuestion(
  interviewId: string,
  difficulty?: InterviewSession["currentDifficulty"]
): Promise<InterviewQuestion> {
  const response = await apiClient.post<ApiSuccess<InterviewQuestion>>(
    `/interviews/${interviewId}/questions`,
    difficulty ? { difficulty } : {}
  );
  return unwrap(response.data);
}

export async function submitAnswer(
  interviewId: string,
  questionId: string,
  answer: string
): Promise<SubmitAnswerResult> {
  const response = await apiClient.post<ApiSuccess<SubmitAnswerResult>>(
    `/interviews/${interviewId}/questions/${questionId}/answers`,
    { answer, inputMode: "text" }
  );
  return unwrap(response.data);
}

export async function completeInterview(id: string): Promise<InterviewSession["scorecard"]> {
  const response = await apiClient.post<ApiSuccess<InterviewSession["scorecard"]>>(`/interviews/${id}/complete`);
  return unwrap(response.data);
}
