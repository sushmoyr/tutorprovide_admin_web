"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ApiResponse,
  GuardianListItem,
  Gender,
  PaginationParams,
} from "@/types";

interface GuardianParams extends PaginationParams {
  search?: string;
  gender?: Gender;
}

export function useGuardians(params: GuardianParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    search,
    gender,
  } = params;

  return useQuery({
    queryKey: ["guardians", { page, size, sortBy, order, search, gender }],
    queryFn: () =>
      api
        .get<ApiResponse<GuardianListItem[]>>(endpoints.GUARDIANS, {
          page,
          size,
          sortBy,
          order,
          ...(search && { search }),
          ...(gender && { gender }),
        })
        .then((res) => res.data),
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.guardianById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
    },
  });
}
