"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, LivingLocation, PaginationParams } from "@/types";

interface LivingLocationParams extends PaginationParams {
  areaId?: number;
  search?: string;
}

export function useLivingLocations(params: LivingLocationParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "name",
    order = "DESC",
    areaId,
    search,
  } = params;

  return useQuery({
    queryKey: ["living-locations", { page, size, sortBy, order, areaId, search }],
    queryFn: () =>
      api
        .get<ApiResponse<LivingLocation[]>>(endpoints.LOCATIONS, {
          page,
          size,
          sortBy,
          order,
          areaId,
          search,
        })
        .then((res) => res.data),
  });
}

export function useCreateLivingLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; areaId: number }) =>
      api.post<ApiResponse<LivingLocation>>(endpoints.LOCATIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["living-locations"] });
    },
  });
}

export function useUpdateLivingLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; areaId: number } }) =>
      api.put<ApiResponse<LivingLocation>>(endpoints.locationById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["living-locations"] });
    },
  });
}

export function useDeleteLivingLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.locationById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["living-locations"] });
    },
  });
}
