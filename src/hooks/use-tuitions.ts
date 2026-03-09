"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ApiResponse,
  PaginationParams,
  TuitionSummary,
  TuitionStatusFilter,
} from "@/types";

interface TuitionParams extends PaginationParams {
  status?: TuitionStatusFilter;
  search?: string;
  tuitionCode?: string;
  guardianPhone?: string;
}

export function useTuitions(params: TuitionParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    status,
    search,
    tuitionCode,
    guardianPhone,
  } = params;

  return useQuery({
    queryKey: ["tuitions", { page, size, sortBy, order, status, search, tuitionCode, guardianPhone }],
    queryFn: () =>
      api
        .get<ApiResponse<TuitionSummary[]>>(endpoints.TUITIONS_SUMMARY, {
          page,
          size,
          sortBy,
          order,
          ...(status && { status }),
          ...(search && { search }),
          ...(tuitionCode && { tuitionCode }),
          ...(guardianPhone && { guardianPhone }),
        })
        .then((res) => res.data),
  });
}

export function useDeleteTuition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.tuitionById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuitions"] });
    },
  });
}
