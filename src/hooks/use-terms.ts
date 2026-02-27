"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Term } from "@/types";

export function useTerms() {
  return useQuery({
    queryKey: ["terms"],
    queryFn: () =>
      api
        .get<ApiResponse<Term[]>>(endpoints.TERMS)
        .then((res) => res.data),
  });
}

export function useCreateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { terms: string }) =>
      api.post<ApiResponse<Term>>(endpoints.TERMS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
  });
}

export function useUpdateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { terms: string } }) =>
      api.put<ApiResponse<Term>>(endpoints.termById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
  });
}

export function useDeleteTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.termById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
  });
}
