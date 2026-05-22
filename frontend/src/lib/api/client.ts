import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../env";
import { getAccessToken, setAccessToken } from "../../auth/tokenStore";
import type { ApiError, ApiSuccess, AuthResult } from "../../types/api";

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields?: Record<string, string[]>;

  constructor(message: string, code: string, status: number, fields?: Record<string, string[]>) {
    super(message);
    this.code = code;
    this.status = status;
    if (fields) {
      this.fields = fields;
    }
  }
}

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        original.headers.Authorization = `Bearer ${refreshedToken}`;
        return apiClient(original);
      }
    }

    return Promise.reject(toApiClientError(error));
  }
);

export async function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= refreshClient
    .post<ApiSuccess<AuthResult>>("/auth/refresh")
    .then((response) => {
      setAccessToken(response.data.data.accessToken);
      return response.data.data.accessToken;
    })
    .catch(() => {
      setAccessToken(null);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function unwrap<T>(response: ApiSuccess<T>): T {
  return response.data;
}

function toApiClientError(error: AxiosError<ApiError>): ApiClientError {
  const payload = error.response?.data;
  if (payload?.success === false) {
    return new ApiClientError(
      payload.error.message,
      payload.error.code,
      error.response?.status ?? 500,
      payload.error.fields
    );
  }

  return new ApiClientError(error.message || "Network request failed", "NETWORK_ERROR", error.response?.status ?? 0);
}

