"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ApiResponse,
  TuitionCount,
  TutorCount,
  GuardianCount,
  StaticCounter,
  WelcomeGreeting,
} from "@/types";

export function useTuitionCount() {
  return useQuery({
    queryKey: ["dashboard", "tuition-count"],
    queryFn: () =>
      api
        .get<ApiResponse<TuitionCount>>(endpoints.DASHBOARD_TUITION_COUNT)
        .then((res) => res.data.data),
  });
}

export function useTutorCount() {
  return useQuery({
    queryKey: ["dashboard", "tutor-count"],
    queryFn: () =>
      api
        .get<ApiResponse<TutorCount>>(endpoints.DASHBOARD_TUTOR_COUNT)
        .then((res) => res.data.data),
  });
}

export function useGuardianCount() {
  return useQuery({
    queryKey: ["dashboard", "guardian-count"],
    queryFn: () =>
      api
        .get<ApiResponse<GuardianCount>>(endpoints.DASHBOARD_GUARDIAN_COUNT)
        .then((res) => res.data.data),
  });
}

export function useStaticCounters() {
  return useQuery({
    queryKey: ["dashboard", "static-counters"],
    queryFn: () =>
      api
        .get<ApiResponse<StaticCounter[]>>(endpoints.COUNTERS, {
          params: { status: "", page: 0, size: 5, sortBy: "updatedAt", order: "ASC" },
        })
        .then((res) => res.data.data),
  });
}

export function useWelcomeGreetings() {
  return useQuery({
    queryKey: ["dashboard", "welcome-greetings"],
    queryFn: () =>
      api
        .get<ApiResponse<WelcomeGreeting[]>>(endpoints.WELCOME_GREETINGS, {
          params: { type: "ADMIN", page: 0, size: 5, sortBy: "updatedAt", order: "DESC" },
        })
        .then((res) => res.data.data),
  });
}
