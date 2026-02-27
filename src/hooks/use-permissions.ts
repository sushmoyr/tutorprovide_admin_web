"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Permission, PaginationParams } from "@/types";

interface PermissionParams extends PaginationParams {
  search?: string;
}

export function usePermissions(params: PermissionParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC", search } = params;
  return useQuery({
    queryKey: ["permissions", { page, size, sortBy, order, search }],
    queryFn: () =>
      api.get<ApiResponse<Permission[]>>(endpoints.PERMISSIONS, {
        page, size, sortBy, order, ...(search && { search }),
      }).then((res) => res.data),
  });
}

// Fetch ALL permissions (no pagination) for role create/edit
export function useAllPermissions() {
  return useQuery({
    queryKey: ["permissions", "all"],
    queryFn: () =>
      api.get<ApiResponse<Permission[]>>(endpoints.PERMISSIONS, {
        paginate: false,
      }).then((res) => res.data),
  });
}
