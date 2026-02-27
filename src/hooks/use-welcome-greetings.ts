"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, WelcomeGreeting, PaginationParams, WelcomeGreetingType } from "@/types";

interface WelcomeGreetingParams extends PaginationParams {
  type?: WelcomeGreetingType;
}

export function useWelcomeGreetings(params: WelcomeGreetingParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC", type } = params;
  return useQuery({
    queryKey: ["welcome-greetings", { page, size, sortBy, order, type }],
    queryFn: () =>
      api.get<ApiResponse<WelcomeGreeting[]>>(endpoints.WELCOME_GREETINGS, {
        page, size, sortBy, order, ...(type && { type }),
      }).then((res) => res.data),
  });
}

export function useCreateWelcomeGreeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<WelcomeGreeting>>(endpoints.WELCOME_GREETINGS, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["welcome-greetings"] }); },
  });
}

export function useUpdateWelcomeGreeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put<ApiResponse<WelcomeGreeting>>(endpoints.welcomeGreetingById(id), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["welcome-greetings"] }); },
  });
}

export function useDeleteWelcomeGreeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.welcomeGreetingById(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["welcome-greetings"] }); },
  });
}
