"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PreferableClass, PaginationParams } from "@/types";

interface ClassParams extends PaginationParams {
  search?: string;
  categoryId?: number;
}

export function useClasses(params: ClassParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "name",
    order = "DESC",
    search,
    categoryId,
  } = params;

  return useQuery({
    queryKey: ["classes", { page, size, sortBy, order, search, categoryId }],
    queryFn: () =>
      api
        .get<ApiResponse<PreferableClass[]>>(endpoints.CLASSES, {
          page,
          size,
          sortBy,
          order,
          search,
          categoryId,
        })
        .then((res) => res.data),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      numericValue: number;
      categoryId: number;
    }) => api.post<ApiResponse<PreferableClass>>(endpoints.CLASSES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; numericValue: number; categoryId: number };
    }) =>
      api.put<ApiResponse<PreferableClass>>(endpoints.classById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.classById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
