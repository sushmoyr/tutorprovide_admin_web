"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams, User } from "@/types";

interface UserParams extends PaginationParams {
  search?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  userType: string;
  gender: string;
  password?: string;
}

export function useUsers(params: UserParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    search,
  } = params;

  return useQuery({
    queryKey: ["users", { page, size, sortBy, order, search }],
    queryFn: () =>
      api
        .get<ApiResponse<User[]>>(endpoints.USERS, {
          page,
          size,
          sortBy,
          order,
          ...(search && { search }),
        })
        .then((res) => res.data),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) =>
      api.post<ApiResponse<User>>(endpoints.USERS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.userById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
