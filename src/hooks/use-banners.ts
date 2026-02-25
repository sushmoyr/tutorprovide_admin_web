"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Banner, PaginationParams } from "@/types";

export function useBanners(params: PaginationParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC" } = params;

  return useQuery({
    queryKey: ["banners", { page, size, sortBy, order }],
    queryFn: () =>
      api
        .get<ApiResponse<Banner[]>>(endpoints.BANNERS, {
          page,
          size,
          sortBy,
          order,
        })
        .then((res) => res.data),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.bannerById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}
