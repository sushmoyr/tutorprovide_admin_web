"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";

interface AuthState {
  authenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthActions {
  login: (tokenResult: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      authenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      login: (tokenResult) => {
        localStorage.setItem("accessToken", tokenResult.accessToken);
        localStorage.setItem("refreshToken", tokenResult.refreshToken);
        localStorage.setItem("user", JSON.stringify(tokenResult.user));
        document.cookie = `accessToken=${tokenResult.accessToken};path=/;max-age=86400`;
        set({
          authenticated: true,
          user: tokenResult.user,
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken,
        });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        document.cookie = "accessToken=;path=/;max-age=0";
        set({
          authenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      updateUser: (data) =>
        set((state) => {
          const updated = state.user ? { ...state.user, ...data } : null;
          if (updated) localStorage.setItem("user", JSON.stringify(updated));
          return { user: updated };
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        authenticated: state.authenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
