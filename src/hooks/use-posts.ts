"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams, TuitionSummary } from "@/types";

interface PostParams extends PaginationParams {
  search?: string;
  tuitionCode?: string;
}

export function usePosts(params: PostParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    search,
    tuitionCode,
  } = params;

  return useQuery({
    queryKey: ["posts", { page, size, sortBy, order, search, tuitionCode }],
    queryFn: () =>
      api
        .get<ApiResponse<TuitionSummary[]>>(endpoints.TUITIONS_SUMMARY, {
          page,
          size,
          sortBy,
          order,
          ...(search && { search }),
          ...(tuitionCode && { tuitionCode }),
        })
        .then((res) => res.data),
  });
}
