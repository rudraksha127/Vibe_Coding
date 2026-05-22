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

// Helper function to get a user-friendly error message
function getUserFriendlyMessage(error: unknown): { message: string; code: string } {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      message: "No internet connection. Please check your network and try again.",
      code: "NETWORK_OFFLINE"
    };
  }

  if (axios.isAxiosError(error)) {
    if (!error.response && error.request) {
      // Request was made but no response received
      return {
        message: "Unable to connect to the server. Please ensure the backend is running at the correct address.",
        code: "CONNECTION_ERROR"
      };
    }

    if (error.response) {
      const payload = error.response.data as ApiError | undefined;
      if (payload?.success === false) {
        return {
          message: payload.error.message || "An error occurred",
          code: payload.error.code || "API_ERROR"
        };
      }

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 400:
          return { message: "Invalid request. Please check your input.", code: "BAD_REQUEST" };
        case 401:
          return { message: "Invalid credentials. Please try again.", code: "UNAUTHORIZED" };
        case 403:
          return { message: "Access denied. You don't have permission.", code: "FORBIDDEN" };
        case 404:
          return { message: "Resource not found.", code: "NOT_FOUND" };
        case 409:
          return { message: "Conflict. This resource already exists.", code: "CONFLICT" };
        case 429:
          return { message: "Too many requests. Please wait before trying again.", code: "RATE_LIMIT" };
        case 500:
          return { message: "Server error. Please try again later.", code: "SERVER_ERROR" };
        case 502:
          return { message: "Bad gateway. The server is temporarily unavailable.", code: "BAD_GATEWAY" };
        case 503:
          return { message: "Service unavailable. Please try again later.", code: "SERVICE_UNAVAILABLE" };
        default:
          return {
            message: error.message || "An unexpected error occurred.",
            code: error.code || "UNKNOWN_ERROR"
          };
      }
    }
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR"
  };
}

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000, // 30 second timeout
  validateStatus: (status) => status < 500 // Don't reject 4xx errors, handle them properly
});

const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
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
  const { message, code } = getUserFriendlyMessage(error);
  const payload = error.response?.data;

  if (payload?.success === false) {
    return new ApiClientError(
      payload.error.message,
      payload.error.code,
      error.response?.status ?? 500,
      payload.error.fields
    );
  }

  return new ApiClientError(
    message,
    code,
    error.response?.status ?? error.request ? 0 : 0,
    undefined
  );
}

