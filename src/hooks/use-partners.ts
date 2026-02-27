"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Partner } from "@/types";

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: () =>
      api
        .get<ApiResponse<Partner[]>>(endpoints.PARTNERS)
        .then((res) => res.data),
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<Partner>>(endpoints.PARTNERS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put<ApiResponse<Partner>>(endpoints.partnerById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.partnerById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}
