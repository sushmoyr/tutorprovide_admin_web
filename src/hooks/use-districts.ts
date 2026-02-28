"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, District, PaginationParams } from "@/types";

interface DistrictParams extends PaginationParams {
  divisionId?: number;
  searchKey?: string;
}

export function useDistricts(params: DistrictParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    divisionId,
    searchKey,
  } = params;

  return useQuery({
    queryKey: ["districts", { page, size, sortBy, order, divisionId, searchKey }],
    queryFn: () =>
      api
        .get<ApiResponse<District[]>>(endpoints.DISTRICTS, {
          page,
          size,
          sortBy,
          order,
          divisionId,
          searchKey,
        })
        .then((res) => res.data),
  });
}

export function useCreateDistrict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; divisionId: number }) =>
      api.post<ApiResponse<District>>(endpoints.DISTRICTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });
}

export function useUpdateDistrict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; divisionId: number } }) =>
      api.put<ApiResponse<District>>(endpoints.districtById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });
}

export function useDeleteDistrict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.districtById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });
}
