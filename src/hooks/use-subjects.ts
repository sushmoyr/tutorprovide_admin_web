"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Subject, PaginationParams } from "@/types";

interface SubjectParams extends PaginationParams {
  search?: string;
  classId?: number;
}

export function useSubjects(params: SubjectParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "name",
    order = "DESC",
    search,
    classId,
  } = params;

  return useQuery({
    queryKey: ["subjects", { page, size, sortBy, order, search, classId }],
    queryFn: () =>
      api
        .get<ApiResponse<Subject[]>>(endpoints.SUBJECTS, {
          page,
          size,
          sortBy,
          order,
          search,
          classId,
        })
        .then((res) => res.data),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; classId: number }) =>
      api.post<ApiResponse<Subject>>(endpoints.SUBJECTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; classId: number };
    }) => api.put<ApiResponse<Subject>>(endpoints.subjectById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.subjectById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
