"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Gallery } from "@/types";

export function useGalleries() {
  return useQuery({
    queryKey: ["galleries"],
    queryFn: () =>
      api.get<ApiResponse<Gallery[]>>(endpoints.GALLERIES).then((res) => res.data),
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string; description: string; actionLink: string; actionText: string;
      videoUrl: string; images: string[]; sortOrder: number; videoOnly: boolean;
    }) => api.post<ApiResponse<Gallery>>(endpoints.GALLERIES, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["galleries"] }); },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: {
      title?: string; description?: string; actionLink?: string; actionText?: string;
      videoUrl?: string; images?: string[]; order?: number; videoOnly?: boolean;
    } }) => api.put<ApiResponse<Gallery>>(endpoints.galleryById(id), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["galleries"] }); },
  });
}

export function useDeleteGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.galleryById(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["galleries"] }); },
  });
}
