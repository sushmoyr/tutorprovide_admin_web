"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Ad, AdStatus, ApiResponse, PaginationParams } from "@/types";

export function useAds(params: PaginationParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC" } = params;

  return useQuery({
    queryKey: ["ads", { page, size, sortBy, order }],
    queryFn: () =>
      api
        .get<ApiResponse<Ad[]>>(endpoints.ADS, {
          page,
          size,
          sortBy,
          order,
          paginate: true,
        })
        .then((res) => res.data),
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      imageUrl: string;
      link?: string;
    }) => api.post<ApiResponse<Ad>>(endpoints.ADS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        description?: string;
        imageUrl?: string;
        link?: string;
      };
    }) => api.put<ApiResponse<Ad>>(endpoints.adById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.adById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useChangeAdStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdStatus }) =>
      api.patch<ApiResponse<Ad>>(endpoints.adStatus(id, status)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}
