"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Division } from "@/types";

export function useDivisions() {
  return useQuery({
    queryKey: ["divisions"],
    queryFn: () =>
      api
        .get<ApiResponse<Division[]>>(endpoints.DIVISIONS)
        .then((res) => res.data),
  });
}

export function useCreateDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      api.post<ApiResponse<Division>>(endpoints.DIVISIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
}

export function useUpdateDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      api.put<ApiResponse<Division>>(endpoints.divisionById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.divisionById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
}
