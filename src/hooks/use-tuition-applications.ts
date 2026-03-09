"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams } from "@/types";
import type { TuitionApplicationListItem, ApplicationUpdateType } from "@/types/tuition-application";

interface TuitionApplicationParams extends PaginationParams {
  updateType?: ApplicationUpdateType;
  tutorName?: string;
  tuitionCode?: string;
}

export function useTuitionApplications(params: TuitionApplicationParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    updateType,
    tutorName,
    tuitionCode,
  } = params;

  return useQuery({
    queryKey: ["tuitionApplications", { page, size, sortBy, order, updateType, tutorName, tuitionCode }],
    queryFn: () =>
      api
        .get<ApiResponse<TuitionApplicationListItem[]>>(endpoints.TUITION_APPLICATIONS, {
          page,
          size,
          sortBy,
          order,
          ...(updateType && { updateType }),
          ...(tutorName && { tutorName }),
          ...(tuitionCode && { tuitionCode }),
        })
        .then((res) => res.data),
  });
}
