"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Policy } from "@/types";

export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn: () =>
      api
        .get<ApiResponse<Policy[]>>(endpoints.POLICIES)
        .then((res) => res.data),
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { policy: string }) =>
      api.post<ApiResponse<Policy>>(endpoints.POLICIES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { policy: string } }) =>
      api.put<ApiResponse<Policy>>(endpoints.policyById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.policyById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}
