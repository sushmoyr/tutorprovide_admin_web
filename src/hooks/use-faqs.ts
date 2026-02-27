"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, FAQ } from "@/types";

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: () =>
      api
        .get<ApiResponse<FAQ[]>>(endpoints.FAQS)
        .then((res) => res.data),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { question: string; answer: string; link?: string }) =>
      api.post<ApiResponse<FAQ>>(endpoints.FAQS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { question?: string; answer?: string; link?: string };
    }) => api.put<ApiResponse<FAQ>>(endpoints.faqById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.faqById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}
