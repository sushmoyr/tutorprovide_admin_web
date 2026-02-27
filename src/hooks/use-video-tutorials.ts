"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, VideoTutorial } from "@/types";

export function useVideoTutorials() {
  return useQuery({
    queryKey: ["video-tutorials"],
    queryFn: () =>
      api
        .get<ApiResponse<VideoTutorial[]>>(endpoints.VIDEO_TUTORIALS)
        .then((res) => res.data),
  });
}

export function useCreateVideoTutorial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<VideoTutorial, "id" | "createdAt" | "updatedAt">) =>
      api.post<ApiResponse<VideoTutorial>>(endpoints.VIDEO_TUTORIALS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-tutorials"] });
    },
  });
}

export function useUpdateVideoTutorial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Omit<VideoTutorial, "id" | "createdAt" | "updatedAt">>;
    }) => api.put<ApiResponse<VideoTutorial>>(endpoints.videoTutorialById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-tutorials"] });
    },
  });
}

export function useDeleteVideoTutorial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.videoTutorialById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-tutorials"] });
    },
  });
}
