"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Department, PaginationParams } from "@/types";

export function useDepartments(params: PaginationParams = {}) {
  const { page = 0, size = 10, sortBy = "name", order = "DESC" } = params;

  return useQuery({
    queryKey: ["departments", { page, size, sortBy, order }],
    queryFn: () =>
      api
        .get<ApiResponse<Department[]>>(endpoints.DEPARTMENTS, { page, size, sortBy, order })
        .then((res) => res.data),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) =>
      api.post<ApiResponse<Department>>(endpoints.DEPARTMENTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      api.put<ApiResponse<Department>>(endpoints.departmentById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.departmentById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
