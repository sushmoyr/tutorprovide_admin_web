"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Counter, PaginationParams } from "@/types";

export function useCounters(params: PaginationParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC" } = params;

  return useQuery({
    queryKey: ["counters", { page, size, sortBy, order }],
    queryFn: () =>
      api
        .get<ApiResponse<Counter[]>>(endpoints.COUNTERS, { page, size, sortBy, order })
        .then((res) => res.data),
  });
}

export function useCreateCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { counterName: string; value: string }) =>
      api.post<ApiResponse<Counter>>(endpoints.COUNTERS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counters"] });
    },
  });
}

export function useUpdateCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { counterName: string; value: string } }) =>
      api.put<ApiResponse<Counter>>(endpoints.counterById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counters"] });
    },
  });
}

export function useDeleteCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.counterById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counters"] });
    },
  });
}
