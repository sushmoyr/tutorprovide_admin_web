"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Feedback, PaginationParams, FeedbackStatus } from "@/types";

interface FeedbackParams extends PaginationParams {
  status?: FeedbackStatus;
}

export function useFeedbacks(params: FeedbackParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC", status } = params;

  return useQuery({
    queryKey: ["feedbacks", { page, size, sortBy, order, status }],
    queryFn: () =>
      api
        .get<ApiResponse<Feedback[]>>(endpoints.FEEDBACKS, {
          page,
          size,
          sortBy,
          order,
          ...(status && { status }),
        })
        .then((res) => res.data),
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { details: string; rating: number }) =>
      api.post<ApiResponse<Feedback>>(endpoints.FEEDBACKS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { details?: string; rating?: number } }) =>
      api.put<ApiResponse<Feedback>>(endpoints.feedbackById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.feedbackById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}

export function useChangeFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: FeedbackStatus }) =>
      api.patch(endpoints.feedbackStatus(id, status)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}
