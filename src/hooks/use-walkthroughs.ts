"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Walkthrough } from "@/types";

export function useWalkthroughs() {
  return useQuery({
    queryKey: ["walkthroughs"],
    queryFn: () =>
      api.get<ApiResponse<Walkthrough[]>>(endpoints.WALKTHROUGHS).then((res) => res.data),
  });
}

export function useCreateWalkthrough() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<Walkthrough>>(endpoints.WALKTHROUGHS, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["walkthroughs"] }); },
  });
}

export function useUpdateWalkthrough() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: FormData }) =>
      api.put<ApiResponse<Walkthrough>>(endpoints.walkthroughByKey(key), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["walkthroughs"] }); },
  });
}

export function useDeleteWalkthrough() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => api.delete(endpoints.walkthroughByKey(key)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["walkthroughs"] }); },
  });
}
