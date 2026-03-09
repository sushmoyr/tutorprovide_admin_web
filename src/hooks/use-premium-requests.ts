"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams } from "@/types";
import type { PremiumRequestListItem, ApplicationReviewStatus } from "@/types/premium-request";

interface PremiumRequestParams extends PaginationParams {
  search?: string;
  status?: ApplicationReviewStatus;
  tutorId?: number;
}

export function usePremiumRequests(params: PremiumRequestParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    search,
    status,
    tutorId,
  } = params;

  return useQuery({
    queryKey: ["premiumRequests", { page, size, sortBy, order, search, status, tutorId }],
    queryFn: () =>
      api
        .get<ApiResponse<PremiumRequestListItem[]>>(endpoints.PREMIUMS, {
          page,
          size,
          sortBy,
          order,
          ...(search && { search }),
          ...(status && { status }),
          ...(tutorId && { tutorId }),
        })
        .then((res) => res.data),
  });
}
