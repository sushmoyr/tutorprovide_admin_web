"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams } from "@/types";
import type { VerificationRequestListItem } from "@/types/verification-request";
import type { ApplicationReviewStatus } from "@/types/premium-request";

interface VerificationRequestParams extends PaginationParams {
  search?: string;
  status?: ApplicationReviewStatus;
}

export function useVerificationRequests(params: VerificationRequestParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    search,
    status,
  } = params;

  return useQuery({
    queryKey: ["verificationRequests", { page, size, sortBy, order, search, status }],
    queryFn: () =>
      api
        .get<ApiResponse<VerificationRequestListItem[]>>(endpoints.VERIFICATIONS, {
          page,
          size,
          sortBy,
          order,
          ...(search && { search }),
          ...(status && { status }),
        })
        .then((res) => res.data),
  });
}
