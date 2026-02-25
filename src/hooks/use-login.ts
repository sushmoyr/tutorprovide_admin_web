"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { extractApiError } from "@/lib/api/error";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, TokenResult } from "@/types";

interface LoginCredentials {
  loginId: string;
  password: string;
  userType?: "EMPLOYEE";
}

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<TokenResult>>(
        endpoints.LOGIN,
        {
          loginId: credentials.loginId,
          password: credentials.password,
          userType: credentials.userType ?? "EMPLOYEE",
        }
      );

      const tokenResult = response.data.data;
      login(tokenResult);
      router.push("/");
      return true;
    } catch (err) {
      const message = extractApiError(err);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { handleLogin, isLoading, error, clearError };
}
