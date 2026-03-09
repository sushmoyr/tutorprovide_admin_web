"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams, EmployeeListItem } from "@/types";

interface EmployeeParams extends PaginationParams {
  searchKey?: string;
}

export function useEmployees(params: EmployeeParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "updatedAt",
    order = "DESC",
    searchKey,
  } = params;

  return useQuery({
    queryKey: ["employees", { page, size, sortBy, order, searchKey }],
    queryFn: () =>
      api
        .get<ApiResponse<EmployeeListItem[]>>(endpoints.EMPLOYEES, {
          page,
          size,
          sortBy,
          order,
          ...(searchKey && { searchKey }),
        })
        .then((res) => res.data),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.employeeById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
