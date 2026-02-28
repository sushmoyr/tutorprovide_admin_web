"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Curriculum } from "@/types";

export function useCurriculums(categoryId?: number) {
  return useQuery({
    queryKey: ["curriculum", { categoryId }],
    queryFn: () =>
      api
        .get<ApiResponse<Curriculum[]>>(
          endpoints.CURRICULUM,
          categoryId ? { categoryId } : {}
        )
        .then((res) => res.data),
  });
}

export function useCreateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; preferableCategoryId: number }) =>
      api.post<ApiResponse<Curriculum>>(endpoints.CURRICULUM, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}

export function useUpdateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; preferableCategoryId: number };
    }) => api.put<ApiResponse<Curriculum>>(endpoints.curriculumById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}

export function useDeleteCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.curriculumById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}
