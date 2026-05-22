import { apiClient, unwrap } from "./client";
import type { ApiSuccess, Resume } from "../../types/api";

export type CreateResumePayload = {
  title: string;
  extractedText: string;
  targetRole?: string | undefined;
  isPrimary: boolean;
};

export async function listResumes(): Promise<Resume[]> {
  const response = await apiClient.get<ApiSuccess<Resume[]>>("/resumes", {
    params: { page: 1, limit: 20 }
  });
  return unwrap(response.data);
}

export async function createResume(payload: CreateResumePayload): Promise<Resume> {
  const response = await apiClient.post<ApiSuccess<Resume>>("/resumes", payload);
  return unwrap(response.data);
}

export async function analyzeResume(id: string): Promise<Resume> {
  const response = await apiClient.post<ApiSuccess<Resume>>(`/resumes/${id}/analyze`);
  return unwrap(response.data);
}
