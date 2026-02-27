"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, RoleListItem, Role, PaginationParams } from "@/types";

interface RoleParams extends PaginationParams {
  search?: string;
}

export function useRoles(params: RoleParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC", search } = params;
  return useQuery({
    queryKey: ["roles", { page, size, sortBy, order, search }],
    queryFn: () =>
      api.get<ApiResponse<RoleListItem[]>>(endpoints.ROLES, {
        page, size, sortBy, order, ...(search && { search }),
      }).then((res) => res.data),
  });
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () =>
      api.get<ApiResponse<Role>>(endpoints.roleById(id)).then((res) => res.data),
    enabled: id > 0,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; permissionKeys: string[] }) =>
      api.post<ApiResponse<Role>>(endpoints.ROLES, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["roles"] }); },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string; permissionKeys?: string[] } }) =>
      api.put<ApiResponse<Role>>(endpoints.roleById(id), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["roles"] }); },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.roleById(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["roles"] }); },
  });
}
