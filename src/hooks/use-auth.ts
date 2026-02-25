"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const router = useRouter();
  const { authenticated, user, logout: storeLogout, updateUser } = useAuthStore();

  const logout = () => {
    storeLogout();
    router.push("/login");
  };

  return {
    isAuthenticated: authenticated,
    user,
    logout,
    updateUser,
  };
}
