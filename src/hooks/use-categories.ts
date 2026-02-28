"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Category, PaginationParams } from "@/types";

interface CategoryParams extends PaginationParams {
  search?: string;
}

export function useCategories(params: CategoryParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "name",
    order = "DESC",
    search,
  } = params;

  return useQuery({
    queryKey: ["categories", { page, size, sortBy, order, search }],
    queryFn: () =>
      api
        .get<ApiResponse<Category[]>>(endpoints.CATEGORIES, {
          page,
          size,
          sortBy,
          order,
          search,
        })
        .then((res) => res.data),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<Category>>(endpoints.CATEGORIES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put<ApiResponse<Category>>(endpoints.categoryById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.categoryById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
