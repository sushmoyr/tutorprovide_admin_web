"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Area, PaginationParams } from "@/types";

interface AreaParams extends PaginationParams {
  districtId?: number;
  search?: string;
}

export function useAreas(params: AreaParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    districtId,
    search,
  } = params;

  return useQuery({
    queryKey: ["areas", { page, size, sortBy, order, districtId, search }],
    queryFn: () =>
      api
        .get<ApiResponse<Area[]>>(endpoints.AREAS, {
          page,
          size,
          sortBy,
          order,
          districtId,
          search,
        })
        .then((res) => res.data),
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<Area>>(endpoints.AREAS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put<ApiResponse<Area>>(endpoints.areaById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.areaById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}
