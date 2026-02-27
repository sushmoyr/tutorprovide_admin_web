"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, Coupon, PaginationParams } from "@/types";

export function useCoupons(params: PaginationParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC" } = params;

  return useQuery({
    queryKey: ["coupons", { page, size, sortBy, order }],
    queryFn: () =>
      api
        .get<ApiResponse<Coupon[]>>(endpoints.COUPONS, { page, size, sortBy, order })
        .then((res) => res.data),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      discountAmount: number;
      maxUsePerUser: number;
      maxUser: number;
      expiryDate: string;
    }) => api.post<ApiResponse<Coupon>>(endpoints.COUPONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        discountAmount?: number;
        maxUsePerUser?: number;
        maxUser?: number;
        expiryDate?: string;
      };
    }) => api.put<ApiResponse<Coupon>>(endpoints.couponById(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.couponById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}
