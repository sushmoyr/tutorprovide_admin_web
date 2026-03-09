"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ApiResponse,
  TutorListItem,
  TutorStatus,
  Gender,
  PaginationParams,
} from "@/types";

interface TutorParams extends PaginationParams {
  searchKey?: string;
  gender?: Gender;
  status?: TutorStatus;
  isPremium?: boolean;
}

export function useTutors(params: TutorParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    searchKey,
    gender,
    status,
    isPremium,
  } = params;

  return useQuery({
    queryKey: ["tutors", { page, size, sortBy, order, searchKey, gender, status, isPremium }],
    queryFn: () =>
      api
        .get<ApiResponse<TutorListItem[]>>(endpoints.TUTORS, {
          page,
          size,
          sortBy,
          order,
          ...(searchKey && { searchKey }),
          ...(gender && { gender }),
          ...(status && { status }),
          ...(isPremium !== undefined && { isPremium }),
        })
        .then((res) => res.data),
  });
}

export function useDeleteTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.tutorById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
}
