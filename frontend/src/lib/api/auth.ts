import { apiClient, unwrap } from "./client";
import { setAccessToken } from "../../auth/tokenStore";
import type { ApiSuccess, AuthResult, User } from "../../types/api";

export type RegisterPayload = {
  email: string;
  password: string;
  profile: {
    name: string;
    targetRole?: string;
    experienceLevel?: string;
    targetCompanies?: string[];
    preferredLanguage?: string;
    timezone?: string;
    dressCodePreference?: string;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const response = await apiClient.post<ApiSuccess<AuthResult>>("/auth/register", payload);
  const result = unwrap(response.data);
  setAccessToken(result.accessToken);
  return result;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const response = await apiClient.post<ApiSuccess<AuthResult>>("/auth/login", payload);
  const result = unwrap(response.data);
  setAccessToken(result.accessToken);
  return result;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
  setAccessToken(null);
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiSuccess<User>>("/users/me");
  return unwrap(response.data);
}

