import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from "../lib/api/auth";
import { refreshAccessToken } from "../lib/api/client";
import { setAccessToken } from "./tokenStore";
import type { AuthResult, User } from "../types/api";
import type { LoginPayload, RegisterPayload } from "../lib/api/auth";

type AuthContextValue = {
  user: User | null;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const token = await refreshAccessToken();
      if (!token) {
        if (mounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const profile = await getMe();
        if (mounted) {
          setUser(profile);
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      async login(payload) {
        const result = await loginRequest(payload);
        setUser(result.user);
        return result;
      },
      async register(payload) {
        const result = await registerRequest(payload);
        setUser(result.user);
        return result;
      },
      async logout() {
        await logoutRequest();
        setUser(null);
        setAccessToken(null);
        queryClient.clear();
      }
    }),
    [isBootstrapping, queryClient, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

