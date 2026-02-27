"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Announcement, PaginationParams, AnnouncementStatus, RecipientGroup, AnnouncementChannel } from "@/types";

interface NoticeParams extends PaginationParams {
  status?: AnnouncementStatus;
  recipient?: RecipientGroup;
  channel?: AnnouncementChannel;
  search?: string;
}

export function useNotices(params: NoticeParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC", status, recipient, channel, search } = params;
  return useQuery({
    queryKey: ["notices", { page, size, sortBy, order, status, recipient, channel, search }],
    queryFn: () =>
      api.get<ApiResponse<Announcement[]>>(endpoints.ANNOUNCEMENTS_MANAGEMENT, {
        page, size, sortBy, order,
        ...(status && { status }),
        ...(recipient && { recipient }),
        ...(channel && { channel }),
        ...(search && { search }),
      }).then((res) => res.data),
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<Announcement>>(endpoints.ANNOUNCEMENTS, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notices"] }); },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put<ApiResponse<Announcement>>(endpoints.announcementById(id), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notices"] }); },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.announcementById(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notices"] }); },
  });
}

export function usePublishNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post(endpoints.announcementPublish(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notices"] }); },
  });
}
