"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Designation, PaginationParams } from "@/types";

export function useDesignations(params: PaginationParams = {}) {
  const { page = 0, size = 10, sortBy = "name", order = "DESC" } = params;

  return useQuery({
    queryKey: ["designations", { page, size, sortBy, order }],
    queryFn: () =>
      api
        .get<ApiResponse<Designation[]>>(endpoints.DESIGNATIONS, { page, size, sortBy, order })
        .then((res) => res.data),
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) =>
      api.post<ApiResponse<Designation>>(endpoints.DESIGNATIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
    },
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      api.put<ApiResponse<Designation>>(endpoints.designationById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
    },
  });
}

export function useDeleteDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.designationById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
    },
  });
}
